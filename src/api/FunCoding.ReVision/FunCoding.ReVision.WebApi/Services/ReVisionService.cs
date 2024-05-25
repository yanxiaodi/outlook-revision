using FunCoding.ReVision.WebApi.Contracts;
using FunCoding.ReVision.WebApi.Models;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;

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
            var summaryChatMessages = new ChatHistory($"""
                                                       You are a friendly email assistant that helps the user manage emails.
                                                       Summarize the email text to {request.TargetLanguage} in five sentences.
                                                       Your summary should be short, concise, and to the point.
                                                       The email text is:
                                                       {request.Text}
                                                       """);
            var summaryResponse = await chatCompletionService.GetChatMessageContentsAsync(
                summaryChatMessages,
                promptExecutionSettings,
                kernel);
            response.Summary = summaryResponse.FirstOrDefault()?.Content ?? "";
        }

        return response;

    }

    public async Task<ComposeResponse> ComposeAsync(ComposeRequest request)
    {
        var chatCompletionService = kernel.GetRequiredService<IChatCompletionService>();
        var currentEmailText = string.IsNullOrWhiteSpace(request.CurrentEmail)
            ? ""
            : $"""
               You need to reply to an email. The current email text is:

               ###
               {request.CurrentEmail}
               ###

               """;
        var userInput = string.IsNullOrWhiteSpace(request.Input)
            ? ""
            : $"""
               The user has provided the following input:

               ###
               {request.Input}
               ###

               """;
        var chatMessages = new ChatHistory($"""
                                            You are a friendly email assistant that helps the user manage emails.
                                            Compose an email in {request.TargetLanguage}.
                                            The tone of the email should be {request.WritingTone}.
                                            {currentEmailText}
                                            {userInput}
                                            Compose an email based on the current email and the user's input.
                                            If the current email is not provided, compose an email based on the user's input.
                                            If the user's input is empty, compose an email to reply to the current email.
                                            The email should be concise and to the point.
                                            """);
        var promptExecutionSettings = new OpenAIPromptExecutionSettings
        {
            ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions
        };
        var composeResponse = await chatCompletionService.GetChatMessageContentsAsync(
            chatMessages,
            promptExecutionSettings,
            kernel);
        return new ComposeResponse(composeResponse.FirstOrDefault()?.Content ?? "");
    }

}
