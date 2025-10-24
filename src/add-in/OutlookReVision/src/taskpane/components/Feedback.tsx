import * as React from "react";
import { useState, useEffect } from "react";
import {
  Button,
  Field,
  Input,
  Textarea,
  Radio,
  RadioGroup,
  Spinner,
  Text,
  Title1,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  SendRegular,
  ArrowLeft24Regular,
  InfoRegular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { FEEDBACK_TYPES, FeedbackTypeKey, FeedbackFormData } from "../../types/feedback";
import { feedbackService } from "../../services/FeedbackService";
import { useToast, ToastType } from "../../hooks/useToast";

/* global Office */

export interface FeedbackProps {
  onBackClick?: () => void;
}

const useStyles = makeStyles({
  container: {
    padding: "0",
    minHeight: "100vh",
  },
  backButton: {
    minWidth: "auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "0px",
  },
  content: {
    paddingTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  description: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    marginTop: "0px",
    marginBottom: "0px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    width: "100%",
    boxSizing: "border-box",
  },
  ratingGroup: {
    display: "flex",
    gap: tokens.spacingHorizontalS,
    alignItems: "center",
  },
  starButton: {
    minWidth: "32px",
    padding: "4px",
    fontSize: "20px",
  },
  buttonGroup: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
    justifyContent: "center",
  },
  infoText: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginTop: tokens.spacingVerticalXS,
  },
  infoIcon: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorBrandForeground1,
  },
});

