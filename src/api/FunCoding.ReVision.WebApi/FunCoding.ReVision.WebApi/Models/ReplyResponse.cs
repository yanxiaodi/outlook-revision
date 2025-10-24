namespace FunCoding.ReVision.WebApi.Models;

public class ReplyResponse(string body)
{
    /// <summary>
    /// Gets or sets the generated reply content.
    /// </summary>
    public string Body { get; set; } = body;
}