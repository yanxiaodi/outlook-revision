using FunCoding.ReVision.WebApi.Contracts;
using FunCoding.ReVision.WebApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace FunCoding.ReVision.WebApi.Controllers;
[Route("api/[controller]")]
[ApiController]
public class OutlookController(IReVisionService revisionService) : ControllerBase
{
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [HttpPost("translate")]
    public async Task<ActionResult<TranslateResponse>> TranslateAsync(TranslateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TargetLanguage))
        {
            return BadRequest("Target language is required");
        }

        var response = await revisionService.TranslateAsync(request);
        return Ok(response);
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [HttpPost("compose")]
    public async Task<ActionResult<ComposeResponse>> ComposeAsync(ComposeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TargetLanguage))
        {
            return BadRequest("Target language is required");
        }

        if (string.IsNullOrWhiteSpace(request.Input) && string.IsNullOrWhiteSpace(request.CurrentEmailBody))
        {
            return BadRequest("Input or current email is required");
        }

        if (string.IsNullOrWhiteSpace(request.WritingTone))
        {
            return BadRequest("Writing tone is required");
        }

        var response = await revisionService.ComposeAsync(request);
        return Ok(response);
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [HttpPost("revise")]
    public async Task<ActionResult<ReviseResponse>> ReviseAsync(ReviseRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TargetLanguage))
        {
            return BadRequest("Target language is required");
        }

        if (string.IsNullOrWhiteSpace(request.Draft))
        {
            return BadRequest("Draft is required");
        }

        if (string.IsNullOrWhiteSpace(request.WritingTone))
        {
            return BadRequest("Writing tone is required");
        }

        var response = await revisionService.ReviseAsync(request);
        return Ok(response);
    }
}
