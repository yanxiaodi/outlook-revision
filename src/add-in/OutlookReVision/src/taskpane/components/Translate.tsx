import * as React from "react";
import { makeStyles, Button, Text, Spinner, tokens } from "@fluentui/react-components";
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
});

const Translate: React.FC = () => {
  const styles = useStyles();
  const { t } = useTranslation(["common", "labels", "buttons"]);
  const outlookService = useOutlookService();
  const reVisionService = useReVisionService();
  const isMockMode = useIsMockMode();
  const { settings } = useSettings();
  const { showToast } = useToast();

  const [emailBody, setEmailBody] = React.useState("");
  const [translatedText, setTranslatedText] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [currentEmailId, setCurrentEmailId] = React.useState<string | null>(null);

  // Load saved state on component mount and check for new email
  React.useEffect(() => {
    const initializeComponent = async () => {
      // First check if this is a new email
      const newEmailResult = await outlookService.checkForNewEmail(currentEmailId);
      const isNewEmail = newEmailResult.success && newEmailResult.data;
      
      if (isNewEmail) {
        // New email detected - get the new email ID and clear previous translation
        const emailIdResult = await outlookService.getCurrentEmailId();
        if (emailIdResult.success && emailIdResult.data) {
          setCurrentEmailId(emailIdResult.data);
        }
        
        setTranslatedText("");
        setIsInitialized(false);
        
        // Clear localStorage for translate content
        localStorage.removeItem('translate-translated-text');
        localStorage.removeItem('translate-input-text');
      } else {
        // Same email - restore saved state
        const savedInputText = localStorage.getItem('translate-input-text');
        const savedTranslatedText = localStorage.getItem('translate-translated-text');
        
        if (savedInputText) {
          setEmailBody(savedInputText);
          setIsInitialized(true);
        }
        if (savedTranslatedText) {
          setTranslatedText(savedTranslatedText);
        }
      }
    };

    initializeComponent();
  }, []);

  // Auto-initialize with email content if no saved state or new email
  React.useEffect(() => {
    const initializeWithEmailContent = async () => {
      if (isInitialized || emailBody.trim()) return; // Don't override existing content

      try {
        // Get current email ID for tracking
        if (!currentEmailId) {
          const emailIdResult = await outlookService.getCurrentEmailId();
          if (emailIdResult.success && emailIdResult.data) {
            setCurrentEmailId(emailIdResult.data);
          }
        }

        const result = await outlookService.getEmailContent("text");
        if (result.success && result.data?.processedText.trim()) {
          setEmailBody(result.data.processedText);
          setIsInitialized(true);
        }
      } catch (err) {
        console.log("Could not auto-initialize with email content:", err);
      }
    };

    // Small delay to ensure service is ready
    const timer = setTimeout(initializeWithEmailContent, 500);
    return () => clearTimeout(timer);
  }, [outlookService, isInitialized, emailBody, currentEmailId]);

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
        
        // Clear previous translation state
        setTranslatedText("");
        setIsInitialized(false);
        
        // Clear localStorage for translate content
        localStorage.removeItem('translate-translated-text');
        localStorage.removeItem('translate-input-text');
        
        // Auto-load new content
        try {
          const result = await outlookService.getEmailContent("text");
          if (result.success && result.data?.processedText.trim()) {
            setEmailBody(result.data.processedText);
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

  // Save emailBody to localStorage when it changes
  React.useEffect(() => {
    if (emailBody) {
      localStorage.setItem('translate-input-text', emailBody);
    } else {
      localStorage.removeItem('translate-input-text');
    }
  }, [emailBody]);

  // Save translatedText to localStorage when it changes
  React.useEffect(() => {
    if (translatedText) {
      localStorage.setItem('translate-translated-text', translatedText);
    } else {
      localStorage.removeItem('translate-translated-text');
    }
  }, [translatedText]);

  const handleTranslate = async () => {
    setIsLoading(true);

    try {
      let textToTranslate = emailBody.trim();

      // If input box is empty, show error immediately
      if (!textToTranslate) {
        showToast(ToastType.Error, "common:toasts.noTextToTranslate");
        return;
      }

      // Get target language from settings (use native language as target)
      const targetLanguage = settings.nativeLanguage;

      // Call real translation API
      const translateResult = await reVisionService.translateText({
        emailBody: textToTranslate,
        targetLanguage: targetLanguage
      });

      if (!translateResult.success) {
        console.error("Translation failed:", translateResult.error);
        
        // Check if it's a rate limit error
        if (translateResult.error?.includes('[RATE_LIMIT_EXCEEDED]')) {
          const message = translateResult.error.split('|RESET:')[0].replace('[RATE_LIMIT_EXCEEDED]', '');
          showToast(ToastType.Error, message);
          return;
        }
        
        // Check for network errors
        const isNetworkError = translateResult.error?.toLowerCase().includes('network') || 
                              translateResult.error?.toLowerCase().includes('fetch');
        showToast(ToastType.Error, isNetworkError ? "common:toasts.networkError" : "common:toasts.translationFailed");
        return;
      }

      // Set the translated text
      setTranslatedText(translateResult.data!.text);
      showToast(ToastType.Success, "common:toasts.textTranslated");
    } catch (err) {
      console.error("Translation error:", err);
      showToast(ToastType.Error, "common:toasts.unexpectedError");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setEmailBody("");
    setTranslatedText("");
    localStorage.removeItem('translate-input-text');
    localStorage.removeItem('translate-translated-text');
  };

  return (
    <div className={styles.root}>
      {isMockMode && (
        <Text className={styles.statusText}>
          {t("messages.mockModeDevTools")}
        </Text>
      )}

      <div className={styles.textareaContainer}>
        <label className={styles.label}>{t("labels:enterText")}</label>
        <textarea
          className={styles.textarea}
          placeholder={t("labels:emailPlaceholder")}
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
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
          onClick={handleTranslate}
          disabled={isLoading}
        >
          {isLoading && <Spinner size="tiny" />}
          {isLoading 
            ? t("buttons:translating")
            : t("buttons:translate")
          }
        </Button>
      </div>

      <div className={styles.textareaContainer}>
        <label className={styles.label}>{t("labels:translatedContent")}</label>
        <textarea
          className={styles.textarea}
          value={translatedText}
          readOnly
          placeholder={t("labels:translationPlaceholder")}
        />
      </div>
    </div>
  );
};

export default Translate;
