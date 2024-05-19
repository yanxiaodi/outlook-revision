namespace FunCoding.ReVision.WebApi.Models;

public class TranslateRequest(string text, string targetLanguage, string? sourceLanguage = null)
{
    public string Text { get; set; } = text;
    public string? SourceLanguage { get; set; } = sourceLanguage;
    public string TargetLanguage { get; set; } = targetLanguage;
}
