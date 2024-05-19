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
}
