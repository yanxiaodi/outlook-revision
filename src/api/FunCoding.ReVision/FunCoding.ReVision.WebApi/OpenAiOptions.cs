namespace FunCoding.ReVision.WebApi;

public class OpenAiOptions
{
    public const string SectionName = "OpenAiOptions";
    public string Model { get; set; } = "gpt-35-turbo-16k";
    public string Endpoint { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
}
