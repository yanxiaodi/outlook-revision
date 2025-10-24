import * as React from "react";
import { makeStyles, Button, Text, Spinner, tokens, Input } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { useOutlookService, useReVisionService, useIsMockMode } from "../../services";
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
  subjectRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "0px",
  },
  subjectInput: {
    flex: 1,
    minWidth: 0,
  },
});

const Compose: React.FC = () => {
  const styles = useStyles();
  const { t } = useTranslation(["common", "labels", "buttons"]);
  const outlookService = useOutlookService();
  const reVisionService = useReVisionService();
  const isMockMode = useIsMockMode();
  const { settings } = useSettings();
  const { showToast } = useToast();

  const [contextInput, setContextInput] = React.useState("");
  const [recipientName, setRecipientName] = React.useState("");
  const [recipientRelationship, setRecipientRelationship] = React.useState("");
  const [generatedSubject, setGeneratedSubject] = React.useState("");
  const [generatedBody, setGeneratedBody] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [currentEmailId, setCurrentEmailId] = React.useState<string | null>(null);

  // Restore saved state
  React.useEffect(() => {
    const initializeComponent = async () => {
      // First check if this is a new email/compose window
      const newEmailResult = await outlookService.checkForNewEmail(currentEmailId);
      const isNewEmail = newEmailResult.success && newEmailResult.data;

      if (isNewEmail) {
        // New email/compose window detected - get the new email ID and clear previous state
        const emailIdResult = await outlookService.getCurrentEmailId();
        if (emailIdResult.success && emailIdResult.data) {
          setCurrentEmailId(emailIdResult.data);
        }

        // Clear all previous compose state
        setContextInput("");
        setRecipientName("");
        setRecipientRelationship("");
        setGeneratedSubject("");
        setGeneratedBody("");
        setIsInitialized(true);

        // Clear localStorage for compose content
        localStorage.removeItem("compose-context-input");
        localStorage.removeItem("compose-recipient-name");
        localStorage.removeItem("compose-recipient-relationship");
        localStorage.removeItem("compose-generated-subject");
        localStorage.removeItem("compose-generated-body");
      } else {
        // Same email/compose window - restore saved state
        const savedContext = localStorage.getItem("compose-context-input");
        const savedRecipientName = localStorage.getItem("compose-recipient-name");
        const savedRecipientRelationship = localStorage.getItem("compose-recipient-relationship");
        const savedSubject = localStorage.getItem("compose-generated-subject");
        const savedBody = localStorage.getItem("compose-generated-body");

        if (savedContext) setContextInput(savedContext);
        if (savedRecipientName) setRecipientName(savedRecipientName);
        if (savedRecipientRelationship) setRecipientRelationship(savedRecipientRelationship);
        if (savedSubject) setGeneratedSubject(savedSubject);
        if (savedBody) setGeneratedBody(savedBody);
        setIsInitialized(true);
      }
    };

    initializeComponent();
  }, []);

  // Initialize email ID tracking if not set
  React.useEffect(() => {
    const initializeEmailId = async () => {
      if (!currentEmailId && !isInitialized) {
        const emailIdResult = await outlookService.getCurrentEmailId();
        if (emailIdResult.success && emailIdResult.data) {
          setCurrentEmailId(emailIdResult.data);
        }
        setIsInitialized(true);
      }
    };

    // Small delay to ensure service is ready
    const timer = setTimeout(initializeEmailId, 500);
    return () => clearTimeout(timer);
  }, [currentEmailId, isInitialized]);

  // Periodic check for email context changes
  React.useEffect(() => {
    const checkEmailChange = async () => {
      if (!currentEmailId) return;

      const newEmailResult = await outlookService.checkForNewEmail(currentEmailId);
      const isNewEmail = newEmailResult.success && newEmailResult.data;

      if (isNewEmail) {
        // New email/compose window detected - get the new email ID and update state
        const emailIdResult = await outlookService.getCurrentEmailId();
        if (emailIdResult.success && emailIdResult.data) {
          setCurrentEmailId(emailIdResult.data);
        }

        // Clear previous compose state
        setContextInput("");
        setRecipientName("");
        setGeneratedSubject("");
        setGeneratedBody("");

        // Clear localStorage for compose content
        localStorage.removeItem("compose-context-input");
        localStorage.removeItem("compose-recipient-name");
        localStorage.removeItem("compose-generated-subject");
        localStorage.removeItem("compose-generated-body");
      }
    };

    // Check every 3 seconds for email context changes
    const interval = setInterval(checkEmailChange, 3000);
    return () => clearInterval(interval);
  }, [currentEmailId, outlookService]);

  // Save state to localStorage when it changes
  React.useEffect(() => {
    if (contextInput) {
      localStorage.setItem("compose-context-input", contextInput);
    } else {
      localStorage.removeItem("compose-context-input");
    }
  }, [contextInput]);

  React.useEffect(() => {
    if (recipientName) {
      localStorage.setItem("compose-recipient-name", recipientName);
    } else {
      localStorage.removeItem("compose-recipient-name");
    }
  }, [recipientName]);

  React.useEffect(() => {
    if (recipientRelationship) {
      localStorage.setItem("compose-recipient-relationship", recipientRelationship);
    } else {
      localStorage.removeItem("compose-recipient-relationship");
    }
  }, [recipientRelationship]);

  React.useEffect(() => {
    if (generatedSubject) {
      localStorage.setItem("compose-generated-subject", generatedSubject);
    } else {
      localStorage.removeItem("compose-generated-subject");
    }
  }, [generatedSubject]);

  React.useEffect(() => {
    if (generatedBody) {
      localStorage.setItem("compose-generated-body", generatedBody);
    } else {
      localStorage.removeItem("compose-generated-body");
    }
  }, [generatedBody]);

  const handleComposeEmail = async () => {
    setIsLoading(true);
    try {
      const context = contextInput.trim();
      if (!context) {
        showToast(ToastType.Error, "common:toasts.emptyContext");
        return;
      }

      const result = await reVisionService.generateCompose({
        context,
        language: settings.emailWritingLanguage,
        writingTone: settings.writingTone || "professional",
        recipientName: recipientName.trim() || undefined,
        recipientRelationship: recipientRelationship.trim() || undefined,
      });

      if (!result.success || !result.data) {
        console.error("Compose generation failed:", result.error);

        // Check if it's a rate limit error
        if (result.error?.includes("[RATE_LIMIT_EXCEEDED]")) {
          const message = result.error.split("|RESET:")[0].replace("[RATE_LIMIT_EXCEEDED]", "");
          showToast(ToastType.Error, message);
          return;
        }

        // Check for network errors
        const isNetworkError =
          result.error?.toLowerCase().includes("network") ||
          result.error?.toLowerCase().includes("fetch");
        showToast(
          ToastType.Error,
          isNetworkError ? "common:toasts.networkError" : "common:toasts.composeFailed"
        );
        return;
      }

      setGeneratedSubject(result.data.subject || "");
      setGeneratedBody(result.data.body || "");
      showToast(ToastType.Success, "common:toasts.emailComposed");
    } catch (err) {
      console.error("Compose generation error:", err);
      showToast(ToastType.Error, "common:toasts.unexpectedError");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyBody = async () => {
    try {
      await navigator.clipboard.writeText(generatedBody);
      showToast(ToastType.Success, "common:toasts.copiedToClipboard");
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast(ToastType.Error, "common:toasts.copyFailed");
    }
  };

  const handleInsertBody = async () => {
    try {
      const res = await outlookService.insertText(generatedBody);
      if (!res.success) {
        // Log specific error for debugging
        console.error("Failed to insert text:", res.error);
        // Show generic translated error message to user
        showToast(ToastType.Error, "common:toasts.insertFailed");
      } else {
        showToast(ToastType.Success, "common:toasts.textInserted");
      }
    } catch (err) {
      console.error("Insert body error:", err);
      showToast(ToastType.Error, "common:toasts.insertFailed");
    }
  };

  const handleInsertSubject = async () => {
    try {
      const res = await outlookService.setSubject(generatedSubject);
      if (!res.success) {
        // Log specific error for debugging
        console.error("Failed to set subject:", res.error);
        // Show generic translated error message to user
        showToast(ToastType.Error, "common:toasts.subjectSetFailed");
      } else {
        showToast(ToastType.Success, "common:toasts.subjectSet");
      }
    } catch (err) {
      console.error("Insert subject error:", err);
      showToast(ToastType.Error, "common:toasts.subjectSetFailed");
    }
  };

  const handleClear = () => {
    setContextInput("");
    setRecipientName("");
    setRecipientRelationship("");
    setGeneratedSubject("");
    setGeneratedBody("");
    // localStorage will be cleared automatically by the useEffect hooks
  };

  return (
    <div className={styles.root}>
      {isMockMode && <Text className={styles.statusText}>{t("messages.mockModeDevTools")}</Text>}

      <div className={styles.textareaContainer}>
        <label className={styles.label}>{t("labels:recipientName")}</label>
        <Input
          value={recipientName}
          onChange={(_, data) => setRecipientName(data.value)}
          placeholder={t("labels:recipientNamePlaceholder")}
        />
      </div>

      <div className={styles.textareaContainer}>
        <label className={styles.label}>{t("labels:recipientRelationship")}</label>
        <Input
          value={recipientRelationship}
          onChange={(_, data) => setRecipientRelationship(data.value)}
          placeholder={t("labels:recipientRelationshipPlaceholder")}
        />
      </div>

      <div className={styles.textareaContainer}>
        <label className={styles.label}>{t("labels:contextRequired")}</label>
        <textarea
          className={styles.textarea}
          placeholder={t("labels:contextRequiredPlaceholder")}
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
          onClick={handleComposeEmail}
          disabled={isLoading}
        >
          {isLoading && <Spinner size="tiny" />}
          {isLoading ? t("buttons:composing") : t("buttons:composeEmail")}
        </Button>
      </div>

      {(generatedSubject || generatedBody) && (
        <>
          <div className={styles.textareaContainer}>
            <label className={styles.label}>{t("labels:generatedSubject")}</label>
            <div className={styles.subjectRow}>
              <Input
                className={styles.subjectInput}
                value={generatedSubject}
                onChange={(_, data) => setGeneratedSubject(data.value)}
                placeholder={t("labels:generatedSubjectPlaceholder")}
              />
              <Button
                appearance="primary"
                onClick={handleInsertSubject}
                disabled={!generatedSubject}
              >
                {t("buttons:insertSubject")}
              </Button>
            </div>
          </div>

          <div className={styles.textareaContainer}>
            <label className={styles.label}>{t("labels:generatedBody")}</label>
            <textarea
              className={styles.textarea}
              value={generatedBody}
              onChange={(e) => setGeneratedBody(e.target.value)}
              placeholder={t("labels:generatedBodyPlaceholder")}
            />
          </div>

          <div className={styles.buttonGroup}>
            <Button appearance="secondary" className={styles.button} onClick={handleCopyBody}>
              {t("buttons:copyToClipboard")}
            </Button>

            <Button appearance="primary" className={styles.button} onClick={handleInsertBody}>
              {t("buttons:insertIntoEmail")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Compose;
