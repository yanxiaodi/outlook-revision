using System.ComponentModel.DataAnnotations;

namespace FunCoding.ReVision.WebApi.Models;

public class RevisionRequest
{
    [Required]
    public string OriginalEmailBody { get; set; } = string.Empty;
    
    [Required]
    public string TargetLanguage { get; set; } = string.Empty;
    
    [Required]
    public string UserNativeLanguage { get; set; } = string.Empty;
    
    [Required]
    public string WritingTone { get; set; } = string.Empty;
    
    [Required]
    public List<SuggestionItem> SelectedSuggestions { get; set; } = new();
    
    public string EmailContext { get; set; } = string.Empty;
    
    public string RecipientRelationship { get; set; } = string.Empty;
}