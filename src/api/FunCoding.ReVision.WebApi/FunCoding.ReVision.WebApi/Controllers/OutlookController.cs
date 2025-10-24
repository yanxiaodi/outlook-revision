using FunCoding.ReVision.WebApi.Contracts;
using FunCoding.ReVision.WebApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace FunCoding.ReVision.WebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class OutlookController : ControllerBase
{
    private readonly IReVisionService _reVisionService;

    public OutlookController(IReVisionService reVisionService)
    {
        _reVisionService = reVisionService;
    }

    private ProblemDetails CreateBadRequestProblemDetails(string detail)
    {
        return new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "Bad Request",
            Status = StatusCodes.Status400BadRequest,
            Detail = detail,
            Instance = HttpContext.Request.Path
        };
    }

    [HttpPost("translate")]
    public async Task<ActionResult<TranslateResponse>> Translate([FromBody] TranslateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.EmailBody) || string.IsNullOrWhiteSpace(request.TargetLanguage))
        {
            return BadRequest(CreateBadRequestProblemDetails("Text and TargetLanguage are required."));
        }
        var result = await _reVisionService.TranslateAsync(request);
        return Ok(result);
    }

    [HttpPost("compose")]
    public async Task<ActionResult<ComposeResponse>> Compose([FromBody] ComposeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TargetLanguage))
        {
            return BadRequest(CreateBadRequestProblemDetails("TargetLanguage is required."));
        }

        if (string.IsNullOrWhiteSpace(request.WritingTone))
        {
            return BadRequest(CreateBadRequestProblemDetails("WritingTone is required."));
        }

        if (string.IsNullOrWhiteSpace(request.Context))
        {
            return BadRequest(CreateBadRequestProblemDetails("Context is required for email composition."));
        }

        var result = await _reVisionService.ComposeAsync(request);
        return Ok(result);
    }

    [HttpPost("reply")]
    public async Task<ActionResult<ReplyResponse>> Reply([FromBody] ReplyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TargetLanguage))
        {
            return BadRequest(CreateBadRequestProblemDetails("TargetLanguage is required."));
        }

        if (string.IsNullOrWhiteSpace(request.WritingTone))
        {
            return BadRequest(CreateBadRequestProblemDetails("WritingTone is required."));
        }

        if (string.IsNullOrWhiteSpace(request.EmailBody))
        {
            return BadRequest(CreateBadRequestProblemDetails("EmailBody is required for generating replies."));
        }

        var result = await _reVisionService.ReplyAsync(request);
        return Ok(result);
    }

    [HttpPost("suggest")]
    public async Task<ActionResult<SuggestionResponse>> Suggest([FromBody] SuggestionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.EmailBody))
        {
            return BadRequest(CreateBadRequestProblemDetails("EmailBody is required."));
        }

        if (string.IsNullOrWhiteSpace(request.TargetLanguage))
        {
            return BadRequest(CreateBadRequestProblemDetails("TargetLanguage is required."));
        }

        if (string.IsNullOrWhiteSpace(request.UserNativeLanguage))
        {
            return BadRequest(CreateBadRequestProblemDetails("UserNativeLanguage is required."));
        }

        if (string.IsNullOrWhiteSpace(request.WritingTone))
        {
            return BadRequest(CreateBadRequestProblemDetails("WritingTone is required."));
        }

        var result = await _reVisionService.SuggestAsync(request);
        return Ok(result);
    }

    [HttpPost("revise")]
    public async Task<ActionResult<RevisionResponse>> Revise([FromBody] RevisionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.OriginalEmailBody))
        {
            return BadRequest(CreateBadRequestProblemDetails("OriginalEmailBody is required."));
        }

        if (string.IsNullOrWhiteSpace(request.TargetLanguage))
        {
            return BadRequest(CreateBadRequestProblemDetails("TargetLanguage is required."));
        }

        if (string.IsNullOrWhiteSpace(request.UserNativeLanguage))
        {
            return BadRequest(CreateBadRequestProblemDetails("UserNativeLanguage is required."));
        }

        if (string.IsNullOrWhiteSpace(request.WritingTone))
        {
            return BadRequest(CreateBadRequestProblemDetails("WritingTone is required."));
        }

        if (!request.SelectedSuggestions.Any())
        {
            return BadRequest(CreateBadRequestProblemDetails("At least one suggestion must be selected for revision."));
        }

        var result = await _reVisionService.ReviseTextAsync(request);
        return Ok(result);
    }
}
