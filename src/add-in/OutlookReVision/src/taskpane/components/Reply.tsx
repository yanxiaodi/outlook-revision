import * as React from "react";
import { makeStyles, Button, Text, Spinner, tokens } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { useOutlookService, useReVisionService, useIsMockMode } from "../../services";
import type { OutlookMode } from "../../services/OutlookService";
import { useSettings } from "../../hooks/useSettings";
import { getLanguageNameByCode } from "../../data/languages";
import { useToast, ToastType } from "../../hooks/useToast";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    width: "100%",
    height: "100%",
    minHeight: 0,
    overflowY: "auto",
  },
  button: {
    alignSelf: "flex-center",
  },
  buttonWithSpinner: {
    alignSelf: "flex-center",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  buttonGroup: {
    display: "flex",
    gap: "4px",
    justifyContent: "center",
    flexWrap: "wrap",
    flexShrink: 0,
    margin: "8px 0",
  },
  textareaContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flexShrink: 0,
  },

  label: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#323130",
    flexShrink: 0,
    marginBottom: "4px",
  },
  textarea: {
    width: "100%",
    minHeight: "150px",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    resize: "vertical",
    fontFamily: tokens.fontFamilyBase,
    fontSize: "14px",
    lineHeight: "1.4",
    border: "1px solid #8a8886",
    borderRadius: "2px",
    padding: "8px",
    outline: "none",
    boxSizing: "border-box",
  },
  statusText: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground2,
    fontStyle: "italic",
    flexShrink: 0,
    margin: "4px 0",
  },
  errorText: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorPaletteRedForeground1,
    flexShrink: 0,
    margin: "4px 0",
  },
});

