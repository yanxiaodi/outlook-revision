namespace FunCoding.ReVision.WebApi.Models;

public class ComposeRequest
{
    public string CurrentEmailSubject { get; set; } = string.Empty;
    public string CurrentEmailBody { get; set; } = string.Empty;
    public string Input { get; set; } = string.Empty;
    public string TargetLanguage { get; set; } = string.Empty;
    public string WritingTone { get; set; } = string.Empty;
}
