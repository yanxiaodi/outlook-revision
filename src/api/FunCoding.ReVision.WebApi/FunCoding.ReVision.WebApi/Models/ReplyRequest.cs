namespace FunCoding.ReVision.WebApi.Models;

public class ReplyRequest(string emailSubject, string emailBody, string targetLanguage, string writingTone, string? context = null)
{
    /// <summary>
    /// The subject of the original email being replied to.
    /// </summary>
    public string EmailSubject { get; set; } = emailSubject;

    /// <summary>
    /// The body of the original email being replied to.
    /// </summary>
    public string EmailBody { get; set; } = emailBody;

    /// <summary>
    /// Gets or sets the language code representing the target language for the reply.
    /// </summary>
    /// <remarks>The language code should follow standard conventions, such as ISO 639-1 (e.g., "en" for
    /// English, "fr" for French). This determines the language of the generated reply.</remarks>
    public string TargetLanguage { get; set; } = targetLanguage;

    /// <summary>
    /// Gets or sets the writing tone to be used for the reply.
    /// </summary>
    /// <remarks>Specify the desired tone, such as "formal", "informal", or "neutral", to influence the style
    /// of the reply. The value should be a descriptive string that clearly indicates the intended tone.</remarks>
    public string WritingTone { get; set; } = writingTone;

    /// <summary>
    /// Optional context for the reply, such as specific instructions or additional information to include.
    /// </summary>
    /// <remarks>Provide any additional context that should be considered when generating the reply,
    /// such as meeting details, specific points to address, or special instructions.</remarks>
    public string? Context { get; set; } = context;
}