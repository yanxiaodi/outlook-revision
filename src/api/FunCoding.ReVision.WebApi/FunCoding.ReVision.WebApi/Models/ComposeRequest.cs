namespace FunCoding.ReVision.WebApi.Models;

public class ComposeRequest(string context, string targetLanguage, string writingTone, string? recipientName = null, string? recipientRelationship = null)
{
    /// <summary>
    /// The context describing what the user wants to communicate in the email.
    /// </summary>
    /// <remarks>This should contain the user's intentions, purpose, and key points for the email.
    /// For example: "I need to request a day off tomorrow due to illness" or "Schedule a meeting to discuss the project".</remarks>
    public string Context { get; set; } = context;

    /// <summary>
    /// Gets or sets the language code representing the target language for email composition.
    /// </summary>
    /// <remarks>The language code should follow standard conventions, such as ISO 639-1 (e.g., "en" for
    /// English, "fr" for French). This determines the language of the generated email.</remarks>
    public string TargetLanguage { get; set; } = targetLanguage;

    /// <summary>
    /// Gets or sets the writing tone to be used for the composed email.
    /// </summary>
    /// <remarks>Specify the desired tone, such as "professional", "friendly", or "formal", to influence the style
    /// of the email. The value should be a descriptive string that clearly indicates the intended tone.</remarks>
    public string WritingTone { get; set; } = writingTone;

    /// <summary>
    /// Gets or sets the recipient's name for email composition.
    /// </summary>
    /// <remarks>Optional parameter. When provided, the recipient's name will be used 
    /// to personalize the email greeting and content. If not provided or empty, a generic greeting will be used.</remarks>
    public string? RecipientName { get; set; } = recipientName;

    /// <summary>
    /// Gets or sets the relationship with the recipient for email composition.
    /// </summary>
    /// <remarks>Optional parameter. When provided, the relationship context (e.g., "colleague", "client", "manager", "friend") 
    /// will be used to adjust the formality and style of the email. If not provided, the tone will be determined solely by WritingTone.</remarks>
    public string? RecipientRelationship { get; set; } = recipientRelationship;
}
