namespace FunCoding.ReVision.WebApi.Models;

public class TranslateRequest(string emailBody, string targetLanguage)
{
    public string EmailBody { get; set; } = emailBody;
    public string TargetLanguage { get; set; } = targetLanguage;
}
