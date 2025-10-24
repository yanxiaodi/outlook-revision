using FunCoding.ReVision.WebApi.Models;

namespace FunCoding.ReVision.WebApi.Contracts;

public interface IReVisionService
{
    Task<TranslateResponse> TranslateAsync(TranslateRequest request);
    Task<ComposeResponse> ComposeAsync(ComposeRequest request);
    Task<ReplyResponse> ReplyAsync(ReplyRequest request);

    Task<SuggestionResponse> SuggestAsync(SuggestionRequest request, CancellationToken cancellationToken = default);
    Task<RevisionResponse> ReviseTextAsync(RevisionRequest request, CancellationToken cancellationToken = default);
}