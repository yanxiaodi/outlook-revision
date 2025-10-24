// RealOutlookService.ts - Real Office.js implementation

import {
  IOutlookService,
  EmailContent,
  OutlookServiceResult,
  OutlookServiceError,
  createErrorResult,
  createSuccessResult,
} from "./OutlookService";
import { TextProcessor } from "../utils/textProcessing";

/* global Office, console */

/**
 * Real implementation of OutlookService using Office.js APIs
 * This is used when running inside the actual Outlook application
 */
export class RealOutlookService implements IOutlookService {
  private initialized = false;

  constructor() {
    // Check if Office.js is available and initialized
    this.initialized = this.checkOfficeAvailability();
  }

  private checkOfficeAvailability(): boolean {
    return (
      typeof Office !== "undefined" &&
      Office.context &&
      Office.context.mailbox &&
      Office.context.mailbox.item !== null
    );
  }

  /**
   * Check if we're running in New Outlook (web-based) which requires HTML formatting
   * New Outlook includes: Outlook on the web, New Outlook for Windows
   */
  private isWebBasedOutlook(): boolean {
    try {
      const diagnostics = Office?.context?.mailbox?.diagnostics;
      if (!diagnostics) return false;

      const hostName = diagnostics.hostName;

      // New Outlook for Windows and Outlook on the web use HTML-based editors
      // They report as "OutlookWebApp" or "OutlookIOS" or "OutlookAndroid"
      // Classic Outlook reports as "Outlook"
      return hostName !== "Outlook";
    } catch (error) {
      console.error("Error checking Outlook host type:", error);
      // Default to web-based behavior for safety
      return true;
    }
  }

  /**
   * Convert plain text with line breaks to HTML format
   * Escapes HTML special characters and converts \n to <br> tags
   */
  private convertTextToHtml(text: string): string {
    return (
      text
        // Escape HTML special characters
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        // Convert line breaks to <br> tags
        .replace(/\n/g, "<br>")
    );
  }

  isAvailable(): boolean {
    return this.initialized && this.checkOfficeAvailability();
  }

