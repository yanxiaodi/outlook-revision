using FunCoding.ReVision.WebApi.Contracts;
using FunCoding.ReVision.WebApi.Models;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using System.Text;
using System.Text.Json;

namespace FunCoding.ReVision.WebApi.Services;

public class ReVisionService(Kernel kernel, ILogger<ReVisionService> logger) : IReVisionService
{

    public async Task<TranslateResponse> TranslateAsync(TranslateRequest request)
    {
        try
        {
            var executionSettings = new OpenAIPromptExecutionSettings
            {
                ResponseFormat = typeof(TranslateResponse),
                MaxTokens = 4000,
                Temperature = 0.5,
                TopP = 0,
            };
            var skPrompt = """
                           ## Role
                           You are an expert email translation assistant specializing in accurate, professional translations.
                           ## Task
                           Translate the provided email text from its original language to {{$targetLanguage}}.
                           ## Requirements
                           - Maintain the original tone and formality level (formal business, casual, friendly, etc.)
                           - Preserve email-specific elements (greetings, closings, signatures)
                           - Keep proper nouns, company names, and technical terms appropriately
                           - Ensure cultural appropriateness for the target language
                           - Output ONLY in {{$targetLanguage}} - no explanations or meta-commentary
                           - Maintain the original formatting and structure

                           ## Input Email Text:
                           {{$input}}

                           ## Translation ({{$targetLanguage}} only):
                           """;
            var translateFunction = kernel.CreateFunctionFromPrompt(skPrompt, executionSettings);
            var arguments = new KernelArguments() { ["input"] = request.EmailBody, ["targetLanguage"] = request.TargetLanguage };
            var translateResponse = await kernel.InvokeAsync(translateFunction, arguments);
            var result = translateResponse.ToString();
            var response = JsonSerializer.Deserialize<TranslateResponse>(result);

            if (response == null)
            {
                logger.LogWarning("Translation response deserialization failed. Raw response: {Response}", translateResponse.ToString());
                return new TranslateResponse("Translation failed: Unable to parse AI response");
            }

            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error translating text");
            return new TranslateResponse("Translation failed due to an error");
        }
    }

