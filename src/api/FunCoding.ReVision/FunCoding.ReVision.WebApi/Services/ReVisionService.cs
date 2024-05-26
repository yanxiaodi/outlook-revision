using FunCoding.ReVision.WebApi.Contracts;
using FunCoding.ReVision.WebApi.Models;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using System.Text.Json;

namespace FunCoding.ReVision.WebApi.Services;

public class ReVisionService(Kernel kernel) : IReVisionService
{
    public async Task<TranslateResponse> TranslateAsync(TranslateRequest request)
    {
        var chatCompletionService = kernel.GetRequiredService<IChatCompletionService>();
        var chatMessages = new ChatHistory($"""
                                            You are a friendly email assistant that helps the user manage emails.
                                            Translate the email text to {request.TargetLanguage}.
                                            Your translation should be concise and accurate.
                                            """);
        chatMessages.AddUserMessage($"""
                                     The email text is:
                                     {request.Text}
                                     """);
        var promptExecutionSettings = new OpenAIPromptExecutionSettings
        {
            ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions
        };
        var translateResponse = await chatCompletionService.GetChatMessageContentsAsync(
            chatMessages,
            promptExecutionSettings,
            kernel);
        var response = new TranslateResponse(translateResponse.FirstOrDefault()?.Content ?? "", "");
        if (translateResponse.FirstOrDefault()?.Content?.Length > 1000)
        {
            chatMessages.AddUserMessage($"""
                                         Summarize the email text to {request.TargetLanguage} in five sentences.
                                         Your summary should be short, concise, and to the point.
                                         """);
            var summaryResponse = await chatCompletionService.GetChatMessageContentsAsync(
                chatMessages,
                promptExecutionSettings,
                kernel);
            response.Summary = summaryResponse.FirstOrDefault()?.Content ?? "";
        }

        return response;

    }

