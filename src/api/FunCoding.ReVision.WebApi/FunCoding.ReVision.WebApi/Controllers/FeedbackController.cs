using FunCoding.ReVision.WebApi.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace FunCoding.ReVision.WebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class FeedbackController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<FeedbackController> _logger;

    public FeedbackController(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<FeedbackController> logger)
    {
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
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

    [HttpPost("submit")]
    public async Task<ActionResult<FeedbackResponse>> SubmitFeedback([FromBody] FeedbackRequest request)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(CreateBadRequestProblemDetails("Email is required."));
        }

        if (string.IsNullOrWhiteSpace(request.FirstName))
        {
            return BadRequest(CreateBadRequestProblemDetails("First name is required."));
        }

        if (string.IsNullOrWhiteSpace(request.LastName))
        {
            return BadRequest(CreateBadRequestProblemDetails("Last name is required."));
        }

        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(CreateBadRequestProblemDetails("Message is required."));
        }

        if (string.IsNullOrWhiteSpace(request.FeedbackType))
        {
            return BadRequest(CreateBadRequestProblemDetails("Feedback type is required."));
        }

        if (request.Rating.HasValue && (request.Rating < 1 || request.Rating > 5))
        {
            return BadRequest(CreateBadRequestProblemDetails("Rating must be between 1 and 5."));
        }

        // Get Logic Apps endpoint from configuration
        var logicAppEndpoint = _configuration["LogicApps:FeedbackEndpoint"];
        if (string.IsNullOrWhiteSpace(logicAppEndpoint))
        {
            _logger.LogError("Logic Apps feedback endpoint is not configured");
            return StatusCode(StatusCodes.Status500InternalServerError, new FeedbackResponse
            {
                Success = false,
                Message = "Feedback service is not properly configured."
            });
        }

        try
        {
            // Create payload with timestamp added by backend
            var payload = new LogicAppFeedbackPayload
            {
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Message = request.Message,
                FeedbackType = request.FeedbackType,
                Rating = request.Rating,
                Timestamp = DateTime.UtcNow.ToString("o"), // ISO 8601 format
                Version = request.Version,
                UserAgent = request.UserAgent,
                OutlookVersion = request.OutlookVersion,
                Platform = request.Platform
            };

            // Send to Logic Apps
            var httpClient = _httpClientFactory.CreateClient();
            httpClient.Timeout = TimeSpan.FromSeconds(30);

            var jsonContent = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            _logger.LogInformation("Sending feedback to Logic Apps for {FirstName} {LastName} ({FeedbackType})",
                request.FirstName, request.LastName, request.FeedbackType);

            var response = await httpClient.PostAsync(logicAppEndpoint, content);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Feedback submitted successfully for {Email}", request.Email);
                return Ok(new FeedbackResponse
                {
                    Success = true,
                    Message = "Thank you for your feedback! We appreciate your input."
                });
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Logic Apps returned error: {StatusCode} - {Error}",
                    response.StatusCode, errorContent);

                return StatusCode(StatusCodes.Status500InternalServerError, new FeedbackResponse
                {
                    Success = false,
                    Message = "Failed to submit feedback. Please try again later."
                });
            }
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error while submitting feedback");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new FeedbackResponse
            {
                Success = false,
                Message = "Feedback service is temporarily unavailable. Please try again later."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while submitting feedback");
            return StatusCode(StatusCodes.Status500InternalServerError, new FeedbackResponse
            {
                Success = false,
                Message = "An unexpected error occurred. Please try again later."
            });
        }
    }
}
