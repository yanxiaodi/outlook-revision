/* global setTimeout */
// MockOutlookService.ts - Mock implementation for browser debugging

import {
  IOutlookService,
  EmailContent,
  OutlookServiceResult,
  createSuccessResult,
  createErrorResult,
} from "./OutlookService";
import { TextProcessor } from "../utils/textProcessing";
/* global console */

/**
 * Mock implementation of OutlookService for browser testing
 * This allows developers to test the UI without requiring Outlook
 */
export class MockOutlookService implements IOutlookService {
  private mockEmailBody = `Hello John,

I hope this email finds you well. I wanted to reach out regarding the upcoming project meeting scheduled for next Tuesday at 2 PM.

Agenda items:
• Project timeline review
• Budget discussion
• Resource allocation

Could you please confirm your attendance? Also, if you have any specific topics you'd like to discuss during the meeting, please let me know in advance so I can add them to the agenda.

Looking forward to our productive discussion.

Best regards,
Sarah`;

  private mockIsCompose = true;
  private mockIsAppointment = false;
  private mockEmailChangeCounter = 0; // For simulating email changes

  constructor() {
    console.log("MockOutlookService initialized for browser testing");
  }

  isAvailable(): boolean {
    // Always available in mock mode
    return true;
  }

  async getEmailBody(format: "text" | "html" = "text"): Promise<OutlookServiceResult<string>> {
    // Simulate some delay like a real API call
    await new Promise((resolve) => setTimeout(resolve, 200));

    const body =
      format === "html" ? this.convertTextToHtml(this.mockEmailBody) : this.mockEmailBody;

    console.log("MockOutlookService: Getting email body, format:", format);
    return createSuccessResult(body);
  }

  async getEmailContent(
    format: "text" | "html" = "text"
  ): Promise<OutlookServiceResult<EmailContent>> {
    // Simulate some delay like a real API call
    await new Promise((resolve) => setTimeout(resolve, 150));

    const body =
      format === "html" ? this.convertTextToHtml(this.mockEmailBody) : this.mockEmailBody;

    // Process the text for translation
    const processedText = TextProcessor.prepareForTranslation(body);

    const emailContent: EmailContent = {
      fullBody: body,
      format,
      processedText,
    };

    console.log("MockOutlookService: Getting email content:", {
      bodyLength: body.length,
      processedLength: processedText.length,
      format,
    });

    return createSuccessResult(emailContent);
  }

  async getProcessedTextForTranslation(
    format: "text" | "html" = "html"
  ): Promise<OutlookServiceResult<string>> {
    // Simulate some delay like a real API call
    await new Promise((resolve) => setTimeout(resolve, 100));

    const body =
      format === "html" ? this.convertTextToHtml(this.mockEmailBody) : this.mockEmailBody;

    // Process the text for translation
    const processedText = TextProcessor.prepareForTranslation(body);

    // Validate that we have translatable content
    if (!TextProcessor.hasTranslatableContent(processedText)) {
      return createErrorResult("No translatable content found in email");
    }

    console.log("MockOutlookService: Processed text for translation:", {
      originalLength: body.length,
      processedLength: processedText.length,
      format,
    });

    return createSuccessResult(processedText);
  }

  async insertText(text: string): Promise<OutlookServiceResult<void>> {
    // Simulate some delay like a real API call
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log("MockOutlookService: Inserting text:", text.substring(0, 50) + "...");

    // In a real scenario, this would insert at cursor position
    // For mock, we'll just log it
    console.log("Text would be inserted into email at cursor position");

    return createSuccessResult(undefined);
  }

  async replaceEmailBody(
    text: string,
    format: "text" | "html" = "text"
  ): Promise<OutlookServiceResult<void>> {
    // Simulate some delay like a real API call
    await new Promise((resolve) => setTimeout(resolve, 200));

    console.log(
      "MockOutlookService: Replacing email body with:",
      text.substring(0, 50) + "...",
      "format:",
      format
    );

    // Update the mock email body for future calls
    this.mockEmailBody = text;

    return createSuccessResult(undefined);
  }

