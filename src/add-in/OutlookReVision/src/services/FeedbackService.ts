/* global fetch, console */

import { FeedbackRequest, FeedbackResponse } from "../types/feedback";
import { getApiHost } from "../config/environment";

export interface IFeedbackService {
  submitFeedback(request: FeedbackRequest): Promise<FeedbackResponse>;
}

export class FeedbackService implements IFeedbackService {
  private readonly apiHost: string;

  constructor() {
    this.apiHost = getApiHost();
    console.log(`[FeedbackService] Using API host: ${this.apiHost}`);
  }

  async submitFeedback(request: FeedbackRequest): Promise<FeedbackResponse> {
    const url = `${this.apiHost}/api/feedback/submit`;

    console.log(`[FeedbackService] Submitting feedback to: ${url}`);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`[FeedbackService] Error response:`, errorData);
        throw new Error(errorData.message || "Failed to submit feedback");
      }

      const data: FeedbackResponse = await response.json();
      console.log(`[FeedbackService] Feedback submitted successfully`);
      return data;
    } catch (error) {
      console.error(`[FeedbackService] Error submitting feedback:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const feedbackService = new FeedbackService();
