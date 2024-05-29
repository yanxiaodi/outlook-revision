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

    public async Task<SuggestResponse> SuggestAsync(SuggestRequest request)
    {
        var chatCompletionService = kernel.GetRequiredService<IChatCompletionService>();

        var chatMessages = new ChatHistory($$"""
                                             You are a friendly email assistant that helps the user manage emails.
                                             Revise an email in {{request.TargetLanguage}}.
                                             The tone of the email should be **{{request.WritingTone}}**.

                                             The email should be concise and to the point.
                                             You need to give suggestions to improve the email.
                                             Note the desired tone. Users may not always want professional tones. The suggestions include the following categories:
                                             
                                             1. Tone and Manner: Writing Tone; Emotion Tone Detection; Positive/Negative Language, etc.
                                             2. Grammar and Spelling: Grammar Check; Spelling Check; Punctuation Check; Sentence Structure, etc.
                                             3. Clarity and Readability: Simplification; Conciseness; Paragraph Structure; Jargon and Acronyms, etc.
                                             4. Engagement and Persuasiveness: Call to Action; Interest and Engagement; Persuasive Language; Personalization, etc.
                                             5. Politeness and Etiquette: Politeness Level; Etiquette Check; Respectful Language; Cultural Sensitivity, etc.
                                             
                                             For each suggestion, provide a title and an explanation, which explains why the suggestion is important and how it can be improved.
                                             If the user's language: {{request.UserLanguage}} is different from the target language: {{request.TargetLanguage}}, consider cultural differences and language nuances. Also, include suggestion in the user's language in the `ExplanationInUserLanguage` field, but do not translate the revised text.
                                             If the user's language is the same as the target language, provide suggestions in the target language only, and leave the `ExplanationInUserLanguage` field empty.
                                             If the suggestion can be revised, make the `needsAttention` field `true`.
                                             If you cannot find obvious issues for a specific category, add a positive feedback and encouragement for this category, also make the `needsAttention` field `false`.
                                             
                                             Here is an example. The target language is English, and the user's language is Chinese Simplified. Return the the suggestions in a JSON format as the following structure:
                                             ```json
                                             {
                                                 "suggestionCategories": [
                                                     {
                                                         "category": "Tone and Manner",
                                                         "categoryInUserLanguage": "语气与风格",
                                                         "suggestions": [
                                                             {
                                                                 "needsAttention": true,
                                                                 "title": "Avoid slang or colloquial language",
                                                                 "titleInUserLanguage": "避免使用俚语或口语",
                                                                 "explanation": "Phrases like **catch you later** are not appropriate in a professional setting. Consider using **Best regards** or **Sincerely** instead.",
                                                                 "explanationInUserLanguage": "**Catch you later** 这样的短语在专业环境中不太合适。考虑使用 **Best regards** 或 **Sincerely** 来代替。"
                                                             },
                                                             {
                                                                 "needsAttention": true,
                                                                 "title": "Use full sentences",
                                                                 "titleInUserLanguage": "使用完整句子",
                                                                 "explanation": "Instead of **Got it.**, consider using **I have received your message and will act on it accordingly.**",
                                                                 "explanationInUserLanguage": "不要使用 **Got it** 这样太口语化的短句。考虑使用 **I have received your message and will act on it accordingly.**"
                                                             }
                                                         ]
                                                     },
                                                     {
                                                         "category": "Grammar and Spelling",
                                                         "categoryInUserLanguage": "语法和拼写",
                                                         "suggestions": [
                                                             {
                                                                 "needsAttention": true,
                                                                 "title": "Correct verb tense",
                                                                 "titleInUserLanguage": "纠正动词时态",
                                                                 "explanation": "Instead of **I seen that movie.**, consider using **I have seen that movie.** or **I saw that movie.**",
                                                                 "explanationInUserLanguage": "不要使用 **I seen that movie.** 这样的错误时态。考虑使用 **I have seen that movie.** 或 **I saw that movie.**"
                                                             },
                                                             {
                                                                 "needsAttention": true,
                                                                 "title": "Spelling Check",
                                                                 "titleInUserLanguage": "拼写检查",
                                                                 "explanation": "The word **seperate** is misspelled. The correct spelling is **separate**.",
                                                                 "explanationInUserLanguage": "单词 **seperate** 拼写错误。正确拼写为 **separate**。"
                                                             }
                                                         ]
                                                     },
                                                     {
                                                         "category": "Clarity and Readability",
                                                         "categoryInUserLanguage": "清晰度和可读性",
                                                         "suggestions": [
                                                             {
                                                                 "needsAttention": true,
                                                                 "title": "Improve conciseness",
                                                                 "titleInUserLanguage": "提高简洁性",
                                                                 "explanation": "The phrase **At this point in time** can be shortened to **Now** to make the sentence more concise.",
                                                                 "explanationInUserLanguage": "短语 **At this point in time** 可以缩短为 **Now**，使句子更简洁。"
                                                             },
                                                             {
                                                                 "needsAttention": true,
                                                                 "title": "Avoid jargon and acronyms",
                                                                 "titleInUserLanguage": "避免使用行话和缩写",
                                                                 "explanation": "The term **ROI** might not be understood by everyone. Consider replacing it with **Return on Investment**.",
                                                                 "explanationInUserLanguage": "术语 **ROI** 可能不是每个人都能理解。考虑用 **Return on Investment** 替换。"
                                                             }
                                                         ]
                                                     },
                                                     {
                                                         "category": "Engagement and Persuasiveness",
                                                         "categoryInUserLanguage": "互动和说服力",
                                                         "suggestions": [
                                                             {
                                                                 "needsAttention": true,
                                                                 "title": "Use a call to action",
                                                                 "titleInUserLanguage": "使用行动号召",
                                                                 "explanation": "End the email with a clear call to action, such as **Please let me know your thoughts by Friday.**",
                                                                 "explanationInUserLanguage": "在邮件结尾使用明确的行动号召，例如 **请在周五之前告诉我您的想法。**"
                                                             },
                                                             {
                                                                 "needsAttention": false,
                                                                 "title": "Personalize the message",
                                                                 "titleInUserLanguage": "个性化消息",
                                                                 "explanation": "Using **Dear Mr. Smith** is a great way to personalize the message. Well done!",
                                                                 "explanationInUserLanguage": "使用 **Dear Mr. Smith** 是个性化消息的好方法。做得好！"
                                                             }
                                                         ]
                                                     }
                                                 ]
                                             }
                                             ```
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
        if (string.IsNullOrWhiteSpace(responseText)) return new SuggestResponse();
        var response = JsonSerializer.Deserialize<SuggestResponse>(responseText, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        });
        if (response != null)
        {
            return response;
        }
        return new SuggestResponse();
    }

    public async Task<ReviseResponse> ReviseAsync(ReviseRequest request)
    {
        var chatCompletionService = kernel.GetRequiredService<IChatCompletionService>();

        var chatMessages = new ChatHistory($$"""
                                             You are a friendly email assistant that helps the user manage emails.
                                             Revise an email in {{request.TargetLanguage}}.
                                             The tone of the email should be **{{request.WritingTone}}**.

                                             The email should be concise and to the point.
                                             You need to follow the suggestions to improve the email.
                                             
                                             Return the revised email in plain text.
                                             """);
        chatMessages.AddUserMessage($"""
                                     The user's email is:
                                     {request.Draft}
                                     """);
        chatMessages.AddUserMessage($"""
                                      The suggestions are:
                                      {string.Join("\n", request.Suggestions.Select(x => x.Explanation))}
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
        return new ReviseResponse()
        {
            Text = responseText
        };
    }
}
