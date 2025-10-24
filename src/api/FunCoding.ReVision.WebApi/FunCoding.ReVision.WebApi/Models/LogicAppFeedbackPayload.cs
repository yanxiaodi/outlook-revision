namespace FunCoding.ReVision.WebApi.Models;

/// <summary>
/// Payload sent to Azure Logic Apps for feedback email
/// </summary>
public class LogicAppFeedbackPayload
{
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Message { get; set; }
    public required string FeedbackType { get; set; }
    public int? Rating { get; set; }
    public required string Timestamp { get; set; } // ISO 8601 format
    public string? Version { get; set; }
    public string? UserAgent { get; set; }
    public string? OutlookVersion { get; set; }
    public string? Platform { get; set; }
}