const Reply: React.FC = () => {
  const styles = useStyles();
  const { t } = useTranslation(["common", "labels", "buttons"]);
  const outlookService = useOutlookService();
  const reVisionService = useReVisionService();
  const isMockMode = useIsMockMode();
  const { settings } = useSettings();
  const { showToast } = useToast();

  const [originalEmail, setOriginalEmail] = React.useState(""); // Hidden - stored locally
  const [contextInput, setContextInput] = React.useState("");
  const [generatedReply, setGeneratedReply] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [currentEmailId, setCurrentEmailId] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<OutlookMode>("mailRead");
  const isReadLike = mode === "mailRead" || mode === "meetingDetailsAttendee";

  // Load saved state on component mount and check for new email
  React.useEffect(() => {
    const initializeComponent = async () => {
      // Detect current Outlook mode (read/compose and meeting scenarios)
      try {
        const modeResult = await outlookService.getMode();
        if (modeResult.success && modeResult.data) {
          setMode(modeResult.data);
        }
      } catch (e) {
        // Non-fatal: keep default mode
      }

      // First check if this is a new email
      const newEmailResult = await outlookService.checkForNewEmail(currentEmailId);
      const isNewEmail = newEmailResult.success && newEmailResult.data;

      if (isNewEmail) {
        // New email detected - get the new email ID and clear previous reply
        const emailIdResult = await outlookService.getCurrentEmailId();
        if (emailIdResult.success && emailIdResult.data) {
          setCurrentEmailId(emailIdResult.data);
        }

        setGeneratedReply("");
        setIsInitialized(false);

        // Clear localStorage for reply content
        localStorage.removeItem("reply-generated-reply");
        localStorage.removeItem("reply-context-input");
      } else {
        // Same email - restore saved state
        const savedContextInput = localStorage.getItem("reply-context-input");
        const savedGeneratedReply = localStorage.getItem("reply-generated-reply");

        if (savedContextInput) {
          setContextInput(savedContextInput);
        }
        if (savedGeneratedReply) {
          setGeneratedReply(savedGeneratedReply);
        }
      }
    };

    initializeComponent();
  }, []);

  // Auto-initialize with email content if no saved state or new email
  React.useEffect(() => {
    const initializeWithEmailContent = async () => {
      if (isInitialized || originalEmail.trim()) return; // Don't override existing content

      try {
        // Get current email ID for tracking
        if (!currentEmailId) {
          const emailIdResult = await outlookService.getCurrentEmailId();
          if (emailIdResult.success && emailIdResult.data) {
            setCurrentEmailId(emailIdResult.data);
          }
        }

        // Load original email for context (but don't show it)
        const result = await outlookService.getEmailContent("text");
        if (result.success && result.data?.processedText.trim()) {
          setOriginalEmail(result.data.processedText);
          setIsInitialized(true);
        }
      } catch (err) {
        console.log("Could not auto-initialize with email content:", err);
      }
    };

    // Small delay to ensure service is ready
    const timer = setTimeout(initializeWithEmailContent, 500);
    return () => clearTimeout(timer);
  }, [outlookService, isInitialized, originalEmail, currentEmailId]);

  // Periodic check for email context changes
  React.useEffect(() => {
    const checkEmailChange = async () => {
      if (!currentEmailId) return;

      const newEmailResult = await outlookService.checkForNewEmail(currentEmailId);
      const isNewEmail = newEmailResult.success && newEmailResult.data;

      if (isNewEmail) {
        // New email detected - get the new email ID and update state
        const emailIdResult = await outlookService.getCurrentEmailId();
        if (emailIdResult.success && emailIdResult.data) {
          setCurrentEmailId(emailIdResult.data);
        }

        // Clear previous reply state
        setGeneratedReply("");
        setIsInitialized(false);

        // Clear localStorage for reply content
        localStorage.removeItem("reply-generated-reply");
        localStorage.removeItem("reply-context-input");

        // Auto-load new original email content (but don't show it)
        try {
          const result = await outlookService.getEmailContent("text");
          if (result.success && result.data?.processedText.trim()) {
            setOriginalEmail(result.data.processedText);
            setIsInitialized(true);
          }
        } catch (err) {
          console.log("Could not load new email content:", err);
        }
      }
    };

    // Check every 3 seconds for email context changes
    const interval = setInterval(checkEmailChange, 3000);
    return () => clearInterval(interval);
  }, [currentEmailId, outlookService]);

  // Save contextInput to localStorage when it changes
  React.useEffect(() => {
    if (contextInput) {
      localStorage.setItem("reply-context-input", contextInput);
    } else {
      localStorage.removeItem("reply-context-input");
    }
  }, [contextInput]);

  // Save generatedReply to localStorage when it changes
  React.useEffect(() => {
    if (generatedReply) {
      localStorage.setItem("reply-generated-reply", generatedReply);
    } else {
      localStorage.removeItem("reply-generated-reply");
    }
  }, [generatedReply]);

  const handleGenerateReply = async () => {
    setIsLoading(true);

    try {
      let emailToReplyTo = originalEmail.trim();

      // If we don't have the original email loaded, get it
      if (!emailToReplyTo) {
        const result = await outlookService.getEmailContent("text");

        if (!result.success) {
          // Log specific error for debugging
          console.error("Failed to get email content:", result.error);
          // Show generic translated error message to user
          showToast(ToastType.Error, "common:toasts.noContent");
          return;
        }

        const emailContent = result.data!;
        emailToReplyTo = emailContent.processedText;

        if (!emailToReplyTo.trim()) {
          showToast(ToastType.Error, "common:toasts.noEmailToReply");
          return;
        }

        // Store the extracted email content
        setOriginalEmail(emailToReplyTo);
      }

      // Get reply language from settings (use email writing language)
      const replyLanguage = settings.emailWritingLanguage;

      // Combine original email and user context for reply generation
      const contextForReply = contextInput.trim()
        ? `User context: ${contextInput}\n\nOriginal email: ${emailToReplyTo}`
        : emailToReplyTo;

      // Call ReVision service to generate reply
      const replyResult = await reVisionService.generateReply({
        emailBody: contextForReply,
        language: replyLanguage,
        context: contextInput.trim(), // Allow empty string
        writingTone: settings.writingTone || "professional",
      });

      if (!replyResult.success) {
        console.error("Reply generation failed:", replyResult.error);

        // Check if it's a rate limit error
        if (replyResult.error?.includes("[RATE_LIMIT_EXCEEDED]")) {
          const message = replyResult.error
            .split("|RESET:")[0]
            .replace("[RATE_LIMIT_EXCEEDED]", "");
          showToast(ToastType.Error, message);
          return;
        }

        // Check for network errors
        const isNetworkError =
          replyResult.error?.toLowerCase().includes("network") ||
          replyResult.error?.toLowerCase().includes("fetch");
        showToast(
          ToastType.Error,
          isNetworkError ? "common:toasts.networkError" : "common:toasts.replyFailed"
        );
        return;
      }

      // Set the generated reply
      setGeneratedReply(replyResult.data!.text);
      showToast(ToastType.Success, "common:toasts.replyGenerated");
    } catch (err) {
      console.error("Reply generation error:", err);
      showToast(ToastType.Error, "common:toasts.unexpectedError");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReply = async () => {
    try {
      await navigator.clipboard.writeText(generatedReply);
      showToast(ToastType.Success, "common:toasts.copiedToClipboard");
    } catch (err) {
      console.error("Failed to copy reply:", err);
      showToast(ToastType.Error, "common:toasts.copyFailed");
    }
  };

  const handleInsertReply = async () => {
    try {
      const result = await outlookService.insertText(generatedReply);
      if (!result.success) {
        // Log specific error for debugging
        console.error("Failed to insert text:", result.error);
        // Show generic translated error message to user
        showToast(ToastType.Error, "common:toasts.insertFailed");
      } else {
        showToast(ToastType.Success, "common:toasts.textInserted");
      }
    } catch (err) {
      console.error("Failed to insert reply:", err);
      showToast(ToastType.Error, "common:toasts.insertFailed");
    }
  };

  const handleClear = () => {
    setContextInput("");
    setGeneratedReply("");
    localStorage.removeItem("reply-context-input");
    localStorage.removeItem("reply-generated-reply");
  };

  return (
    <div className={styles.root}>
      {isMockMode && <Text className={styles.statusText}>{t("messages.mockModeDevTools")}</Text>}

      <div className={styles.textareaContainer}>
        <label className={styles.label}>{t("labels:contextOptional")}</label>
        <textarea
          className={styles.textarea}
          placeholder={t("labels:contextPlaceholder")}
          value={contextInput}
          onChange={(e) => setContextInput(e.target.value)}
        />
      </div>

      <div className={styles.buttonGroup}>
        <Button
          appearance="secondary"
          className={styles.button}
          onClick={handleClear}
          disabled={isLoading}
        >
          {t("buttons:clear")}
        </Button>

        <Button
          appearance="primary"
          className={isLoading ? styles.buttonWithSpinner : styles.button}
          onClick={handleGenerateReply}
          disabled={isLoading}
        >
          {isLoading && <Spinner size="tiny" />}
          {isLoading ? t("buttons:generatingReply") : t("buttons:generateReply")}
        </Button>
      </div>

      <div className={styles.textareaContainer}>
        <label className={styles.label}>{t("labels:generatedReply")}</label>
        <textarea
          className={styles.textarea}
          value={generatedReply}
          onChange={(e) => setGeneratedReply(e.target.value)}
          placeholder={t("labels:generatedReplyPlaceholder")}
        />
      </div>

      {generatedReply && (
        <div className={styles.buttonGroup}>
          <Button appearance="secondary" className={styles.button} onClick={handleCopyReply}>
            {t("buttons:copyToClipboard")}
          </Button>

          <Button
            appearance="primary"
            className={styles.button}
            onClick={handleInsertReply}
            disabled={isReadLike}
          >
            {t("buttons:insertIntoEmail")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Reply;
