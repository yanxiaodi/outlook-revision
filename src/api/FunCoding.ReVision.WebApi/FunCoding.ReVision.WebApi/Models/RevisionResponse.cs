namespace FunCoding.ReVision.WebApi.Models;

public class RevisionResponse
{
    public string RevisedEmailBody { get; set; } = string.Empty;
    public List<string> AppliedSuggestions { get; set; } = new();
    public string Summary { get; set; } = string.Empty;
}