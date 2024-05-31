import React, { useState, useEffect } from "react";
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
} from "@fluentui/react-components";
import { getEmailText, getEmailId } from "../services/emailServices";
import { TranslateRequest } from "../models/translateRequest";
import { TranslateResponse } from "../models/translateResponse";
import { SettingsContext, languageList } from "./App";
import { GlobalStateContext } from "./TabsContainer";

export interface TranslatePageState {
  input: string;
  output: string;
  summary: string;
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
  textField: {
    wordWrap: "break-word",
    overflowWrap: "break-word",
    whiteSpace: "pre-wrap",
    marginLeft: "10px",
    marginTop: "10px",
    marginBottom: "10px",
    marginRight: "10px",
    width: "100%",
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
  },
  spinner: {
    display: "flex",
    alignContent: "center",
    justifyContent: "center",
    marginTop: "10px",
  },
});

const TranslatePage: React.FC = () => {
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);
  //const [intent, setIntent] = React.useState<ToastIntent>("success");
  const { settings, setSettings } = React.useContext(SettingsContext);
  const { translatePageState, setGlobalState } = React.useContext(GlobalStateContext);
  const [input, setInput] = useState(translatePageState.input);
  const [output, setOutput] = useState(translatePageState.output);
  const [summary, setSummary] = useState(translatePageState.summary);
  const [isLoading, setIsLoading] = useState(false);
  //const [emailId, setEmailId] = useState("");

  const styles = useStyles();

  
  const translate = async () => {
    try {
      setIsLoading(true);
      let inputText = input;
      if (!input || input.trim() === "") {
        const emailBody = (await getEmailText()) as string;
        setInput(emailBody);
        inputText = emailBody;
      }
      const translateRequest = new TranslateRequest(languageList.find(x => x.languageCode == settings.userLanguage)?.displayName!, inputText);
      const response = await fetch("http://localhost:5018/api/Outlook/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(translateRequest),
      });
      const data: TranslateResponse = await response.json();
      setOutput(data.text);
      setSummary(data.summary);
      notify("success", "Text translated successfully.");
      //setEmailId(getEmailId());
      //   localStorage.setItem(emailId, JSON.stringify({ translatedText: data.text, summary: data.summary }));
    } catch (error) {
      notify("error", "An error occurred while translating the text.");
    } finally {
      setIsLoading(false);
    }
  };

  //   useEffect(() => {
  //     const savedData = JSON.parse(localStorage.getItem(emailId));
  //     if (savedData) {
  //       setOutput(savedData.translatedText);
  //       setSummary(savedData.summary);
  //     }
  //   }, [emailId]);
  useEffect(() => {
    setGlobalState((prevState) => ({
      ...prevState,
      translatePageState: {
        input,
        output,
        summary,
      },
    }));
  }, [input, output, summary]);

  const handleInputTextChange = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const notify = (intent: ToastIntent, message: string) => {
    dispatchToast(
      <Toast>
        <ToastTitle>{message}</ToastTitle>
      </Toast>,
      { pauseOnWindowBlur: true, intent: intent }
    );
  };

  return (
    <div className={styles.container}>
      <Field className={styles.textAreaField} size="large" label="Enter text to be translated.">
        <Textarea
          resize="vertical"
          placeholder="Leave blank to auto translate the current email."
          value={input}
          onChange={handleInputTextChange}
          rows={7}
        />
      </Field>
      <div className={styles.buttonContainer}>
        <Button appearance="primary" className={styles.button} onClick={translate} disabled={isLoading}>
          Translate
        </Button>
      </div>
      {isLoading && <Spinner className={styles.spinner} />}
      {summary && (
        <Field className={styles.textField} size="large" label="Summary">
          <p className={styles.textField}>{summary}</p>
        </Field>
      )}
      {output && (
        <Field className={styles.textField} size="large" label="Translated Text">
          <p>{output}</p>
        </Field>
      )}
      <Toaster toasterId={toasterId} />
    </div>
  );
};

export default TranslatePage;
