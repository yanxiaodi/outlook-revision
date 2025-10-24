// Types for the ReVision API service
export interface TranslateRequest {
  emailBody: string;
  targetLanguage: string;
}

export interface TranslateResponse {
  text: string;
}

export interface GenerateReplyRequest {
  emailBody: string;
  language: string;
  context?: string;
  writingTone?: string;
}

export interface GenerateReplyResponse {
  text: string;
}

// Suggestion request
export interface SuggestionRequest {
  emailBody: string;
  targetLanguage: string;
  userNativeLanguage: string;
  writingTone: string;
  emailContext?: string;
  recipientRelationship?: string;
}

// Suggestion response
export interface SuggestionItem {
  id: string;
  title: string;
  description: string;
  suggestionText: string;
  severity: string;
  position?: {
    start: number;
    end: number;
    originalText: string;
  };
  examples: string[];
  suggestionTextInUserNativeLanguage?: string;
}

export interface SuggestionCategory {
  categoryName: string;
  categoryTitle: string;
  suggestions: SuggestionItem[];
}

export interface SuggestionResponse {
  overallScore: number;
  overallAssessment: string;
  suggestionCategories: SuggestionCategory[];
}

// Revision request
export interface RevisionRequest {
  originalEmailBody: string;
  targetLanguage: string;
  userNativeLanguage: string;
  writingTone: string;
  selectedSuggestions: SuggestionItem[];
  emailContext?: string;
  recipientRelationship?: string;
}

export interface RevisionResponse {
  revisedEmailBody: string;
  appliedSuggestions: string[];
  summary: string;
}

// Compose email generation
export interface GenerateComposeRequest {
  /**
   * Required context describing what to compose (purpose, audience, key points)
   */
  context: string;
  /**
   * Target language code for composing the email
   */
  language: string;
  /**
   * Desired writing tone, e.g., 'professional', 'friendly'
   */
  writingTone?: string;
  /**
   * Optional recipient's name for personalized email composition
   */
  recipientName?: string;
  /**
   * Optional relationship with the recipient (e.g., 'colleague', 'client', 'manager', 'friend')
   */
  recipientRelationship?: string;
}

export interface GenerateComposeResponse {
  subject: string;
  body: string;
}

// Generic service result wrapper for consistency with OutlookService pattern
export interface ReVisionServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// API error types
export interface ReVisionServiceError {
  message: string;
  code?: string | number;
}

// Main ReVision service interface
export interface IReVisionService {
  /**
   * Translates text to the specified target language
   */
  translateText(request: TranslateRequest): Promise<ReVisionServiceResult<TranslateResponse>>;

  /**
   * Generates a reply to an email in the specified language
   */
  generateReply(
    request: GenerateReplyRequest
  ): Promise<ReVisionServiceResult<GenerateReplyResponse>>;

  /**
   * Generates a new email (subject + body) based on user-provided context
   */
  generateCompose(
    request: GenerateComposeRequest
  ): Promise<ReVisionServiceResult<GenerateComposeResponse>>;

  /**
   * Analyzes email text and provides suggestions for improvement
   */
  analyzeEmail(request: SuggestionRequest): Promise<ReVisionServiceResult<SuggestionResponse>>;

  /**
   * Applies selected suggestions to revise the email text
   */
  reviseEmail(request: RevisionRequest): Promise<ReVisionServiceResult<RevisionResponse>>;
}
