namespace FunCoding.ReVision.WebApi.Models;

public class ReviseRequest
{
    public string Draft { get; set; } = string.Empty;
    public string TargetLanguage { get; set; } = string.Empty;
    public string WritingTone { get; set; } = string.Empty;
}