  async getEmailBody(format: "text" | "html" = "text"): Promise<OutlookServiceResult<string>> {
    if (!this.isAvailable()) {
      return createErrorResult(OutlookServiceError.NOT_AVAILABLE);
    }

    return new Promise((resolve) => {
      try {
        const coercionType =
          format === "html" ? Office.CoercionType.Html : Office.CoercionType.Text;

        Office.context.mailbox.item?.body.getAsync(
          coercionType,
          (asyncResult: Office.AsyncResult<string>) => {
            if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
              resolve(createSuccessResult(asyncResult.value || ""));
            } else {
              console.error("Failed to get email body:", asyncResult.error?.message);
              resolve(
                createErrorResult(
                  asyncResult.error?.message || OutlookServiceError.OPERATION_FAILED
                )
              );
            }
          }
        );
      } catch (error) {
        console.error("Error getting email body:", error);
        resolve(createErrorResult(OutlookServiceError.OPERATION_FAILED));
      }
    });
  }

  async getEmailContent(
    format: "text" | "html" = "text"
  ): Promise<OutlookServiceResult<EmailContent>> {
    if (!this.isAvailable()) {
      return createErrorResult(OutlookServiceError.NOT_AVAILABLE);
    }

    try {
      // Get the full email body - no selected text functionality
      const bodyResult = await this.getEmailBody(format);

      // If getting the body failed, return that error
      if (!bodyResult.success) {
        return createErrorResult(bodyResult.error || OutlookServiceError.OPERATION_FAILED);
      }

      const fullBody = bodyResult.data || "";

      // Process the text for translation
      const processedText = TextProcessor.prepareForTranslation(fullBody);

      // Always use the full body since we don't support selected text
      const emailContent: EmailContent = {
        fullBody,
        format,
        processedText,
      };

      return createSuccessResult(emailContent);
    } catch (error) {
      console.error("Error getting email content:", error);
      return createErrorResult(OutlookServiceError.OPERATION_FAILED);
    }
  }

  async getProcessedTextForTranslation(
    format: "text" | "html" = "html"
  ): Promise<OutlookServiceResult<string>> {
    if (!this.isAvailable()) {
      return createErrorResult(OutlookServiceError.NOT_AVAILABLE);
    }

    try {
      // Get the email body in the requested format
      const bodyResult = await this.getEmailBody(format);

      if (!bodyResult.success) {
        return createErrorResult(bodyResult.error || OutlookServiceError.OPERATION_FAILED);
      }

      const rawText = bodyResult.data || "";

      // Process the text for translation
      const processedText = TextProcessor.prepareForTranslation(rawText);

      // Validate that we have translatable content
      if (!TextProcessor.hasTranslatableContent(processedText)) {
        return createErrorResult("No translatable content found in email");
      }

      console.log("RealOutlookService: Processed text for translation", {
        originalLength: rawText.length,
        processedLength: processedText.length,
        format,
      });

      return createSuccessResult(processedText);
    } catch (error) {
      console.error("Error getting processed text for translation:", error);
      return createErrorResult(OutlookServiceError.OPERATION_FAILED);
    }
  }

  async insertText(text: string): Promise<OutlookServiceResult<void>> {
    if (!this.isAvailable()) {
      return createErrorResult(OutlookServiceError.NOT_AVAILABLE);
    }

    return new Promise((resolve) => {
      try {
        // Detect if we're in a web-based Outlook (New Outlook, OWA)
        const isWebBased = this.isWebBasedOutlook();

        let contentToInsert: string;
        let coercionType: Office.CoercionType;

        if (isWebBased) {
          // New Outlook and OWA use HTML editors - convert line breaks to <br> tags
          contentToInsert = this.convertTextToHtml(text);
          coercionType = Office.CoercionType.Html;
          console.log("Inserting as HTML for web-based Outlook");
        } else {
          // Classic Outlook uses plain text
          contentToInsert = text;
          coercionType = Office.CoercionType.Text;
          console.log("Inserting as plain text for Classic Outlook");
        }

        Office.context.mailbox.item?.body.setSelectedDataAsync(
          contentToInsert,
          { coercionType },
          (asyncResult: Office.AsyncResult<void>) => {
            if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
              resolve(createSuccessResult(undefined));
            } else {
              console.error("Failed to insert text:", asyncResult.error?.message);
              resolve(
                createErrorResult(
                  asyncResult.error?.message || OutlookServiceError.OPERATION_FAILED
                )
              );
            }
          }
        );
      } catch (error) {
        console.error("Error inserting text:", error);
        resolve(createErrorResult(OutlookServiceError.OPERATION_FAILED));
      }
    });
  }

  async replaceEmailBody(
    text: string,
    format: "text" | "html" = "text"
  ): Promise<OutlookServiceResult<void>> {
    if (!this.isAvailable()) {
      return createErrorResult(OutlookServiceError.NOT_AVAILABLE);
    }

    return new Promise((resolve) => {
      try {
        const coercionType =
          format === "html" ? Office.CoercionType.Html : Office.CoercionType.Text;

        Office.context.mailbox.item?.body.setAsync(
          text,
          { coercionType },
          (asyncResult: Office.AsyncResult<void>) => {
            if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
              resolve(createSuccessResult(undefined));
            } else {
              console.error("Failed to replace email body:", asyncResult.error?.message);
              resolve(
                createErrorResult(
                  asyncResult.error?.message || OutlookServiceError.OPERATION_FAILED
                )
              );
            }
          }
        );
      } catch (error) {
        console.error("Error replacing email body:", error);
        resolve(createErrorResult(OutlookServiceError.OPERATION_FAILED));
      }
    });
  }

  async setSubject(subject: string): Promise<OutlookServiceResult<void>> {
    if (!this.isAvailable()) {
      return createErrorResult(OutlookServiceError.NOT_AVAILABLE);
    }

    return new Promise((resolve) => {
      try {
        const item: any = Office.context.mailbox.item;
        if (!item || !item.subject || typeof item.subject.setAsync !== "function") {
          return resolve(createErrorResult("Subject cannot be set in current mode"));
        }
        item.subject.setAsync(subject, (asyncResult: Office.AsyncResult<void>) => {
          if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
            resolve(createSuccessResult(undefined));
          } else {
            console.error("Failed to set subject:", asyncResult.error?.message);
            resolve(
              createErrorResult(asyncResult.error?.message || OutlookServiceError.OPERATION_FAILED)
            );
          }
        });
      } catch (error) {
        console.error("Error setting subject:", error);
        resolve(createErrorResult(OutlookServiceError.OPERATION_FAILED));
      }
    });
  }

  /**
   * Determines if the user is in compose mode or read mode
   * This is critical for determining available Office.js APIs
   */
  private isInComposeMode(): boolean {
    try {
      const item = Office?.context?.mailbox?.item;
      if (!item) return false;

      // Method 1: Check if we have compose-specific methods available
      // In compose mode: body and subject are objects with setAsync/getAsync methods
      // In read mode: subject is a direct string value, body needs getAsync but no setAsync
      const hasComposeBody = item.body && typeof item.body.setAsync === "function";
      const hasComposeSubject =
        item.subject &&
        typeof item.subject === "object" &&
        typeof (item.subject as any).setAsync === "function";

      // Method 2: Check diagnostics (if available)
      const hostName = Office?.context?.mailbox?.diagnostics?.hostName;
      const hostVersion = Office?.context?.mailbox?.diagnostics?.hostVersion;

      console.log("Outlook mode detection:", {
        hasComposeBody,
        hasComposeSubject,
        hostName,
        hostVersion,
        itemType: item.itemType,
        subject: typeof item.subject,
      });

      return hasComposeBody || hasComposeSubject;
    } catch (error) {
      console.error("Error checking compose mode:", error);
      return false;
    }
  }

  /**
   * Gets detailed information about the current email and Outlook mode
   */
  async getEmailInfo(): Promise<
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
  > {
    if (!this.isAvailable()) {
      return createErrorResult(OutlookServiceError.NOT_AVAILABLE);
    }

    try {
      const mailboxItem = Office.context.mailbox.item;
      if (!mailboxItem) {
        return createErrorResult(OutlookServiceError.NO_MAIL_ITEM);
      }

      const isCompose = this.isInComposeMode();
      const isRead = !isCompose;

      // Get subject - handling both compose and read modes
      let subject: string | undefined;
      if (isCompose && mailboxItem.subject && typeof mailboxItem.subject === "object") {
        // Compose mode - subject is an object with getAsync method
        try {
          const subjectResult = await new Promise<string>((resolve, reject) => {
            (mailboxItem.subject as any).getAsync((result: Office.AsyncResult<string>) => {
              if (result.status === Office.AsyncResultStatus.Succeeded) {
                resolve(result.value || "");
              } else {
                reject(new Error(result.error?.message || "Failed to get subject"));
              }
            });
          });
          subject = subjectResult;
        } catch (error) {
          console.warn("Could not get subject in compose mode:", error);
        }
      } else if (isRead && typeof mailboxItem.subject === "string") {
        // Read mode - subject is directly accessible
        subject = mailboxItem.subject;
      }

      const isReply = subject
        ? subject.toLowerCase().startsWith("re:") ||
          subject.toLowerCase().startsWith("fw:") ||
          subject.toLowerCase().startsWith("fwd:")
        : false;

      // Get host information
      const diagnostics = Office.context.mailbox.diagnostics;
      const hostInfo = diagnostics
        ? {
            name: diagnostics.hostName,
            version: diagnostics.hostVersion,
          }
        : undefined;

      const itemTypeString =
        mailboxItem.itemType === Office.MailboxEnums.ItemType.Message
          ? "Message"
          : mailboxItem.itemType === Office.MailboxEnums.ItemType.Appointment
            ? "Appointment"
            : "Unknown";

      return createSuccessResult({
        isCompose,
        isRead,
        isReply,
        itemType: itemTypeString,
        subject,
        hostInfo,
      });
    } catch (error) {
      console.error("Error getting email info:", error);
      return createErrorResult(OutlookServiceError.OPERATION_FAILED);
    }
  }

  async getCurrentEmailId(): Promise<OutlookServiceResult<string | null>> {
    if (!this.isAvailable()) {
      return createErrorResult(OutlookServiceError.NOT_AVAILABLE);
    }

    try {
      // Get email content to create a stable identifier
      const result = await this.getEmailContent("text");
      if (result.success && result.data) {
        const content = result.data.processedText?.trim();
        if (content) {
          // Use a hash of the full content for stable identification
          let hash = 0;
          for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
          }
          const emailId = `email_${Math.abs(hash)}`;
          console.log("RealOutlookService: Generated email ID:", emailId);
          return createSuccessResult(emailId);
        }
      }

      console.log("RealOutlookService: Could not generate email ID - no content available");
      return createSuccessResult(null);
    } catch (error) {
      console.error("RealOutlookService: Error getting email ID:", error);
      return createErrorResult(OutlookServiceError.OPERATION_FAILED);
    }
  }

  async checkForNewEmail(previousEmailId: string | null): Promise<OutlookServiceResult<boolean>> {
    if (!this.isAvailable()) {
      return createErrorResult(OutlookServiceError.NOT_AVAILABLE);
    }

    try {
      const currentEmailIdResult = await this.getCurrentEmailId();

      if (!currentEmailIdResult.success) {
        return createErrorResult(
          currentEmailIdResult.error || OutlookServiceError.OPERATION_FAILED
        );
      }

      const currentEmailId = currentEmailIdResult.data;
      const isNewEmail = currentEmailId !== null && currentEmailId !== previousEmailId;

      console.log("RealOutlookService: Email context check", {
        previousEmailId,
        currentEmailId,
        isNewEmail,
      });

      return createSuccessResult(isNewEmail);
    } catch (error) {
      console.error("RealOutlookService: Error checking for new email:", error);
      return createErrorResult(OutlookServiceError.OPERATION_FAILED);
    }
  }

  async getMode(): Promise<OutlookServiceResult<import("./OutlookService").OutlookMode>> {
    if (!this.isAvailable()) {
      return createErrorResult(OutlookServiceError.NOT_AVAILABLE);
    }
    try {
      const item = Office.context.mailbox.item;
      const isCompose = this.isInComposeMode();
      const isAppointment = item?.itemType === Office.MailboxEnums.ItemType.Appointment;

      if (isAppointment) {
        return createSuccessResult(
          isCompose ? "meetingDetailsOrganizer" : "meetingDetailsAttendee"
        );
      }
      // Default to message
      return createSuccessResult(isCompose ? "mailCompose" : "mailRead");
    } catch (error) {
      console.error("RealOutlookService: Error getting mode", error);
      return createErrorResult(OutlookServiceError.OPERATION_FAILED);
    }
  }
}
