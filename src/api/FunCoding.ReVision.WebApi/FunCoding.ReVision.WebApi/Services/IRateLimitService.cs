namespace FunCoding.ReVision.WebApi.Services;

/// <summary>
/// Service for managing rate limiting per user
/// </summary>
public interface IRateLimitService
{
    /// <summary>
    /// Checks if a user can make a request and increments their counter if allowed
    /// </summary>
    /// <param name="userEmail">User's email address</param>
    /// <returns>True if request is allowed, false if rate limit exceeded</returns>
    Task<bool> TryIncrementRequestAsync(string userEmail);

    /// <summary>
    /// Gets the number of remaining requests for a user today
    /// </summary>
    /// <param name="userEmail">User's email address</param>
    /// <returns>Number of remaining requests</returns>
    Task<int> GetRemainingRequestsAsync(string userEmail);

    /// <summary>
    /// Gets the timestamp when the rate limit will reset (midnight UTC)
    /// </summary>
    /// <returns>Unix timestamp of next reset</returns>
    long GetResetTimestamp();
}
