import * as React from "react";
import {
  makeStyles,
  Button,
  Text,
  Spinner,
  tokens,
  Badge,
  Card,
  CardHeader,
  CardPreview,
  Checkbox,
  Textarea,
  Tab,
  TabList,
  TabValue,
  Overflow,
  OverflowItem,
  useOverflowMenu,
  useIsOverflowItemVisible,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from "@fluentui/react-components";
import {
  CheckmarkFilled,
  AlertFilled,
  WarningFilled,
  MoreHorizontal20Filled,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useOutlookService, useReVisionService, useIsMockMode } from "../../services";
import type { SuggestionItem, SuggestionCategory } from "../../services/ReVisionService";
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
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    backgroundColor: tokens.colorNeutralBackground1,
    flexShrink: 0,
  },
  sectionHeader: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  textArea: {
    width: "100%",
    minHeight: "120px",
    fontFamily: tokens.fontFamilyBase,
    fontSize: "14px",
    lineHeight: "1.4",
    padding: "8px",
    border: "1px solid #8a8886",
    borderRadius: "2px",
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
  },
  smallTextArea: {
    width: "100%",
    minHeight: "80px",
    fontFamily: tokens.fontFamilyBase,
    fontSize: "14px",
    lineHeight: "1.4",
    padding: "8px",
    border: "1px solid #8a8886",
    borderRadius: "2px",
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
  },
  inputField: {
    width: "100%",
    height: "40px",
    fontFamily: tokens.fontFamilyBase,
    fontSize: "14px",
    lineHeight: "1.4",
    padding: "8px",
    border: "1px solid #8a8886",
    borderRadius: "2px",
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    outline: "none",
    boxSizing: "border-box",
  },
  analyzeButton: {
    alignSelf: "flex-start",
  },
  button: {
    alignSelf: "flex-center",
  },
  textareaContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minHeight: 0,
    width: "100%",
    flexShrink: 0,
  },
  label: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#323130",
    flexShrink: 0,
    marginBottom: "4px",
  },
  buttonGroup: {
    display: "flex",
    gap: "4px",
    justifyContent: "center",
    flexWrap: "wrap",
    flexShrink: 0,
    margin: "8px 0",
  },
  revisedButtonGroup: {
    display: "flex",
    gap: "4px",
    justifyContent: "center",
    flexWrap: "wrap",
    flexShrink: 0,
    margin: "8px 0",
  },
  suggestionCard: {
    boxShadow: "none",
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  suggestionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifyContent: "space-between",
  },
  suggestionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
  },
  suggestionContent: {
    marginTop: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  suggestionText: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    backgroundColor: tokens.colorNeutralBackground2,
    padding: "8px",
    borderRadius: "2px",
  },
  selectedSuggestionsActions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    justifyContent: "center",
    margin: "8px 0",
  },
  revisedTextContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  revisedTextarea: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    minHeight: "120px",
    maxHeight: "300px", // Prevent textarea from growing too large
    width: "100%",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
    boxSizing: "border-box",
    resize: "vertical",
    maxWidth: "100%",
    overflow: "hidden", // Prevent textarea from handling its own overflow
  },
  revisedText: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    backgroundColor: tokens.colorNeutralBackground2,
    padding: "12px",
    borderRadius: "2px",
    minHeight: "120px",
    whiteSpace: "pre-wrap",
  },
  badge: {
    marginLeft: "auto",
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
  },
  flexRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  overallContainer: {
    marginBottom: "0px",
  },
  examplesList: {
    margin: "4px 0",
    paddingLeft: "16px",
  },
  nativeLanguageFeedback: {
    marginTop: "8px",
    padding: "8px",
    backgroundColor: tokens.colorNeutralBackground2,
    borderLeft: `3px solid ${tokens.colorBrandBackground}`,
    borderRadius: "2px",
    fontSize: tokens.fontSizeBase200,
    fontStyle: "italic",
    color: tokens.colorNeutralForeground2,
  },
  statusFooter: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground2,
    fontStyle: "italic",
    flexShrink: 0,
    margin: "4px 0",
  },
  tabContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "8px",
  },
  tabList: {
    justifyContent: "center",
  },
  tabContent: {
    paddingTop: "8px",
  },
});

