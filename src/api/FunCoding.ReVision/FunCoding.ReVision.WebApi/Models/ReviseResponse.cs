namespace FunCoding.ReVision.WebApi.Models;

public class ReviseResponse
{
    public List<SuggestionCategory> SuggestionCategories { get; set; } = new();
}

public class SuggestionCategory
{
    public string Category { get; set; } = string.Empty;
    public List<Suggestion> Suggestions { get; set; } = new();
}

public class Suggestion
{
    public string Title { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
}
