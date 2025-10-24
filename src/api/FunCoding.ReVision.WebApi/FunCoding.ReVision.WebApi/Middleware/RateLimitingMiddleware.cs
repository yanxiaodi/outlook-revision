using FunCoding.ReVision.WebApi.Services;
using Microsoft.Extensions.Options;

namespace FunCoding.ReVision.WebApi.Middleware;

/// <summary>
/// Middleware for enforcing rate limits on API requests
/// </summary>
public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RateLimitingMiddleware> _logger;
    private const string UserEmailHeader = "X-User-Email";

    public RateLimitingMiddleware(
        RequestDelegate next,
        ILogger<RateLimitingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(
        HttpContext context,
        IRateLimitService rateLimitService,
        IOptions<RateLimitingOptions> options)
    {
        // Skip rate limiting if disabled or not an API endpoint
        if (!options.Value.Enabled || !context.Request.Path.StartsWithSegments("/api"))
        {
            await _next(context);
            return;
        }

        // Skip rate limiting for feedback endpoints (user support, not AI requests)
        if (context.Request.Path.StartsWithSegments("/api/feedback"))
        {
            await _next(context);
            return;
        }

        // Extract user email from header
        if (!context.Request.Headers.TryGetValue(UserEmailHeader, out var emailValues) ||
            string.IsNullOrWhiteSpace(emailValues.FirstOrDefault()))
        {
            _logger.LogWarning(
                "Request to {Path} missing {Header} header",
                context.Request.Path, UserEmailHeader);

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new
            {
                type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                title = "Bad Request",
                status = StatusCodes.Status400BadRequest,
                detail = $"The '{UserEmailHeader}' header is required for API requests.",
                instance = context.Request.Path.ToString()
            });
            return;
        }

        var userEmail = emailValues.First()!;

        // Get reset timestamp for rate limit headers
        var resetTimestamp = rateLimitService.GetResetTimestamp();

        context.Response.Headers["X-RateLimit-Limit"] = options.Value.DailyRequestLimit.ToString();
        context.Response.Headers["X-RateLimit-Reset"] = resetTimestamp.ToString();

        // Check if user can make request
        var allowed = await rateLimitService.TryIncrementRequestAsync(userEmail);

        if (!allowed)
        {
            _logger.LogWarning(
                "Rate limit exceeded for {Email} on {Path}",
                userEmail, context.Request.Path);

            context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            context.Response.Headers["X-RateLimit-Remaining"] = "0";
            context.Response.Headers["Retry-After"] = GetRetryAfterSeconds(resetTimestamp).ToString();

            var resetTime = DateTimeOffset.FromUnixTimeSeconds(resetTimestamp);
            await context.Response.WriteAsJsonAsync(new
            {
                type = "https://tools.ietf.org/html/rfc6585#section-4",
                title = "Rate Limit Exceeded",
                status = StatusCodes.Status429TooManyRequests,
                detail = $"Daily request limit of {options.Value.DailyRequestLimit} exceeded. " +
                         $"Limit resets at {resetTime:yyyy-MM-ddTHH:mm:ssZ}",
                instance = context.Request.Path.ToString()
            });
            return;
        }

        // Update remaining count after increment
        var remaining = await rateLimitService.GetRemainingRequestsAsync(userEmail);
        context.Response.Headers["X-RateLimit-Remaining"] = remaining.ToString();

        _logger.LogDebug(
            "Request allowed for {Email}. Remaining: {Remaining}/{Limit}",
            userEmail, remaining, options.Value.DailyRequestLimit);

        await _next(context);
    }

    private static long GetRetryAfterSeconds(long resetTimestamp)
    {
        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        return Math.Max(0, resetTimestamp - now);
    }
}
