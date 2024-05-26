using FunCoding.ReVision.WebApi.Models;

namespace FunCoding.ReVision.WebApi.Contracts;

public interface IReVisionService
{
    Task<TranslateResponse> TranslateAsync(TranslateRequest request);
    Task<ComposeResponse> ComposeAsync(ComposeRequest request);
    Task<ReviseResponse> ReviseAsync(ReviseRequest request);
}
