namespace FunCoding.ReVision.WebApi.Models;

public class ComposeResponse(string subject, string body)
{
    public string Subject { get; set; } = subject;
    public string Body { get; set; } = body;
}
