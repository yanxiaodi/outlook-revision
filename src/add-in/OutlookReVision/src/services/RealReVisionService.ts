/* global fetch, console */
import {
  IReVisionService,
  TranslateRequest,
  TranslateResponse,
  GenerateReplyRequest,
  GenerateReplyResponse,
  GenerateComposeRequest,
  GenerateComposeResponse,
  SuggestionRequest,
  SuggestionResponse,
  RevisionRequest,
  RevisionResponse,
  ReVisionServiceResult,
} from "./ReVisionService";

export class RealReVisionService implements IReVisionService {
  private apiHost: string;

  constructor(apiHost: string) {
    this.apiHost = apiHost;
    console.log("[RealReVisionService] Initialized with API Host:", apiHost);
  }

  /**
   * Get request headers including user email for rate limiting
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      accept: "text/plain",
      "Content-Type": "application/json",
    };

    // Add user email header for rate limiting
    try {
      if (typeof Office !== "undefined" && Office.context?.mailbox?.userProfile?.emailAddress) {
        headers["X-User-Email"] = Office.context.mailbox.userProfile.emailAddress;
        console.log("[RealReVisionService] Added user email to request headers");
      } else {
        console.warn("[RealReVisionService] Office context not available for user email");
      }
    } catch (error) {
      console.error("[RealReVisionService] Error getting user email:", error);
    }

    return headers;
  }

  /**
   * Handle rate limit errors and extract useful information
   */
  private handleRateLimitError(response: Response, errorData: any): string {
    if (response.status === 429) {
      const resetHeader = response.headers.get("X-RateLimit-Reset");
      const limitHeader = response.headers.get("X-RateLimit-Limit");
      const remainingHeader = response.headers.get("X-RateLimit-Remaining");
      
      if (resetHeader && limitHeader) {
        const resetTime = new Date(parseInt(resetHeader) * 1000);
        const formattedTime = resetTime.toLocaleString();
        
        // Return a special marker so the UI can detect rate limit errors
        return `[RATE_LIMIT_EXCEEDED]Daily request limit of ${limitHeader} exceeded. Your limit will reset at ${formattedTime}. Consider upgrading for higher limits.|RESET:${formattedTime}`;
      }
      
      return errorData?.detail || "[RATE_LIMIT_EXCEEDED]Daily request limit exceeded. Please try again later.";
    }
    
    return errorData?.detail || `Request failed: ${response.status} ${response.statusText}`;
  }

  async translateText(
    request: TranslateRequest
  ): Promise<ReVisionServiceResult<TranslateResponse>> {
    try {
      const url = `${this.apiHost}/api/Outlook/translate`;
      console.log("[ReVisionService] translateText - API Host:", this.apiHost);
      console.log("[ReVisionService] translateText - Full URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          emailBody: request.emailBody,
          targetLanguage: request.targetLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return {
          success: false,
          error: this.handleRateLimitError(response, errorData),
        };
      }

      const result = (await response.json()) as TranslateResponse;

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Translation API error:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? `Network error: ${error.message}`
            : "Unknown error occurred during translation",
      };
    }
  }

  async generateReply(
    request: GenerateReplyRequest
  ): Promise<ReVisionServiceResult<GenerateReplyResponse>> {
    try {
      const url = `${this.apiHost}/api/Outlook/reply`;
      console.log("[ReVisionService] generateReply - API Host:", this.apiHost);
      console.log("[ReVisionService] generateReply - Full URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          emailSubject: "", // Empty for reply generation
          emailBody: request.emailBody,
          context: request.context || "Generate a professional reply to this email",
          targetLanguage: request.language,
          writingTone: request.writingTone || "professional",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return {
          success: false,
          error: this.handleRateLimitError(response, errorData),
        };
      }

      const result = await response.json();

      // Convert ReplyResponse format to GenerateReplyResponse format
      const replyResponse: GenerateReplyResponse = {
        text: result.Body || result.body || "", // Handle both capitalized and lowercase
      };

      return {
        success: true,
        data: replyResponse,
      };
    } catch (error) {
      console.error("Reply generation API error:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? `Network error: ${error.message}`
            : "Unknown error occurred during reply generation",
      };
    }
  }

  async generateCompose(
    request: GenerateComposeRequest
  ): Promise<ReVisionServiceResult<GenerateComposeResponse>> {
    try {
      const url = `${this.apiHost}/api/Outlook/compose`;
      console.log("[ReVisionService] generateCompose - API Host:", this.apiHost);
      console.log("[ReVisionService] generateCompose - Full URL:", url);

      const requestBody: any = {
        context: request.context,
        targetLanguage: request.language,
        writingTone: request.writingTone || "professional",
      };

      // Include recipient name if provided
      if (request.recipientName?.trim()) {
        requestBody.recipientName = request.recipientName.trim();
      }

      const response = await fetch(url, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return {
          success: false,
          error: this.handleRateLimitError(response, errorData),
        };
      }

      const result = await response.json();

      const composeResponse: GenerateComposeResponse = {
        subject: result.Subject || result.subject || "",
        body: result.Body || result.body || "",
      };

      return {
        success: true,
        data: composeResponse,
      };
    } catch (error) {
      console.error("Compose generation API error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? `Network error: ${error.message}`
            : "Unknown error occurred during compose generation",
      };
    }
  }

  async analyzeEmail(
    request: SuggestionRequest
  ): Promise<ReVisionServiceResult<SuggestionResponse>> {
    try {
      const url = `${this.apiHost}/api/Outlook/suggest`;
      console.log("[ReVisionService] analyzeEmail - API Host:", this.apiHost);
      console.log("[ReVisionService] analyzeEmail - Full URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          emailBody: request.emailBody,
          targetLanguage: request.targetLanguage,
          userNativeLanguage: request.userNativeLanguage,
          writingTone: request.writingTone,
          emailContext: request.emailContext || "",
          recipientRelationship: request.recipientRelationship || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return {
          success: false,
          error: this.handleRateLimitError(response, errorData),
        };
      }

      const result = (await response.json()) as SuggestionResponse;

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Analysis API error:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? `Network error: ${error.message}`
            : "Unknown error occurred during analysis",
      };
    }
  }

  async reviseEmail(request: RevisionRequest): Promise<ReVisionServiceResult<RevisionResponse>> {
    try {
      const url = `${this.apiHost}/api/Outlook/revise`;
      console.log("[ReVisionService] reviseEmail - API Host:", this.apiHost);
      console.log("[ReVisionService] reviseEmail - Full URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          originalEmailBody: request.originalEmailBody,
          targetLanguage: request.targetLanguage,
          userNativeLanguage: request.userNativeLanguage,
          writingTone: request.writingTone,
          selectedSuggestions: request.selectedSuggestions,
          emailContext: request.emailContext || "",
          recipientRelationship: request.recipientRelationship || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return {
          success: false,
          error: this.handleRateLimitError(response, errorData),
        };
      }

      const result = (await response.json()) as RevisionResponse;

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Revision API error:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? `Network error: ${error.message}`
            : "Unknown error occurred during revision",
      };
    }
  }
}