  async setSubject(subject: string): Promise<OutlookServiceResult<void>> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    console.log("MockOutlookService: Setting subject:", subject);
    return createSuccessResult(undefined);
  }

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
    // Simulate some delay like a real API call
    await new Promise((resolve) => setTimeout(resolve, 50));

    const emailInfo = {
      isCompose: this.mockIsCompose,
      isRead: !this.mockIsCompose,
      isReply: !this.mockIsCompose,
      itemType: "Message",
      subject: this.mockIsCompose ? "New Email" : "Re: Project Meeting Discussion",
      hostInfo: {
        name: "MockOutlook",
        version: "16.0.0000.0000",
      },
    };

    console.log("MockOutlookService: Getting email info:", emailInfo);
    return createSuccessResult(emailInfo);
  }

  async getCurrentEmailId(): Promise<OutlookServiceResult<string | null>> {
    // Simulate some delay like a real API call
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      // Create a stable identifier based on mock email content and change counter
      const content = this.mockEmailBody.trim();
      if (content) {
        // Use a hash of the content plus change counter for stable identification
        const contentToHash = content + this.mockEmailChangeCounter;
        let hash = 0;
        for (let i = 0; i < contentToHash.length; i++) {
          const char = contentToHash.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash; // Convert to 32bit integer
        }
        const emailId = `mock_email_${Math.abs(hash)}`;
        console.log("MockOutlookService: Generated email ID:", emailId);
        return createSuccessResult(emailId);
      }

      console.log("MockOutlookService: Could not generate email ID - no content available");
      return createSuccessResult(null);
    } catch (error) {
      console.error("MockOutlookService: Error getting email ID:", error);
      return createErrorResult("Failed to get email ID");
    }
  }

  async checkForNewEmail(previousEmailId: string | null): Promise<OutlookServiceResult<boolean>> {
    // Simulate some delay like a real API call
    await new Promise((resolve) => setTimeout(resolve, 30));

    try {
      const currentEmailIdResult = await this.getCurrentEmailId();

      if (!currentEmailIdResult.success) {
        return createErrorResult(currentEmailIdResult.error || "Failed to get current email ID");
      }

      const currentEmailId = currentEmailIdResult.data;
      const isNewEmail = currentEmailId !== null && currentEmailId !== previousEmailId;

      console.log("MockOutlookService: Email context check", {
        previousEmailId,
        currentEmailId,
        isNewEmail,
      });

      return createSuccessResult(isNewEmail);
    } catch (error) {
      console.error("MockOutlookService: Error checking for new email:", error);
      return createErrorResult("Failed to check for new email");
    }
  }

  async getMode(): Promise<OutlookServiceResult<import("./OutlookService").OutlookMode>> {
    // Simulate a tiny delay for consistency
    await new Promise((resolve) => setTimeout(resolve, 10));
    if (this.mockIsAppointment) {
      return createSuccessResult(
        this.mockIsCompose ? "meetingDetailsOrganizer" : "meetingDetailsAttendee"
      );
    }
    return createSuccessResult(this.mockIsCompose ? "mailCompose" : "mailRead");
  }

  // Helper methods for testing scenarios

  /**
   * Set mock email body for testing different content scenarios
   * @param body - Email body content to use
   */
  setMockEmailBody(body: string): void {
    this.mockEmailBody = body;
    console.log("MockOutlookService: Mock email body updated");
  }

  /**
   * Toggle between compose and reply mode for testing
   * @param isCompose - Whether to simulate compose (true) or reply (false) mode
   */
  setMockComposeMode(isCompose: boolean): void {
    this.mockIsCompose = isCompose;
    console.log("MockOutlookService: Mock compose mode set to:", isCompose);
  }

  /** Toggle between message and appointment scenarios */
  setMockAppointment(isAppointment: boolean): void {
    this.mockIsAppointment = isAppointment;
    console.log("MockOutlookService: Mock appointment mode set to:", isAppointment);
  }

  /**
   * Simulate switching to a new email context
   * This increments the email change counter to create a new email ID
   */
  simulateNewEmail(): void {
    this.mockEmailChangeCounter++;
    console.log(
      "MockOutlookService: Simulated new email context, counter:",
      this.mockEmailChangeCounter
    );
  }

  private convertTextToHtml(text: string): string {
    // Simple text to HTML conversion for mock purposes
    return text
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>")
      .replace(/^/, "<p>")
      .replace(/$/, "</p>");
  }
}

// Export some mock test scenarios
export const MockTestScenarios = {
  /**
   * Short email scenario
   */
  SHORT_EMAIL: `Hi there,

Quick question about the meeting tomorrow. What time are we starting?

Thanks!`,

  /**
   * Long email scenario
   */
  LONG_EMAIL: `Dear Team,

I hope this message finds you all in good health and high spirits. As we approach the end of the quarter, I wanted to take a moment to reflect on our achievements and outline our plans for the upcoming period.

First and foremost, I would like to congratulate everyone on the successful completion of the Q3 project deliverables. The dedication and hard work that each team member has demonstrated throughout this period has been truly exceptional. The client feedback has been overwhelmingly positive, and we have exceeded our initial targets by 15%.

Looking ahead to Q4, we have several exciting opportunities on the horizon. The new partnership with TechCorp will require us to expand our development team, and I'm pleased to announce that we have budget approval for three additional positions. The hiring process will begin next week, and I encourage everyone to refer qualified candidates.

Additionally, we will be implementing new project management tools to streamline our workflow and improve communication across departments. Training sessions will be scheduled over the next two weeks, and attendance is mandatory for all team members.

Please mark your calendars for the all-hands meeting scheduled for next Friday at 2 PM in the main conference room. We will be discussing these initiatives in detail and addressing any questions or concerns you may have.

Thank you once again for your continued commitment to excellence.

Best regards,
Management Team`,

  /**
   * Email with foreign characters
   */
  MULTILINGUAL_EMAIL: `Bonjour équipe,

J'espère que vous allez tous bien. Je voulais vous informer des changements importants qui auront lieu la semaine prochaine.

Hola equipo,

Espero que todos estén bien. Quería informarles sobre los cambios importantes que tendrán lugar la próxima semana.

こんにちはチーム、

皆さんがお元気でいることを願っています。来週行われる重要な変更についてお知らせしたいと思います。

Best regards,
International Team`,

  /**
   * HTML email scenario for testing text extraction
   */
  HTML_EMAIL: `<html><head><title>Project Update</title></head><body>
<h1>Project Status Update</h1>
<p>Dear Team,</p>
<p>I'm writing to provide you with an important update on our current project status.</p>
<div style="background: #f0f0f0; padding: 10px; margin: 10px 0;">
  <h2>Key Achievements</h2>
  <ul>
    <li>Completed phase 1 development</li>
    <li>Successfully passed all quality tests</li>
    <li>Client approval received</li>
  </ul>
</div>
<p>Next steps include:</p>
<ol>
  <li>Begin phase 2 implementation</li>
  <li>Schedule stakeholder review</li>
  <li>Prepare deployment documentation</li>
</ol>
<p>Please let me know if you have any questions.</p>
<p>Best regards,<br/>Project Manager</p>
</body></html>`,
};