export const Feedback: React.FC<FeedbackProps> = ({ onBackClick }) => {
  const styles = useStyles();
  const { t } = useTranslation(['feedback', 'common']);
  const { showToast } = useToast();

  const [formData, setFormData] = useState<FeedbackFormData>({
    firstName: "",
    lastName: "",
    email: "",
    feedbackType: "generalFeedback",
    message: "",
    rating: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmailFromOutlook, setIsEmailFromOutlook] = useState(false);
  const [outlookUserProfile, setOutlookUserProfile] = useState<{
    email?: string;
    firstName?: string;
    lastName?: string;
  }>({});

  // Auto-populate user info from Outlook user profile on component mount
  useEffect(() => {
    try {
      const userProfile = Office.context.mailbox?.userProfile;
      if (userProfile) {
        const email = userProfile.emailAddress;
        const displayName = userProfile.displayName;
        
        // Parse display name into first and last name
        let firstName = "";
        let lastName = "";
        if (displayName) {
          const nameParts = displayName.trim().split(/\s+/);
          firstName = nameParts[0] || "";
          lastName = nameParts.slice(1).join(" ") || "";
        }

        // Store Outlook profile for reset functionality
        setOutlookUserProfile({ email, firstName, lastName });

        // Update form data
        setFormData((prev) => ({
          ...prev,
          email: email || prev.email,
          firstName: firstName || prev.firstName,
          lastName: lastName || prev.lastName,
        }));

        // Mark email as coming from Outlook if available
        if (email) {
          setIsEmailFromOutlook(true);
        }
      }
    } catch (error) {
      // Silently fail if we can't get the user info - user can still enter it manually
      console.warn("Could not retrieve user profile from Outlook:", error);
    }
  }, []);

  const handleInputChange = (field: keyof FeedbackFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // If user manually changes email, mark it as no longer from Outlook
    if (field === "email" && isEmailFromOutlook) {
      setIsEmailFromOutlook(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const resetForm = () => {
    // Reset to Outlook profile data if available, otherwise clear
    setFormData({
      firstName: outlookUserProfile.firstName || "",
      lastName: outlookUserProfile.lastName || "",
      email: outlookUserProfile.email || "",
      feedbackType: "generalFeedback",
      message: "",
      rating: 0,
    });
    
    // Restore email indicator if we have Outlook email
    if (outlookUserProfile.email) {
      setIsEmailFromOutlook(true);
    }
    
    setSubmitStatus("idle");
    setErrorMessage("");
  };

  const getAddInVersion = (): string => {
    // You can update this when you release new versions
    return "1.0.0";
  };

  const getOutlookVersion = (): string => {
    try {
      return Office.context.diagnostics.version;
    } catch {
      return "Unknown";
    }
  };

  const getPlatform = (): string => {
    try {
      const platform = Office.context.diagnostics.platform;
      return platform ? String(platform) : "Unknown";
    } catch {
      return "Unknown";
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.firstName.trim()) {
      showToast(ToastType.Error, t("validation.firstName"));
      return;
    }

    if (!formData.lastName.trim()) {
      showToast(ToastType.Error, t("validation.lastName"));
      return;
    }

    if (!formData.email.trim()) {
      showToast(ToastType.Error, t("validation.email"));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast(ToastType.Error, t("validation.emailInvalid"));
      return;
    }

    if (!formData.message.trim()) {
      showToast(ToastType.Error, t("validation.message"));
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await feedbackService.submitFeedback({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        feedbackType: FEEDBACK_TYPES[formData.feedbackType],
        rating: formData.rating > 0 ? formData.rating : undefined,
        version: getAddInVersion(),
        userAgent: navigator.userAgent,
        outlookVersion: getOutlookVersion(),
        platform: getPlatform(),
      });

      if (response.success) {
        setSubmitStatus("success");
        showToast(ToastType.Success, t("success"));
        // Reset form after 3 seconds
        setTimeout(() => {
          resetForm();
        }, 3000);
      } else {
        setSubmitStatus("error");
        setErrorMessage(response.message);
        showToast(ToastType.Error, t("error"));
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : t("errorUnknown"));
      showToast(ToastType.Error, t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Button
          key={i}
          appearance="subtle"
          className={styles.starButton}
          onClick={() => handleRatingClick(i)}
          disabled={isSubmitting}
        >
          {i <= formData.rating ? "⭐" : "☆"}
        </Button>
      );
    }
    return <div className={styles.ratingGroup}>{stars}</div>;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          appearance="subtle"
          icon={<ArrowLeft24Regular />}
          className={styles.backButton}
          onClick={onBackClick}
          aria-label={t('common:back')}
        />
        <Title1>{t("title")}</Title1>
      </div>
      
      <div className={styles.content}>
        <Text className={styles.description}>{t("description")}</Text>

        <form className={styles.form}>
        <Field label={t("firstName")} required>
          <Input
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            disabled={isSubmitting}
            placeholder={t("firstNamePlaceholder")}
          />
        </Field>

        <Field label={t("lastName")} required>
          <Input
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            disabled={isSubmitting}
            placeholder={t("lastNamePlaceholder")}
          />
        </Field>

        <Field label={t("email")} required>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            disabled={isSubmitting}
            placeholder={t("emailPlaceholder")}
          />
          {isEmailFromOutlook && formData.email && (
            <div className={styles.infoText}>
              <InfoRegular className={styles.infoIcon} />
              <Text size={200}>{t("emailFromProfile")}</Text>
            </div>
          )}
        </Field>

        <Field label={t("type")} required>
          <RadioGroup
            value={formData.feedbackType}
            onChange={(_, data) => handleInputChange("feedbackType", data.value)}
            disabled={isSubmitting}
          >
            <Radio value="bugReport" label={t("types.bugReport")} />
            <Radio value="featureRequest" label={t("types.featureRequest")} />
            <Radio value="generalFeedback" label={t("types.generalFeedback")} />
            <Radio value="other" label={t("types.other")} />
          </RadioGroup>
        </Field>

        <Field label={t("rating")}>
          <Text size={200}>{t("ratingDescription")}</Text>
          {renderStars()}
        </Field>

        <Field label={t("message")} required>
          <Textarea
            value={formData.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
            disabled={isSubmitting}
            placeholder={t("messagePlaceholder")}
            rows={6}
            resize="vertical"
          />
        </Field>

        <div className={styles.buttonGroup}>
          <Button
            appearance="primary"
            icon={isSubmitting ? <Spinner size="tiny" /> : <SendRegular />}
            onClick={handleSubmit}
            disabled={isSubmitting || submitStatus === "success"}
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>

          <Button appearance="secondary" onClick={resetForm} disabled={isSubmitting}>
            {t("reset")}
          </Button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;


