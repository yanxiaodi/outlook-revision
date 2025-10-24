using System.ComponentModel.DataAnnotations;

namespace FunCoding.ReVision.WebApi.Models;

public class SuggestionRequest
{
    [Required]
    public string EmailBody { get; set; } = string.Empty;
    
    [Required]
    public string TargetLanguage { get; set; } = string.Empty;
    
    [Required]
    public string UserNativeLanguage { get; set; } = string.Empty;
    
    [Required]
    public string WritingTone { get; set; } = string.Empty;
    
    public string EmailContext { get; set; } = string.Empty;
    
    public string RecipientRelationship { get; set; } = string.Empty;
}