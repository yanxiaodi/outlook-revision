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

}
