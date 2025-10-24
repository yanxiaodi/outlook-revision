namespace FunCoding.ReVision.WebApi.Models;

public class TranslateResponse(string text)
{
    public string Text { get; set; } = text;
    //public string Summary { get; set; } = summary;
}
