namespace FunCoding.ReVision.WebApi.Models;

public class SuggestionResponse
{
    public int OverallScore { get; set; }
    public string OverallAssessment { get; set; } = string.Empty;
    public List<SuggestionCategory> SuggestionCategories { get; set; } = new();
}

public class SuggestionCategory
{
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryTitle { get; set; } = string.Empty;
    public List<SuggestionItem> Suggestions { get; set; } = new();
}

public class SuggestionItem
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SuggestionText { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public SuggestionTextPosition? Position { get; set; }
    public List<string> Examples { get; set; } = new();
    public string? SuggestionTextInUserNativeLanguage { get; set; }
}

public class SuggestionTextPosition
{
    public int Start { get; set; }
    public int End { get; set; }
    public string OriginalText { get; set; } = string.Empty;
}