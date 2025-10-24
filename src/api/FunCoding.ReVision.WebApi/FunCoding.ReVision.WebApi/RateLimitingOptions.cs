namespace FunCoding.ReVision.WebApi;

/// <summary>
/// Configuration options for rate limiting
/// </summary>
public class RateLimitingOptions
{
    /// <summary>
    /// Maximum number of requests allowed per user per day
    /// </summary>
    public int DailyRequestLimit { get; set; } = 100;

    /// <summary>
    /// Whether rate limiting is enabled
    /// </summary>
    public bool Enabled { get; set; } = true;
}
