using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace FunCoding.ReVision.WebApi.Services;

/// <summary>
/// In-memory implementation of rate limiting service
/// Uses MemoryCache to track request counts per user per day
/// </summary>
public class InMemoryRateLimitService : IRateLimitService
{
    private readonly IMemoryCache _cache;
    private readonly RateLimitingOptions _options;
    private readonly ILogger<InMemoryRateLimitService> _logger;
    private static readonly SemaphoreSlim _semaphore = new(1, 1);

    public InMemoryRateLimitService(
        IMemoryCache cache,
        IOptions<RateLimitingOptions> options,
        ILogger<InMemoryRateLimitService> logger)
    {
        _cache = cache;
        _options = options.Value;
        _logger = logger;

        // Debug logging to verify configuration is loaded correctly
        _logger.LogInformation(
            "InMemoryRateLimitService initialized with DailyRequestLimit: {Limit}, Enabled: {Enabled}",
            _options.DailyRequestLimit, _options.Enabled);
    }

    public async Task<bool> TryIncrementRequestAsync(string userEmail)
    {
        if (string.IsNullOrWhiteSpace(userEmail))
        {
            _logger.LogWarning("Rate limit check attempted with empty email");
            return false;
        }

        var cacheKey = GetCacheKey(userEmail);

        // Use semaphore to ensure thread-safe increment operation
        await _semaphore.WaitAsync();
        try
        {
            var currentCount = _cache.GetOrCreate(cacheKey, entry =>
            {
                // Set expiration to midnight UTC (start of next day)
                var now = DateTime.UtcNow;
                var midnight = now.Date.AddDays(1);
                entry.AbsoluteExpiration = midnight;

                _logger.LogInformation(
                    "Created new rate limit counter for {Email}. Expires at {ExpirationTime} UTC",
                    userEmail, midnight);

                return 0;
            });

            if (currentCount >= _options.DailyRequestLimit)
            {
                _logger.LogWarning(
                    "Rate limit exceeded for {Email}. Current: {Current}, Limit: {Limit}",
                    userEmail, currentCount, _options.DailyRequestLimit);
                return false;
            }

            // Increment the counter
            var newCount = currentCount + 1;
            _cache.Set(cacheKey, newCount, GetCacheEntryOptions());

            _logger.LogDebug(
                "Request counted for {Email}. Count: {Count}/{Limit}",
                userEmail, newCount, _options.DailyRequestLimit);

            return true;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public Task<int> GetRemainingRequestsAsync(string userEmail)
    {
        if (string.IsNullOrWhiteSpace(userEmail))
        {
            return Task.FromResult(_options.DailyRequestLimit);
        }

        var cacheKey = GetCacheKey(userEmail);
        var currentCount = _cache.Get<int>(cacheKey);
        var remaining = Math.Max(0, _options.DailyRequestLimit - currentCount);

        return Task.FromResult(remaining);
    }

    public long GetResetTimestamp()
    {
        var midnight = DateTime.UtcNow.Date.AddDays(1);
        return new DateTimeOffset(midnight).ToUnixTimeSeconds();
    }

    private string GetCacheKey(string userEmail)
    {
        var date = DateTime.UtcNow.ToString("yyyy-MM-dd");
        return $"ratelimit:{userEmail.ToLowerInvariant()}:{date}";
    }

    private MemoryCacheEntryOptions GetCacheEntryOptions()
    {
        var now = DateTime.UtcNow;
        var midnight = now.Date.AddDays(1);

        return new MemoryCacheEntryOptions
        {
            AbsoluteExpiration = midnight,
            Priority = CacheItemPriority.Normal
        };
    }
}
