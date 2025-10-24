// Feedback types and interfaces

export const FEEDBACK_TYPES = {
  bugReport: "Bug Report",
  featureRequest: "Feature Request",
  generalFeedback: "General Feedback",
  other: "Other",
} as const;

export type FeedbackTypeKey = keyof typeof FEEDBACK_TYPES;

export interface FeedbackRequest {
  email: string;
  firstName: string;
  lastName: string;
  message: string;
  feedbackType: string;
  rating?: number; // 1-5 stars, optional
  version?: string; // Add-in version
  userAgent?: string; // Browser user agent
  outlookVersion?: string; // Outlook host version
  platform?: string; // Windows, Mac, Web, Mobile
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
}

export interface FeedbackFormData {
  email: string;
  firstName: string;
  lastName: string;
  message: string;
  feedbackType: FeedbackTypeKey;
  rating: number;
}