    public async Task<ComposeResponse> ComposeAsync(ComposeRequest request)
    {
        try
        {
            var executionSettings = new OpenAIPromptExecutionSettings
            {
                ResponseFormat = typeof(ComposeResponse),
                MaxTokens = 4000,
                Temperature = 0.5,
                TopP = 0,
            };

            // Compose new email scenario - generate both subject and body
            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine("## Role");
            promptBuilder.AppendLine("You are an expert email composition assistant specializing in crafting emails from scratch.");
            promptBuilder.AppendLine("## Task");
            promptBuilder.AppendLine("Write a NEW email in {{$targetLanguage}} based on the user's intentions described in the context below. The context describes what the user wants to communicate, NOT an email to reply to.");
            promptBuilder.AppendLine("## Important Instructions");
            promptBuilder.AppendLine("- The context below contains the USER'S INTENTIONS and WHAT THEY WANT TO COMMUNICATE");
            promptBuilder.AppendLine("- You need to COMPOSE A NEW EMAIL based on these intentions");
            promptBuilder.AppendLine("- DO NOT treat the context as an email to reply to - treat it as instructions for what to write");
            promptBuilder.AppendLine("- Transform the user's intentions into a proper, well-structured email");
            promptBuilder.AppendLine("## Requirements");
            promptBuilder.AppendLine("- Generate a clear, concise, and relevant subject line based on the user's intentions");
            promptBuilder.AppendLine("- Create a complete email body including appropriate greeting and closing");

            if (!string.IsNullOrWhiteSpace(request.RecipientName))
            {
                promptBuilder.AppendLine("- Address the email to {{$recipientName}} using an appropriate greeting");
                promptBuilder.AppendLine("- Personalize the content for the specified recipient when relevant");
            }
            else
            {
                promptBuilder.AppendLine("- Use a placeholder greeting (e.g., \"Hello,\" or \"Hi there,\")");
            }

            if (!string.IsNullOrWhiteSpace(request.RecipientRelationship))
            {
                promptBuilder.AppendLine("- Adjust the tone and formality based on the relationship with the recipient: {{$recipientRelationship}}");
                promptBuilder.AppendLine("- The relationship context should guide how formal or casual the email should be");
            }

            promptBuilder.AppendLine("- Transform the user's intentions/context into professional email content");
            promptBuilder.AppendLine("- Maintain a {{$writingTone}} tone throughout the email");
            promptBuilder.AppendLine("- Ensure clarity and conciseness");
            promptBuilder.AppendLine("- Use proper grammar and spelling");
            promptBuilder.AppendLine("- Format the email with appropriate structure (greeting, body, closing)");
            promptBuilder.AppendLine("- Output ONLY in {{$targetLanguage}} - no explanations or meta-commentary");

            if (!string.IsNullOrWhiteSpace(request.RecipientName))
            {
                promptBuilder.AppendLine("## Recipient Name:");
                promptBuilder.AppendLine("{{$recipientName}}");
            }

            if (!string.IsNullOrWhiteSpace(request.RecipientRelationship))
            {
                promptBuilder.AppendLine("## Relationship with Recipient:");
                promptBuilder.AppendLine("{{$recipientRelationship}}");
            }

            promptBuilder.AppendLine("## User's Intentions/What They Want to Communicate:");
            promptBuilder.AppendLine("{{$context}}");
            promptBuilder.AppendLine("## Your Task:");
            promptBuilder.AppendLine("Write a new email based on the user's intentions above. Generate both subject and body in {{$targetLanguage}}:");

            var skPrompt = promptBuilder.ToString();

            var arguments = new KernelArguments()
            {
                ["context"] = request.Context,
                ["targetLanguage"] = request.TargetLanguage,
                ["writingTone"] = request.WritingTone
            };

            if (!string.IsNullOrWhiteSpace(request.RecipientName))
            {
                arguments["recipientName"] = request.RecipientName;
            }

            if (!string.IsNullOrWhiteSpace(request.RecipientRelationship))
            {
                arguments["recipientRelationship"] = request.RecipientRelationship;
            }

            var composeFunction = kernel.CreateFunctionFromPrompt(skPrompt, executionSettings);
            var composeResponse = await kernel.InvokeAsync(composeFunction, arguments);
            var response = JsonSerializer.Deserialize<ComposeResponse>(composeResponse.ToString());

            if (response == null)
            {
                logger.LogWarning("Compose response deserialization failed. Raw response: {Response}", composeResponse.ToString());
                return new ComposeResponse("", "Composition failed: Unable to parse AI response");
            }

            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error composing email");
            return new ComposeResponse("", "Composition failed due to an error");
        }
    }

    public async Task<ReplyResponse> ReplyAsync(ReplyRequest request)
    {
        try
        {
            var executionSettings = new OpenAIPromptExecutionSettings
            {
                ResponseFormat = typeof(ReplyResponse),
                MaxTokens = 4000,
                Temperature = 0.5,
                TopP = 0,
            };

            // Reply to existing email scenario
            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine("## Role");
            promptBuilder.AppendLine("You are an expert email composition assistant specializing in crafting email replies.");
            promptBuilder.AppendLine("## Task");
            promptBuilder.AppendLine("Based on the provided email information, compose a thoughtful and contextually appropriate reply to this email in {{$targetLanguage}}.");
            promptBuilder.AppendLine("## Requirements");
            promptBuilder.AppendLine("- Address key points from the original email");
            promptBuilder.AppendLine("- Maintain a {{$writingTone}} tone throughout the reply");

            if (!string.IsNullOrWhiteSpace(request.Context))
            {
                promptBuilder.AppendLine("- Include relevant context provided in the \"Context for Reply\" field");
            }

            promptBuilder.AppendLine("- Ensure clarity and conciseness");
            promptBuilder.AppendLine("- Use proper grammar and spelling");
            promptBuilder.AppendLine("- Format the email with appropriate greetings and closings");
            promptBuilder.AppendLine("- Output ONLY in {{$targetLanguage}} - no explanations or meta-commentary");

            if (!string.IsNullOrWhiteSpace(request.EmailSubject))
            {
                promptBuilder.AppendLine("## Original Email Subject:");
                promptBuilder.AppendLine("{{$emailSubject}}");
            }

            promptBuilder.AppendLine("## Original Email Body:");
            promptBuilder.AppendLine("{{$emailBody}}");

            if (!string.IsNullOrWhiteSpace(request.Context))
            {
                promptBuilder.AppendLine("## Context for Reply:");
                promptBuilder.AppendLine("{{$context}}");
            }

            promptBuilder.AppendLine("## Composed Reply ({{$targetLanguage}} only - no subject needed):");

            var skPrompt = promptBuilder.ToString();

            var arguments = new KernelArguments()
            {
                ["emailBody"] = request.EmailBody,
                ["targetLanguage"] = request.TargetLanguage,
                ["writingTone"] = request.WritingTone
            };

            if (!string.IsNullOrWhiteSpace(request.EmailSubject))
            {
                arguments["emailSubject"] = request.EmailSubject;
            }

            if (!string.IsNullOrWhiteSpace(request.Context))
            {
                arguments["context"] = request.Context;
            }

            var replyFunction = kernel.CreateFunctionFromPrompt(skPrompt, executionSettings);
            var replyResponse = await kernel.InvokeAsync(replyFunction, arguments);
            var response = JsonSerializer.Deserialize<ReplyResponse>(replyResponse.ToString());

            if (response == null)
            {
                logger.LogWarning("Reply response deserialization failed. Raw response: {Response}", replyResponse.ToString());
                return new ReplyResponse("Reply generation failed: Unable to parse AI response");
            }

            return response;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error generating reply");
            return new ReplyResponse("Reply generation failed due to an error");
        }
    }

