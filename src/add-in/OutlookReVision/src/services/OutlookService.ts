// OutlookService.ts - Interface abstraction for Office.js interactions

export interface EmailContent {
  fullBody: string;
  format: "text" | "html";
  processedText?: string; // Cleaned text ready for translation
}

export interface OutlookServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Simple discriminated mode type for Outlook item surface
export type OutlookMode =
  | "mailRead"
  | "mailCompose"
  | "meetingDetailsOrganizer"
  | "meetingDetailsAttendee";

/**
 * Abstract interface for Outlook email interactions
 * Provides a consistent API for both real Outlook and mock implementations
 */
export interface IOutlookService {
  /**
   * Check if the service is available and properly initialized
   */
  isAvailable(): boolean;

  /**
   * Get the full email body content
   * @param format - Whether to get text or HTML format
   * @returns Promise with email body content
   */
  getEmailBody(format?: "text" | "html"): Promise<OutlookServiceResult<string>>;

  /**
   * Get the full email body content with metadata
   * This is the main method for the translate feature
   * @param format - Whether to get text or HTML format
   * @returns Promise with email content information
   */
  getEmailContent(format?: "text" | "html"): Promise<OutlookServiceResult<EmailContent>>;

  /**
   * Get processed text ready for translation
   * Extracts and cleans text from email content, handling HTML if necessary
   * @param format - Source format to process ('text' | 'html')
   * @returns Promise with cleaned text ready for translation
   */
  getProcessedTextForTranslation(format?: "text" | "html"): Promise<OutlookServiceResult<string>>;

  /**
   * Insert text at the current cursor position or replace selected text
   * @param text - Text to insert
   * @returns Promise with operation result
   */
  insertText(text: string): Promise<OutlookServiceResult<void>>;

  /**
   * Replace the entire email body with new content
   * @param text - New email body content
   * @param format - Format of the content (text or html)
   * @returns Promise with operation result
   */
  replaceEmailBody(text: string, format?: "text" | "html"): Promise<OutlookServiceResult<void>>;

  /**
   * Set the email subject (compose mode only)
   * @param subject - Subject to set
   */
  setSubject(subject: string): Promise<OutlookServiceResult<void>>;

  /**
   * Get information about the current email context and Outlook mode
   * @returns Information about compose/read mode, email type, and context
   */
  getEmailInfo(): Promise<
    OutlookServiceResult<{
      isCompose: boolean;
      isRead: boolean;
      isReply: boolean;
      itemType: string;
      subject?: string;
      hostInfo?: {
        name: string;
        version: string;
      };
    }>
  >;

  /**
   * Get a unique identifier for the current email context
   * This identifier should remain stable for the same email content
   * but change when the user switches to a different email
   * @returns Promise with unique email identifier or null if unavailable
   */
  getCurrentEmailId(): Promise<OutlookServiceResult<string | null>>;

  /**
   * Check if the current email context is different from the provided email ID
   * This is useful for detecting when the user has switched to a different email
   * @param previousEmailId - The previously known email ID to compare against
   * @returns Promise indicating whether this is a new/different email context
   */
  checkForNewEmail(previousEmailId: string | null): Promise<OutlookServiceResult<boolean>>;

  /**
   * Get the current Outlook mode for this item surface.
   * Returns 'mailCompose' when in compose (new/reply/forward) mode,
   * and 'mailRead' when viewing an existing item.
   */
  getMode(): Promise<OutlookServiceResult<OutlookMode>>;
}

/**
 * Error types for Outlook service operations
 */
export enum OutlookServiceError {
  NOT_AVAILABLE = "Service not available",
  OFFICE_NOT_INITIALIZED = "Office.js not initialized",
  NO_MAIL_ITEM = "No mail item context",
  PERMISSION_DENIED = "Permission denied",
  OPERATION_FAILED = "Operation failed",
  NETWORK_ERROR = "Network error",
  UNKNOWN_ERROR = "Unknown error",
}

/**
 * Helper function to create error results
 */
export const createErrorResult = <T>(error: string): OutlookServiceResult<T> => ({
  success: false,
  error,
});

/**
 * Helper function to create success results
 */
export const createSuccessResult = <T>(data: T): OutlookServiceResult<T> => ({
  success: true,
  data,
});