    public async Task<ComposeResponse> ComposeAsync(ComposeRequest request)
    {
        var chatCompletionService = kernel.GetRequiredService<IChatCompletionService>();

        var chatMessages = new ChatHistory($$"""
                                            You are a friendly email assistant that helps the user manage emails.
                                            Compose an email in {{request.TargetLanguage}}.
                                            The tone of the email should be {{request.WritingTone}}.

                                            Compose an email based on the current email and the user's input.
                                            If the current email is not provided, compose an email based on the user's input.
                                            If the user does not provide any context, compose an email to reply to the current email.
                                            The email should be concise and to the point.
                                            Return the composed email in a JSON format in the following structure and return one email JSON object only:
                                            ```json
                                            {
                                              "subject": "Your composed email subject goes here.",
                                              "body": "Your composed email body text goes here."
                                            }
                                            ```
                                            """);
        var currentEmailText = string.IsNullOrWhiteSpace(request.CurrentEmailBody)
            ? "There is no email to reply. Draft a new email."
            : $"""
               You need to reply to an email. The current email is:
               ###
               Subject: {request.CurrentEmailSubject}
               Body:
               {request.CurrentEmailBody}
               ###
               The subject of your reply must be empty.
               """;
        var userInput = string.IsNullOrWhiteSpace(request.Input)
            ? "I have no context to provide. Compose the email automatically."
            : $"""
               I have the following context:

               ###
               {request.Input}
               ###
               """;
        chatMessages.AddUserMessage($"""
                                      {currentEmailText}
                                      """);
        chatMessages.AddUserMessage($"""
                                     {userInput}
                                     """);
        var promptExecutionSettings = new OpenAIPromptExecutionSettings
        {
            ToolCallBehavior = ToolCallBehavior.EnableFunctions(new List<OpenAIFunction>(), false)
        };
        var composeResponse = await chatCompletionService.GetChatMessageContentsAsync(
            chatMessages,
            promptExecutionSettings,
            kernel);
        var responseText = composeResponse.FirstOrDefault()?.Content ?? "";
        if (string.IsNullOrWhiteSpace(responseText)) return new ComposeResponse("", "");
        var response = JsonSerializer.Deserialize<ComposeResponse>(responseText, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        });
        if (response != null)
        {
            return response;
        }
        return new ComposeResponse("", "");

    }

    public async Task<ReviseResponse> ReviseAsync(ReviseRequest request)
    {
        var chatCompletionService = kernel.GetRequiredService<IChatCompletionService>();

        var chatMessages = new ChatHistory($$"""
                                             You are a friendly email assistant that helps the user manage emails.
                                             Revise an email in {{request.TargetLanguage}}.
                                             The tone of the email should be {{request.WritingTone}}.

                                             The email should be concise and to the point.
                                             You need to give suggestions to improve the email.
                                             The suggestions include the following categories:
                                             1. Tone and Professionalism: Formality Level; Emotion Tone Detection; Positive/Negative Language.
                                             2. Grammar and Spelling: Grammar Check; Spelling Check; Punctuation Check; Sentence Structure.
                                             3. Clarity and Readability: Simplification; Conciseness; Paragraph Structure; Jargon and Acronyms.
                                             4. Engagement and Persuasiveness: Call to Action; Interest and Engagement; Persuasive Language; Personalization.
                                             5. Politeness and Etiquette: Politeness Level; Etiquette Check; Respectful Language; Cultural Sensitivity.
                                             
                                             Return the the suggestions in a JSON format in the following structure:
                                             ```json
                                             {
                                                 "suggestionCategories": [
                                                     {
                                                         "category": "Tone and Professionalism",
                                                         "suggestions": [
                                                             {
                                                                 "title": "Avoid slang or colloquial language",
                                                                 "explanation": "Phrases like **catch you later** are not appropriate in a professional setting. Consider using **Best regards** or **Sincerely** instead."
                                                             },
                                                             {
                                                                 "title": "Use full sentences",
                                                                 "explanation": "Instead of **Got it.**, consider using **I have received your message and will act on it accordingly.**"
                                             "
                                                         ]
                                                     },
                                                     {
                                                         "category": "Grammar and Spelling",
                                                         "suggestions": [
                                                             {
                                                                 "title": "Correct verb tense",
                                                                 "explanation": "Instead of **I seen that movie.**, consider using **I have seen that movie.** or **I saw that movie.**"
                                                             },
                                                             {
                                                                 "title": "Spelling Check",
                                                                 "explanation": "The word **seperate** is misspelled. The correct spelling is **separate**."
                                                             }
                                                         ]
                                                     },
                                                     {
                                                         "category": "Clarity and Readability",
                                                         "suggestions": [
                                                             {
                                                                 "title": "Improve conciseness",
                                                                 "explanation": "The phrase **At this point in time** can be shortened to **Now** to make the sentence more concise."
                                                             },
                                                             {
                                                                 "title": "Avoid jargon and acronyms",
                                                                 "explanation": "The term **ROI** might not be understood by everyone. Consider replacing it with **Return on Investment**."
                                                             }
                                                         ]
                                                     }
                                                 ]
                                             }
                                             ```
                                             If you cannot find obvious issues for a specific category, you do not need to include that category in the response.
                                             """);
        chatMessages.AddUserMessage($"""
                                     The user's email is:
                                     {request.Draft}
                                     """);
        var promptExecutionSettings = new OpenAIPromptExecutionSettings
        {
            ToolCallBehavior = ToolCallBehavior.EnableFunctions(new List<OpenAIFunction>(), false)
        };
        var composeResponse = await chatCompletionService.GetChatMessageContentsAsync(
            chatMessages,
            promptExecutionSettings,
            kernel);
        var responseText = composeResponse.FirstOrDefault()?.Content ?? "";
        if (string.IsNullOrWhiteSpace(responseText)) return new ReviseResponse();
        var response = JsonSerializer.Deserialize<ReviseResponse>(responseText, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        });
        if (response != null)
        {
            return response;
        }
        return new ReviseResponse();
    }
}