    public async Task<SuggestionResponse> SuggestAsync(SuggestionRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            // Check if native language is different from target language
            var includeLinguisticHelp = !request.UserNativeLanguage.Equals(request.TargetLanguage, StringComparison.OrdinalIgnoreCase);

            var hasEmailContext = !string.IsNullOrWhiteSpace(request.EmailContext);
            var hasRecipientRelationship = !string.IsNullOrWhiteSpace(request.RecipientRelationship);

            // Build the prompt
            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine("## Role");

            if (includeLinguisticHelp)
            {
                promptBuilder.AppendLine("You are an expert email writing coach providing comprehensive analysis and suggestions organized by categories, with cross-linguistic support.");
                promptBuilder.AppendLine();
                promptBuilder.AppendLine("## Task");
                promptBuilder.AppendLine("Analyze the email draft and provide suggestions organized by categories. Since the user's native language ({{$userNativeLanguage}}) differs from the target language ({{$targetLanguage}}), provide explanations in their native language when helpful.");
            }
            else
            {
                promptBuilder.AppendLine("You are an expert email writing coach providing comprehensive analysis and suggestions organized by categories.");
                promptBuilder.AppendLine();
                promptBuilder.AppendLine("## Task");
                promptBuilder.AppendLine("Analyze the email draft and provide suggestions organized by categories for better usability.");
            }

            promptBuilder.AppendLine();
            promptBuilder.AppendLine("## Context");
            promptBuilder.AppendLine("- Target Language: {{$targetLanguage}}");
            promptBuilder.AppendLine("- Writing Tone: {{$writingTone}}");
            promptBuilder.AppendLine("- User Native Language: {{$userNativeLanguage}}");

            if (hasEmailContext)
            {
                promptBuilder.AppendLine("- Email Context: {{$emailContext}}");
            }

            if (hasRecipientRelationship)
            {
                promptBuilder.AppendLine("- Recipient Relationship: {{$recipientRelationship}}");
            }

            promptBuilder.AppendLine();
            promptBuilder.AppendLine("## Email Draft:");
            promptBuilder.AppendLine("{{$emailBody}}");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("## Analysis Requirements");
            promptBuilder.AppendLine("Analyze the email and organize suggestions into these categories:");
            promptBuilder.AppendLine("- Grammar: Grammar errors, spelling mistakes, and syntactic issues");
            promptBuilder.AppendLine("- Clarity: Word choice, sentence structure, flow, and readability issues");
            promptBuilder.AppendLine("- Tone: Tone consistency, formality level, and emotional appropriateness");
            promptBuilder.AppendLine("- Etiquette: Politeness, professional courtesy, and cultural appropriateness");
            promptBuilder.AppendLine("- Engagement: Personalization, call-to-action effectiveness, persuasiveness, and reader engagement");
            promptBuilder.AppendLine("- Structure: Organization, formatting, opening/closing, and email structure");
            promptBuilder.AppendLine("- Conciseness: Wordiness, redundancy, and opportunities to be more succinct");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("## Output Requirements");
            promptBuilder.AppendLine("Structure the response with SuggestionCategories containing:");
            promptBuilder.AppendLine("- CategoryName: Short identifier (e.g., \"grammar\", \"clarity\", \"tone\", \"etiquette\", \"structure\", \"conciseness\")");
            promptBuilder.AppendLine("- CategoryTitle: User-friendly title (e.g., \"Grammar & Spelling\", \"Clarity & Readability\")");
            promptBuilder.AppendLine("- Suggestions: List of suggestions for this category");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("For each suggestion, provide:");
            promptBuilder.AppendLine("- Id: Unique identifier");

            if (includeLinguisticHelp)
            {
                promptBuilder.AppendLine("- Title: Clear title describing the issue (in {{$targetLanguage}})");
                promptBuilder.AppendLine("- Description: Detailed description of what needs improvement (in {{$targetLanguage}})");
                promptBuilder.AppendLine("- SuggestionText: Specific suggestion for how to fix it (in {{$targetLanguage}})");
                promptBuilder.AppendLine("- Severity: Level (high/medium/low)");
                promptBuilder.AppendLine("- Examples: If helpful (in {{$targetLanguage}})");
                promptBuilder.AppendLine("- SuggestionTextInUserNativeLanguage: Additional explanation or cultural context in {{$userNativeLanguage}} to help the user understand the suggestion better");
                promptBuilder.AppendLine();
                promptBuilder.AppendLine("Also provide an overall quality score (1-10) and assessment in {{$targetLanguage}}.");
                promptBuilder.AppendLine();
                promptBuilder.AppendLine("The SuggestionTextInUserNativeLanguage should explain WHY this suggestion matters culturally or linguistically, especially when there are differences between {{$userNativeLanguage}} and {{$targetLanguage}} conventions.");
            }
            else
            {
                promptBuilder.AppendLine("- Title: Clear title describing the issue");
                promptBuilder.AppendLine("- Description: Detailed description of what needs improvement");
                promptBuilder.AppendLine("- SuggestionText: Specific suggestion for how to fix it");
                promptBuilder.AppendLine("- Severity: Level (high/medium/low)");
                promptBuilder.AppendLine("- Examples: If helpful");
                promptBuilder.AppendLine();
                promptBuilder.AppendLine("Also provide an overall quality score (1-10) and assessment.");
            }

            var prompt = promptBuilder.ToString();

            var executionSettings = new OpenAIPromptExecutionSettings
            {
                ResponseFormat = typeof(SuggestionResponse),
                MaxTokens = includeLinguisticHelp ? 3000 : 2000,
                Temperature = 0.3
            };

            var arguments = new KernelArguments()
            {
                ["emailBody"] = request.EmailBody,
                ["targetLanguage"] = request.TargetLanguage,
                ["writingTone"] = request.WritingTone,
                ["userNativeLanguage"] = request.UserNativeLanguage
            };

            if (hasEmailContext)
            {
                arguments["emailContext"] = request.EmailContext;
            }

            if (hasRecipientRelationship)
            {
                arguments["recipientRelationship"] = request.RecipientRelationship;
            }

            var function = kernel.CreateFunctionFromPrompt(prompt, executionSettings);
            var result = await kernel.InvokeAsync(function, arguments, cancellationToken);

            var aiResponse = JsonSerializer.Deserialize<SuggestionResponse>(result.ToString());

            return aiResponse ?? new SuggestionResponse
            {
                OverallScore = 7,
                OverallAssessment = "Analysis completed",
                SuggestionCategories = new List<SuggestionCategory>()
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting suggestions");
            return new SuggestionResponse
            {
                OverallScore = 0,
                OverallAssessment = "Analysis failed due to an error",
                SuggestionCategories = new List<SuggestionCategory>()
            };
        }
    }

