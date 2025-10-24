/* global HTMLImageElement */
// textProcessing.ts - Utilities for processing email text content

import TurndownService from "turndown";

/**
 * Text processing utilities for email content
 * Handles extraction of translatable text from different formats
 */
export class TextProcessor {
  private static turndownService: TurndownService;

  /**
   * Get configured Turndown service instance
   */
  private static getTurndownService(): TurndownService {
    if (!this.turndownService) {
      this.turndownService = new TurndownService({
        headingStyle: "atx",
        bulletListMarker: "-",
        emDelimiter: "*",
        strongDelimiter: "**",
        br: "\n", // Preserve line breaks from <br> tags
        preformattedCode: false, // Don't wrap text in code blocks
        linkStyle: "referenced", // Handle links better
        linkReferenceStyle: "collapsed",
      });

      // Remove links but keep text content
      this.turndownService.addRule("removeLinks", {
        filter: "a",
        replacement: function (content) {
          return content;
        },
      });

      // Convert images to simple alt text
      this.turndownService.addRule("removeImages", {
        filter: "img",
        replacement: function (_content, node) {
          const alt = (node as HTMLImageElement).alt;
          return alt ? `[Image: ${alt}]` : "[Image]";
        },
      });

      // Remove scripts and styles completely
      this.turndownService.addRule("removeScripts", {
        filter: ["script", "style"],
        replacement: function () {
          return "";
        },
      });

      // Preserve line breaks in common block elements
      this.turndownService.addRule("preserveLineBreaks", {
        filter: ["div", "p", "br"],
        replacement: function (content, node) {
          if (node.nodeName === "BR") {
            return "\n";
          }
          return content + "\n";
        },
      });

      // Handle common email formatting elements
      this.turndownService.addRule("emailFormatting", {
        filter: ["table", "tr", "td", "th"],
        replacement: function (content) {
          return content + "\n";
        },
      });
    }
    return this.turndownService;
  }

  /**
   * Convert HTML to Markdown format for better translation context
   * @param html - HTML content to convert
   * @returns Markdown formatted text
   */
  static convertHtmlToMarkdown(html: string): string {
    if (!html || typeof html !== "string") {
      return "";
    }

    // Use a simple placeholder that won't be escaped by Turndown
    const lineBreakPlaceholder = "XXLINEBREAKXX";
    let preprocessed = html
      .replace(/\r\n/g, lineBreakPlaceholder)
      .replace(/\r/g, lineBreakPlaceholder)
      .replace(/\n/g, lineBreakPlaceholder);

    // Convert with Turndown
    const turndownService = this.getTurndownService();
    let markdown = turndownService.turndown(preprocessed);

    // Restore line breaks from placeholders
    markdown = markdown.split(lineBreakPlaceholder).join("\n");

    // Clean up escaped asterisks that should be bullet points
    markdown = markdown.replace(/\\(\*)/g, "$1");

    return markdown;
  }

  /**
   * Clean text by removing extra whitespace while preserving line breaks
   * @param text - Text to clean
   * @returns Cleaned text with preserved line breaks
   */
  static cleanText(text: string): string {
    if (!text || typeof text !== "string") {
      return "";
    }

    return (
      text
        // Normalize different line break types to \n
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        // Clean up common escaped markdown characters that should be plain text
        .replace(/\\([*_\-#])/g, "$1")
        // Remove excessive spaces within lines but preserve single spaces
        .replace(/[ \t]+/g, " ")
        // Limit consecutive newlines to maximum of 2 (paragraph break)
        .replace(/\n{3,}/g, "\n\n")
        // Remove trailing spaces at end of lines (but preserve the newlines)
        .replace(/[ \t]+\n/g, "\n")
        // Remove leading/trailing whitespace from the entire text
        .trim()
    );
  }

  /**
   * Prepare text for translation by processing HTML and applying appropriate formatting
   * @param text - Raw text content (may contain HTML)
   * @returns Processed text ready for translation
   */
  static prepareForTranslation(text: string): string {
    if (!text || typeof text !== "string") {
      return "";
    }

    // Check if the text contains HTML tags (but not just URLs in angle brackets)
    const hasHtmlTags = /<(?!https?:\/\/)[^>]+>/.test(text);

    if (hasHtmlTags) {
      // Convert HTML to Markdown for better translation context
      const markdown = this.convertHtmlToMarkdown(text);
      const result = this.cleanText(markdown);
      return result;
    } else {
      // For plain text, just remove URLs but keep everything else minimal
      const result = text
        // Normalize line breaks first
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        // Remove URLs in angle brackets
        .replace(/<https?:\/\/[^>]+>/g, "")
        .replace(/<www\.[^>]+>/g, "")
        // Remove email addresses in angle brackets
        .replace(/<[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Z|a-z]{2,}>/gi, "")
        // Only trim leading/trailing whitespace from the entire text
        .trim();

      return result;
    }
  }

  /**
   * Check if content contains translatable text
   * @param text - Text to check
   * @returns True if text contains meaningful content for translation
   */
  static hasTranslatableContent(text: string): boolean {
    if (!text || typeof text !== "string") {
      return false;
    }

    const cleaned = text.trim();

    // Must have at least some characters and contain letters
    return (
      cleaned.length >= 3 && /[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/.test(cleaned)
    );
  }

  /**
   * Validate that text is safe for insertion into email
   * @param text - Text to validate
   * @returns True if text is safe to insert
   */
  static isSafeForInsertion(text: string): boolean {
    if (!text || typeof text !== "string") {
      return false;
    }

    // Check for potentially dangerous content
    const dangerousPatterns = [/<script/i, /javascript:/i, /data:/i, /vbscript:/i, /on\w+\s*=/i];

    return !dangerousPatterns.some((pattern) => pattern.test(text));
  }
}

/**
 * Export utility functions for convenient access
 */
export const {
  prepareForTranslation,
  hasTranslatableContent,
  isSafeForInsertion,
  cleanText,
  convertHtmlToMarkdown,
} = TextProcessor;
