namespace FunCoding.ReVision.WebApi;

public class AzureOpenAIOptions
{
    public string Model { get; set; } = "gpt-4";
    public string Endpoint { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
}