    public async Task<RevisionResponse> ReviseTextAsync(RevisionRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var selectedSuggestions = string.Join("\n", request.SelectedSuggestions.Select(s => $"- {s.Title}: {s.SuggestionText}"));

            var hasEmailContext = !string.IsNullOrWhiteSpace(request.EmailContext);
            var hasRecipientRelationship = !string.IsNullOrWhiteSpace(request.RecipientRelationship);

            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine("## Role");
            promptBuilder.AppendLine("You are an expert email revision specialist focused on implementing specific improvements.");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("## Task");
            promptBuilder.AppendLine("Revise the provided email draft by applying the selected suggestions while maintaining the original intent and personal voice.");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("## Revision Guidelines");
            promptBuilder.AppendLine("- Apply ONLY the selected suggestions provided");
            promptBuilder.AppendLine("- Preserve the author's personal voice and style preferences");
            promptBuilder.AppendLine("- Maintain the original meaning and intent");
            promptBuilder.AppendLine("- Ensure all changes enhance readability and effectiveness");
            promptBuilder.AppendLine("- Keep cultural sensitivity in mind");
            promptBuilder.AppendLine("- Provide clean, polished output without tracked changes");
            promptBuilder.AppendLine("- Maintain consistency with the desired writing tone: {{$writingTone}}");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("## Selected Suggestions to Apply:");
            promptBuilder.AppendLine("{{$selectedSuggestions}}");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("## Original Email Context:");
            promptBuilder.AppendLine("- Writing Tone: {{$writingTone}}");
            promptBuilder.AppendLine("- Target Language: {{$targetLanguage}}");
            promptBuilder.AppendLine("- User Native Language: {{$userNativeLanguage}}");

            if (hasEmailContext)
            {
                promptBuilder.AppendLine("- Email Context: {{$emailContext}}");
            }

            if (hasRecipientRelationship)
            {
                promptBuilder.AppendLine("- Recipient Relationship: {{$recipientRelationship}}");
            }

            promptBuilder.AppendLine();
            promptBuilder.AppendLine("## Original Email Draft:");
            promptBuilder.AppendLine("{{$originalEmailBody}}");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("## Output Requirements:");
            promptBuilder.AppendLine("- Provide ONLY the complete revised email text");
            promptBuilder.AppendLine("- Maintain original formatting structure");
            promptBuilder.AppendLine("- Ensure professional polish while preserving authenticity");
            promptBuilder.AppendLine("- Do not include explanations, comments, or metadata");

            var prompt = promptBuilder.ToString();

            var executionSettings = new OpenAIPromptExecutionSettings
            {
                ResponseFormat = typeof(TextRevisionResponse),
                MaxTokens = 2500,
                Temperature = 0.2
            };

            var arguments = new KernelArguments()
            {
                ["originalEmailBody"] = request.OriginalEmailBody,
                ["selectedSuggestions"] = selectedSuggestions,
                ["writingTone"] = request.WritingTone,
                ["targetLanguage"] = request.TargetLanguage,
                ["userNativeLanguage"] = request.UserNativeLanguage
            };

            if (hasEmailContext)
            {
                arguments["emailContext"] = request.EmailContext;
            }

            if (hasRecipientRelationship)
            {
                arguments["recipientRelationship"] = request.RecipientRelationship;
            }

            var function = kernel.CreateFunctionFromPrompt(prompt, executionSettings);
            var result = await kernel.InvokeAsync(function, arguments, cancellationToken);

            var aiResponse = JsonSerializer.Deserialize<TextRevisionResponse>(result.ToString());

            string revisedText;
            if (aiResponse?.RevisedEmailBody != null)
            {
                revisedText = aiResponse.RevisedEmailBody;
            }
            else
            {
                logger.LogWarning("Revision response deserialization failed or missing RevisedEmailBody. Raw response: {Response}", result.ToString());
                revisedText = result.ToString().Trim();
            }

            return new RevisionResponse
            {
                RevisedEmailBody = revisedText,
                AppliedSuggestions = request.SelectedSuggestions.Select(s => s.Title).ToList(),
                Summary = $"Applied {request.SelectedSuggestions.Count} improvements"
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error revising text");
            return new RevisionResponse
            {
                RevisedEmailBody = request.OriginalEmailBody,
                AppliedSuggestions = new List<string>(),
                Summary = "Revision failed"
            };
        }
    }

}