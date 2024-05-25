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

        if (string.IsNullOrWhiteSpace(request.Input) && string.IsNullOrWhiteSpace(request.CurrentEmail))
        {
            return BadRequest("Input or current email is required");
        }
        var response = await revisionService.ComposeAsync(request);
        return Ok(response);
    }
}
