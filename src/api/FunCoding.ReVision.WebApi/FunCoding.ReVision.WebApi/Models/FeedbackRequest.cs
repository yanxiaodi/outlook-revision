namespace FunCoding.ReVision.WebApi.Models;

public class FeedbackRequest
{
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Message { get; set; }
    public required string FeedbackType { get; set; }
    public int? Rating { get; set; }
    public string? Version { get; set; }
    public string? UserAgent { get; set; }
    public string? OutlookVersion { get; set; }
    public string? Platform { get; set; }
}
