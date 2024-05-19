using FunCoding.ReVision.WebApi.Models;

namespace FunCoding.ReVision.WebApi.Contracts;

public interface IReVisionService
{
    Task<TranslateResponse> TranslateAsync(TranslateRequest request);
}
