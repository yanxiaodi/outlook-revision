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
}
