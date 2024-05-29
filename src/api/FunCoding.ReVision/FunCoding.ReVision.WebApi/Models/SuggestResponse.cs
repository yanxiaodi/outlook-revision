namespace FunCoding.ReVision.WebApi.Models;

public class SuggestResponse
{
    public List<SuggestionCategory> SuggestionCategories { get; set; } = new();
}

public class SuggestionCategory
{
    public string Category { get; set; } = string.Empty;
    public string CategoryInUserLanguage { get; set; } = string.Empty;
    public List<Suggestion> Suggestions { get; set; } = new();
}

public class Suggestion
{
    public bool NeedsAttention { get; set; } = false;
    public string Title { get; set; } = string.Empty;
    public string TitleInUserLanguage { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public string ExplanationInUserLanguage { get; set; } = string.Empty;
}
