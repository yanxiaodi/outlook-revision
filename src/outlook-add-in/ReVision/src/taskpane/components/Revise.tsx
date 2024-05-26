import React, { useState, useContext } from "react";
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
  TabList,
  Tab,
  Checkbox,
  TabValue,
  SelectTabEvent,
  SelectTabData,
} from "@fluentui/react-components";
import { SettingsContext } from "./App";
import { GlobalStateContext } from "./TabsContainer";
import { EmailMode, getCurrentMode, getSelectedText, insertToComposeBody } from "../services/emailServices";
import { ReviseResponse, SuggestionCategory } from "../models/reviseResponse";
import { ReviseRequest } from "../models/reviseRequest";
import ReactMarkdown from "react-markdown";

export interface RevisePageState {
  draft: string;
  reviseSuggestions: ReviseResponse;
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
  const [draft, setDraft] = useState("");
  const [reviseSuggestions, setReviseSuggestions] = useState<SuggestionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedValue, setSelectedValue] = React.useState<TabValue>(0);
  const styles = useStyles();

  const getSuggestion = async () => {
    try {
      setIsLoading(true);
      setReviseSuggestions([]);

      let draftText = draft;
      if (!draftText || draftText.trim() === "") {
        const selectedText = (await getSelectedText()) as string;
        setDraft(selectedText);
        draftText = selectedText;
      }

      let targetLanguage = settings.emailLanguage;
      let writingTone = settings.writingTone;

      const reviseRequest = new ReviseRequest(draftText, targetLanguage, writingTone);
      const response = await fetch("http://localhost:5018/api/Outlook/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviseRequest),
      });
      const data: ReviseResponse = await response.json();
      setReviseSuggestions(data.suggestionCategories);
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
    const newReviseSuggestions = [...reviseSuggestions];
    newReviseSuggestions[categoryIndex].suggestions[suggestionIndex].selected =
      !newReviseSuggestions[categoryIndex].suggestions[suggestionIndex].selected;
    setReviseSuggestions(newReviseSuggestions);
  };

  const onTabSelect = (_event: SelectTabEvent, data: SelectTabData) => {
    setSelectedValue(data.value);
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
        <TabList selectedValue={selectedValue} onTabSelect={onTabSelect}>
          {reviseSuggestions.map((category, index) => (
            <Tab key={index} value={index}>
              {category.category}
            </Tab>
          ))}
        </TabList>
        {reviseSuggestions.map(
          (category, index) =>
            selectedValue === index && (
              <div key={index}>
                {category.suggestions.map((suggestion, sIndex) => (
                  <div key={sIndex}>
                    <Checkbox checked={suggestion.selected} onChange={() => handleCheckboxChange(index, sIndex)} />
                    <strong>{suggestion.title}</strong>
                    <ReactMarkdown>{suggestion.explanation}</ReactMarkdown>
                  </div>
                ))}
              </div>
            )
        )}
      </div>
      {/* {reviseSuggestions && (
        <Field className={styles.textAreaField} size="large" label="Revised Email">
          <Textarea
            resize="vertical"
            value={reviseSuggestions}
            onChange={(e) => setReviseSuggestions(e.target.value)}
            rows={7}
          />
        </Field>
      )} */}
      {/* {reviseSuggestions && (
        <div className={styles.buttonContainer}>
          <Button
            appearance="primary"
            className={styles.button}
            disabled={isLoading || getCurrentMode() === EmailMode.MessageRead}
            onClick={insertToEmail}
          >
            Insert to Email
          </Button>
          <Button appearance="primary" className={styles.button} disabled={isLoading} onClick={copyToClipboard}>
            Copy to Clipboard
          </Button>
        </div>
      )} */}
      <Toaster toasterId={toasterId} />
    </div>
  );
};

export default RevisePage;
