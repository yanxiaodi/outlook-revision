namespace FunCoding.ReVision.WebApi.Models;

public class ComposeResponse(string subject, string body)
{
    /// <summary>
    /// Gets or sets the subject line of the message.
    /// </summary>
    public string Subject { get; set; } = subject;

    /// <summary>
    /// Gets or sets the main textual content associated with the object.
    /// </summary>
    public string Body { get; set; } = body;

}