const getSeverityBadge = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "high":
      return {
        appearance: "filled" as const,
        color: "danger" as const,
        icon: <AlertFilled />,
      };
    case "medium":
      return {
        appearance: "filled" as const,
        color: "warning" as const,
        icon: <WarningFilled />,
      };
    case "low":
      return {
        appearance: "filled" as const,
        color: "success" as const,
        icon: <CheckmarkFilled />,
      };
    default:
      return {
        appearance: "filled" as const,
        color: "subtle" as const,
        icon: null,
      };
  }
};

export const Revise: React.FC = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { showToast } = useToast();
  const outlookService = useOutlookService();
  const revisionService = useReVisionService();
  const isMockMode = useIsMockMode();

  // State management
  const [emailBody, setEmailBody] = React.useState<string>("");
  const [emailContext, setEmailContext] = React.useState<string>("");
  const [recipientRelationship, setRecipientRelationship] = React.useState<string>("");
  const [currentEmailId, setCurrentEmailId] = React.useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = React.useState<boolean>(false);
  const [suggestionCategories, setSuggestionCategories] = React.useState<SuggestionCategory[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = React.useState<Set<string>>(new Set());
  const [selectedTab, setSelectedTab] = React.useState<TabValue | undefined>(undefined);
  const [overallScore, setOverallScore] = React.useState<number | null>(null);
  const [overallAssessment, setOverallAssessment] = React.useState<string>("");
  const [isRevising, setIsRevising] = React.useState<boolean>(false);
  const [revisedText, setRevisedText] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  // Component for overflow menu items that only displays when the tab is not visible
  const OverflowMenuItem: React.FC<{
    category: SuggestionCategory;
    onClick: () => void;
  }> = ({ category, onClick }) => {
    const isVisible = useIsOverflowItemVisible(category.categoryName);

    if (isVisible) {
      return null;
    }

    return (
      <MenuItem key={category.categoryName} onClick={onClick}>
        <div>
          {category.categoryName.charAt(0).toUpperCase() + category.categoryName.slice(1)}
          {category.suggestions.length > 0 && (
            <Badge appearance="filled" color="brand" size="small" style={{ marginLeft: "8px" }}>
              {category.suggestions.length}
            </Badge>
          )}
        </div>
      </MenuItem>
    );
  };

  // Component for handling overflow tabs menu
  const OverflowMenu: React.FC<{
    onTabSelect: (categoryName: string) => void;
  }> = ({ onTabSelect }) => {
    const { ref, overflowCount, isOverflowing } = useOverflowMenu<HTMLButtonElement>();

    if (!isOverflowing) {
      return null;
    }

    return (
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Button
            ref={ref}
            appearance="transparent"
            icon={<MoreHorizontal20Filled />}
            aria-label={`${overflowCount} more tabs`}
            role="tab"
          />
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            {suggestionCategories.map((category) => (
              <OverflowMenuItem
                key={category.categoryName}
                category={category}
                onClick={() => onTabSelect(category.categoryName)}
              />
            ))}
          </MenuList>
        </MenuPopover>
      </Menu>
    );
  };

  // Load current email on component mount
  React.useEffect(() => {
    loadCurrentEmail();
  }, []);

  const loadCurrentEmail = async () => {
    try {
      const result = await outlookService.getEmailContent();
      if (result.success && result.data) {
        setEmailBody(result.data.fullBody || "");
        // EmailContent doesn't have id, so we'll use a timestamp as identifier
        setCurrentEmailId(Date.now().toString());
      } else {
        showToast(ToastType.Warning, t("common:toasts.loadEmailError"), {
          body: result.error || t("common.unknownError"),
        });
      }
    } catch (error) {
      console.error("Failed to load current email:", error);
      showToast(ToastType.Error, t("common:toasts.loadEmailError"), {
        body: t("common.unexpectedError"),
      });
    }
  };

  const handleAnalyze = async () => {
    if (!emailBody.trim()) {
      showToast(ToastType.Warning, t("common:toasts.emptyEmailWarning"), {
        body: t("common:toasts.emptyEmailWarningDescription"),
      });
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setSuggestionCategories([]);
    setOverallScore(null);
    setOverallAssessment("");
    setSelectedSuggestions(new Set());
    setSelectedTab(undefined);
    setRevisedText("");

    try {
      const analysisRequest: any = {
        emailBody: emailBody,
        targetLanguage: settings.emailWritingLanguage,
        userNativeLanguage: settings.nativeLanguage,
        writingTone: settings.writingTone,
      };

      if (emailContext.trim()) {
        analysisRequest.emailContext = emailContext.trim();
      }

      if (recipientRelationship.trim()) {
        analysisRequest.recipientRelationship = recipientRelationship.trim();
      }

      const result = await revisionService.analyzeEmail(analysisRequest);

      if (result.success && result.data) {
        setSuggestionCategories(result.data.suggestionCategories || []);
        setOverallScore(result.data.overallScore);
        setOverallAssessment(result.data.overallAssessment || "");

        // Set first category as default tab if categories exist
        if (result.data.suggestionCategories && result.data.suggestionCategories.length > 0) {
          setSelectedTab(result.data.suggestionCategories[0].categoryName);
        }

        const totalSuggestions =
          result.data.suggestionCategories?.reduce(
            (sum, category) => sum + category.suggestions.length,
            0
          ) || 0;

        showToast(ToastType.Success, t("common:toasts.analysisComplete"), {
          body: t("common:toasts.analysisCompleteDescription", { count: totalSuggestions }),
        });
      } else {
        console.error("Analysis failed:", result.error);

        // Check if it's a rate limit error
        if (result.error?.includes("[RATE_LIMIT_EXCEEDED]")) {
          const message = result.error.split("|RESET:")[0].replace("[RATE_LIMIT_EXCEEDED]", "");
          setError(message);
          showToast(ToastType.Error, message);
          return;
        }

        // Check for network errors
        const isNetworkError =
          result.error?.toLowerCase().includes("network") ||
          result.error?.toLowerCase().includes("fetch");
        const errorMessage = result.error || t("common.unknownError");
        setError(errorMessage);
        showToast(
          ToastType.Error,
          isNetworkError ? t("common:toasts.networkError") : t("common:toasts.analysisError"),
          {
            body: errorMessage,
          }
        );
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : t("common.unexpectedError");
      setError(errorMessage);
      showToast(ToastType.Error, t("common:toasts.unexpectedError"), {
        body: errorMessage,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSuggestionToggle = (uniqueKey: string, _categoryName: string, checked: boolean) => {
    const newSelected = new Set(selectedSuggestions);
    if (checked) {
      newSelected.add(uniqueKey);
    } else {
      newSelected.delete(uniqueKey);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleReviseSelected = async () => {
    if (selectedSuggestions.size === 0) {
      showToast(ToastType.Warning, t("common:toasts.noSuggestionsSelected"), {
        body: t("common:toasts.noSuggestionsSelectedDescription"),
      });
      return;
    }

    setIsRevising(true);
    setError("");

    try {
      // Find all selected suggestion objects from categories
      const selectedSuggestionObjects: SuggestionItem[] = [];
      suggestionCategories.forEach((category) => {
        category.suggestions.forEach((suggestion, suggestionIndex) => {
          const uniqueKey = `${category.categoryName}-${suggestion.id}-${suggestionIndex}`;
          if (selectedSuggestions.has(uniqueKey)) {
            selectedSuggestionObjects.push(suggestion);
          }
        });
      });

      const revisionRequest: any = {
        originalEmailBody: emailBody,
        targetLanguage: settings.emailWritingLanguage,
        userNativeLanguage: settings.nativeLanguage,
        writingTone: settings.writingTone,
        selectedSuggestions: selectedSuggestionObjects,
      };

      if (emailContext.trim()) {
        revisionRequest.emailContext = emailContext.trim();
      }

      if (recipientRelationship.trim()) {
        revisionRequest.recipientRelationship = recipientRelationship.trim();
      }

      const result = await revisionService.reviseEmail(revisionRequest);

      if (result.success && result.data) {
        setRevisedText(result.data.revisedEmailBody || "");
        showToast(ToastType.Success, t("common:toasts.revisionComplete"), {
          body: t("common:toasts.revisionCompleteDescription"),
        });
      } else {
        console.error("Revision failed:", result.error);

        // Check if it's a rate limit error
        if (result.error?.includes("[RATE_LIMIT_EXCEEDED]")) {
          const message = result.error.split("|RESET:")[0].replace("[RATE_LIMIT_EXCEEDED]", "");
          setError(message);
          showToast(ToastType.Error, message);
          return;
        }

        // Check for network errors
        const isNetworkError =
          result.error?.toLowerCase().includes("network") ||
          result.error?.toLowerCase().includes("fetch");
        const errorMessage = result.error || t("common.unknownError");
        setError(errorMessage);
        showToast(
          ToastType.Error,
          isNetworkError ? t("common:toasts.networkError") : t("common:toasts.revisionError"),
          {
            body: errorMessage,
          }
        );
      }
    } catch (error) {
      console.error("Revision failed:", error);
      const errorMessage = error instanceof Error ? error.message : t("common.unexpectedError");
      setError(errorMessage);
      showToast(ToastType.Error, t("common:toasts.unexpectedError"), {
        body: errorMessage,
      });
    } finally {
      setIsRevising(false);
    }
  };

  const handleInsertRevised = async () => {
    if (!revisedText.trim()) {
      showToast(ToastType.Warning, t("common:toasts.noRevisedText"), {
        body: t("common:toasts.noRevisedTextDescription"),
      });
      return;
    }

    try {
      const result = await outlookService.insertText(revisedText);
      if (result.success) {
        showToast(ToastType.Success, t("common:toasts.insertSuccess"), {
          body: t("common:toasts.insertSuccessDescription"),
        });
      } else {
        showToast(ToastType.Error, t("common:toasts.insertError"), {
          body: result.error || t("common.unknownError"),
        });
      }
    } catch (error) {
      console.error("Insert failed:", error);
      showToast(ToastType.Error, t("common:toasts.insertError"), {
        body: error instanceof Error ? error.message : t("common.unexpectedError"),
      });
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(revisedText);
      showToast(ToastType.Success, t("common:toasts.copiedToClipboard"));
    } catch (error) {
      console.error("Copy failed:", error);
      showToast(ToastType.Error, t("common:toasts.copyFailed"), {
        body: error instanceof Error ? error.message : t("common.unexpectedError"),
      });
    }
  };

  const nativeLanguageName = getLanguageNameByCode(settings.nativeLanguage);

  return (
    <div className={styles.root}>
      {isMockMode && <Text className={styles.statusFooter}>{t("common.mockMode")}</Text>}

      <div className={styles.textareaContainer}>
        <label className={styles.label}>{t("labels:emailContent")}</label>
        <textarea
          className={styles.textArea}
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
          placeholder={t("labels:emailContentPlaceholder")}
        />
      </div>

      <div className={styles.textareaContainer}>
        <label className={styles.label}>{t("labels:recipientRelationship")}</label>
        <input
          type="text"
          className={styles.inputField}
          value={recipientRelationship}
          onChange={(e) => setRecipientRelationship(e.target.value)}
          placeholder={t("labels:recipientRelationshipPlaceholder")}
        />
      </div>

      <div className={styles.textareaContainer}>
        <label className={styles.label}>{t("labels:emailContext")}</label>
        <textarea
          className={styles.smallTextArea}
          value={emailContext}
          onChange={(e) => setEmailContext(e.target.value)}
          placeholder={t("labels:emailContextPlaceholder")}
        />
      </div>

      <div className={styles.buttonGroup}>
        <Button appearance="secondary" onClick={loadCurrentEmail} disabled={isAnalyzing}>
          {t("buttons:loadCurrentEmail")}
        </Button>
        <Button
          className={styles.analyzeButton}
          appearance="primary"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !emailBody.trim()}
        >
          {isAnalyzing ? <Spinner size="tiny" /> : null}
          {isAnalyzing ? t("buttons:analyzing") : t("buttons:analyzeButton")}
        </Button>
      </div>

      {/* Analysis Results Section */}
      {(suggestionCategories.length > 0 || error) && (
        <div className={styles.section}>
          <Text className={styles.sectionHeader}>{t("labels:analysisResults")}</Text>

          {error && <Text className={styles.errorText}>{error}</Text>}

          {overallScore !== null && overallAssessment && (
            <div className={styles.overallContainer}>
              <Text style={{ fontWeight: tokens.fontWeightSemibold }}>
                {t("labels:overallScore")}: {overallScore}/10
              </Text>
              <Text style={{ display: "block", marginTop: "4px", fontStyle: "italic" }}>
                {overallAssessment}
              </Text>
            </div>
          )}

          {suggestionCategories.length > 0 && (
            <>
              <div className={styles.tabContainer}>
                <Overflow minimumVisible={2}>
                  <TabList
                    className={styles.tabList}
                    selectedValue={selectedTab}
                    onTabSelect={(_, data) => setSelectedTab(data.value as string)}
                  >
                    {suggestionCategories.map((category) => (
                      <OverflowItem
                        key={category.categoryName}
                        id={category.categoryName}
                        priority={selectedTab === category.categoryName ? 2 : 1}
                      >
                        <Tab value={category.categoryName}>
                          {category.categoryName.charAt(0).toUpperCase() +
                            category.categoryName.slice(1)}{" "}
                          ({category.suggestions.length})
                        </Tab>
                      </OverflowItem>
                    ))}
                    <OverflowMenu onTabSelect={(categoryName) => setSelectedTab(categoryName)} />
                  </TabList>
                </Overflow>

                <div className={styles.tabContent}>
                  {suggestionCategories
                    .filter((category) => category.categoryName === selectedTab)
                    .map((category) => (
                      <div key={category.categoryName}>
                        {category.suggestions.map((suggestion, suggestionIndex) => {
                          const badge = getSeverityBadge(suggestion.severity);
                          // Use both category name and index to ensure uniqueness across all sources
                          const uniqueKey = `${category.categoryName}-${suggestion.id}-${suggestionIndex}`;
                          const isChecked = selectedSuggestions.has(uniqueKey);
                          return (
                            <Card key={uniqueKey} className={styles.suggestionCard}>
                              <CardHeader
                                header={
                                  <div className={styles.suggestionHeader}>
                                    <div className={styles.suggestionTitle}>
                                      <Checkbox
                                        checked={isChecked}
                                        onChange={(_, data) =>
                                          handleSuggestionToggle(
                                            uniqueKey, // Pass the full unique key instead of just suggestion.id
                                            category.categoryName,
                                            data.checked === true
                                          )
                                        }
                                      />
                                      <Text weight="semibold">{suggestion.title}</Text>
                                    </div>
                                    <Badge
                                      className={styles.badge}
                                      appearance={badge.appearance}
                                      color={badge.color}
                                      icon={badge.icon}
                                    >
                                      {suggestion.severity}
                                    </Badge>
                                  </div>
                                }
                                description={
                                  <div className={styles.suggestionContent}>
                                    <Text>{suggestion.description}</Text>
                                    {suggestion.suggestionText && (
                                      <div className={styles.suggestionText}>
                                        {suggestion.suggestionText}
                                      </div>
                                    )}
                                    {suggestion.examples && suggestion.examples.length > 0 && (
                                      <div>
                                        <Text
                                          style={{
                                            fontSize: tokens.fontSizeBase200,
                                            fontWeight: tokens.fontWeightSemibold,
                                          }}
                                        >
                                          {t("labels:examples")}:
                                        </Text>
                                        <ul className={styles.examplesList}>
                                          {suggestion.examples.map((example, exampleIndex) => (
                                            <li key={exampleIndex}>
                                              <Text style={{ fontSize: tokens.fontSizeBase200 }}>
                                                {example}
                                              </Text>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {suggestion.suggestionTextInUserNativeLanguage && (
                                      <div className={styles.nativeLanguageFeedback}>
                                        <Text
                                          style={{
                                            fontSize: tokens.fontSizeBase200,
                                            fontWeight: tokens.fontWeightSemibold,
                                            display: "block",
                                            marginBottom: "4px",
                                          }}
                                        >
                                          {t("labels:nativeLanguageFeedback")}:
                                        </Text>
                                        {suggestion.suggestionTextInUserNativeLanguage}
                                      </div>
                                    )}
                                  </div>
                                }
                              />
                            </Card>
                          );
                        })}
                      </div>
                    ))}
                </div>
              </div>

              {selectedSuggestions.size > 0 && (
                <div className={styles.selectedSuggestionsActions}>
                  <Text>{t("labels:selectedCount", { count: selectedSuggestions.size })}</Text>
                  <Button appearance="primary" onClick={handleReviseSelected} disabled={isRevising}>
                    {isRevising ? <Spinner size="tiny" /> : null}
                    {t("buttons:reviseSelected")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Revised Text Section */}
      {revisedText && (
        <div className={styles.section}>
          <Text className={styles.sectionHeader}>{t("labels:revisedText")}</Text>

          <Textarea
            className={styles.revisedTextarea}
            value={revisedText}
            onChange={(_, data) => setRevisedText(data.value)}
            resize="vertical"
            rows={8}
            wrap="soft"
          />
          <div className={styles.revisedButtonGroup}>
            <Button
              appearance="secondary"
              className={styles.button}
              onClick={handleCopyToClipboard}
            >
              {t("buttons:copyToClipboard")}
            </Button>
            <Button appearance="primary" className={styles.button} onClick={handleInsertRevised}>
              {t("buttons:insertIntoEmail")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
