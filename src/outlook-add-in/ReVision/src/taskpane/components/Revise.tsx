import React, { useState, useContext, useEffect } from "react";
import {
  makeStyles,
  Textarea,
  Button,
  Field,
  Toaster,
  useToastController,
  Toast,
  useId,
  ToastTitle,
  ToastIntent,
  Spinner,
  Checkbox,
  TabValue,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
} from "@fluentui/react-components";
import { SettingsContext } from "./App";
import { GlobalStateContext } from "./TabsContainer";
import {
  EmailMode,
  getCurrentMode,
  getReplyText,
  getSelectedText,
  insertToComposeBody,
} from "../services/emailServices";
import { SuggestResponse } from "../models/suggestResponse";
import { SuggestRequest } from "../models/suggestRequest";
import ReactMarkdown from "react-markdown";

export interface RevisePageState {
  draft: string;
  reviseSuggestions: SuggestResponse;
}

const useStyles = makeStyles({
  container: {
    maxWidth: "100%",
  },
  textAreaField: {
    marginLeft: "10px",
    marginTop: "10px",
    marginBottom: "10px",
    marginRight: "10px",
    maxWidth: "100%",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    display: "flex",
    alignContent: "center",
    justifyContent: "center",
    marginLeft: "5px",
    marginRight: "5px",
  },
  spinner: {
    display: "flex",
    alignContent: "center",
    justifyContent: "center",
    marginTop: "10px",
  },
});

const RevisePage: React.FC = () => {
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);
  const { settings, setSettings } = React.useContext(SettingsContext);
  const { revisePageState, setGlobalState } = React.useContext(GlobalStateContext);
  const [draft, setDraft] = useState(revisePageState.draft);
  const [reviseSuggestions, setReviseSuggestions] = useState(revisePageState.reviseSuggestions);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedValue, setSelectedValue] = React.useState<TabValue>(0);
  const styles = useStyles();

  useEffect(() => {
    setGlobalState((prevState) => ({
      ...prevState,
      revisePageState: {
        draft,
        reviseSuggestions,
      },
    }));
  }, [draft, reviseSuggestions]);

  const getSuggestion = async () => {
    try {
      setIsLoading(true);
      setReviseSuggestions(new SuggestResponse([]));

      let draftText = draft;
      if (!draftText || draftText.trim() === "") {
        const selectedText = (await getSelectedText()) as string;
        if (selectedText.trim() !== "") {
          draftText = selectedText;
        } else {
          const replyText = (await getReplyText()) as string;
          if (replyText.trim() !== "") {
            draftText = replyText;
          }
        }
      }

      if (!draftText || draftText.trim() === "") {
        notify("info", "Please enter the draft content or select text from the email.");
        setIsLoading(false);
        return;
      } else {
        setDraft(draftText);
      }

      let targetLanguage = settings.emailLanguage;
      let userLanguage = settings.userLanguage;
      let writingTone = settings.writingTone;

      const reviseRequest = new SuggestRequest(draftText, targetLanguage, userLanguage, writingTone);
      const response = await fetch("http://localhost:5018/api/Outlook/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviseRequest),
      });
      const data: SuggestResponse = await response.json();
      setReviseSuggestions(data);
      notify("success", "Suggestion generated successfully.");
    } catch (error) {
      notify("error", "An error occurred while revising the email.");
    } finally {
      setIsLoading(false);
    }
  };

  const insertToEmail = async () => {
    try {
      //await insertToComposeBody(revised);
    } catch (error) {
      console.log("Error: " + error);
      notify("error", "An error occurred while inserting the email.");
    }
  };

  const copyToClipboard = async () => {
    try {
      //await navigator.clipboard.writeText(revised);
      notify("success", "Output copied to clipboard.");
    } catch (error) {
      console.log("Error: " + error);
      notify("error", "An error occurred while copying to the clipboard.");
    }
  };

  const notify = (intent: ToastIntent, message: string) => {
    dispatchToast(
      <Toast>
        <ToastTitle>{message}</ToastTitle>
      </Toast>,
      { pauseOnWindowBlur: true, intent: intent }
    );
  };

  const handleCheckboxChange = (categoryIndex: number, suggestionIndex: number) => {
    // Create a new copy of the reviseSuggestions state
    const newReviseSuggestions: SuggestResponse = JSON.parse(JSON.stringify(reviseSuggestions));

    // Modify the selected property of the suggestion
    newReviseSuggestions.suggestionCategories[categoryIndex].suggestions[suggestionIndex].selected =
      !newReviseSuggestions.suggestionCategories[categoryIndex].suggestions[suggestionIndex].selected;

    // Set the state with the new copy
    setReviseSuggestions(newReviseSuggestions);
  };

  return (
    <div className={styles.container}>
      <Field className={styles.textAreaField} size="large" label="Enter draft content for the email.">
        <Textarea
          resize="vertical"
          placeholder="Enter your draft here or select text from the email."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={7}
        />
      </Field>
      <div className={styles.buttonContainer}>
        <Button appearance="primary" className={styles.button} onClick={getSuggestion} disabled={isLoading}>
          AI suggestion
        </Button>
      </div>
      {isLoading && <Spinner className={styles.spinner} />}

      <div className={styles.container}>
        <Accordion multiple>
          {reviseSuggestions.suggestionCategories &&
            reviseSuggestions.suggestionCategories.map(
              (category, index) =>
                category && (
                  <AccordionItem key={`category-${index}`} value={index}>
                    <AccordionHeader>
                      {category.category}
                      {category.categoryInUserLanguage && ` (${category.categoryInUserLanguage})`}
                    </AccordionHeader>
                    <AccordionPanel>
                      <div key={`panel-${index}`}>
                        {category.suggestions &&
                          category.suggestions.map(
                            (suggestion, sIndex) =>
                              suggestion && (
                                <div key={`suggestion-${index}-${sIndex}`}>
                                  {suggestion.needsAttention && (
                                    <Checkbox
                                      checked={suggestion.selected}
                                      onChange={() => handleCheckboxChange(index, sIndex)}
                                    />
                                  )}
                                  <strong>
                                    {suggestion.title}
                                    {suggestion.titleInUserLanguage && ` (${suggestion.titleInUserLanguage})`}
                                  </strong>
                                  <ReactMarkdown>{suggestion.explanation}</ReactMarkdown>
                                  {suggestion.explanationInUserLanguage && (
                                    <ReactMarkdown>{suggestion.explanationInUserLanguage}</ReactMarkdown>
                                  )}
                                </div>
                              )
                          )}
                      </div>
                    </AccordionPanel>
                  </AccordionItem>
                )
            )}
        </Accordion>
      </div>
      <Toaster toasterId={toasterId} />
    </div>
  );
};

export default RevisePage;