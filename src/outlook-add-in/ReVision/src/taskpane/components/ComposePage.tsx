import React, { useEffect, useState } from "react";
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
  Input,
} from "@fluentui/react-components";
import { SettingsContext } from "./App";
import { GlobalStateContext } from "./TabsContainer";
import {
  EmailMode,
  getCurrentMode,
  getEmailSubject,
  getEmailText,
  insertToComposeBody,
  insertToComposeSubject,
} from "../services/emailServices";
import { ComposeRequest } from "../models/composeRequest";
import { ComposeResponse } from "../models/composeResponse";

export interface ComposePageState {
  currentEmailSubject: string;
  currentEmailBody: string;
  input: string;
  subject: string;
  body: string;
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

const ComposePage: React.FC = () => {
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);
  const { settings, setSettings } = React.useContext(SettingsContext);
  const { composePageState, setGlobalState } = React.useContext(GlobalStateContext);
  const [currentEmailSubject, setCurrentEmailSubject] = useState(composePageState.subject);
  const [currentEmailBody, setCurrentEmailBody] = useState(composePageState.currentEmailBody);
  const [input, setInput] = useState(composePageState.input);
  const [subject, setSubject] = useState(composePageState.subject);
  const [body, setBody] = useState(composePageState.body);
  const [isLoading, setIsLoading] = useState(false);

  const styles = useStyles();

  const compose = async () => {
    try {
      setIsLoading(true);

      let currentEmailSubjectText = currentEmailSubject;
      if (!currentEmailSubjectText || currentEmailSubjectText.trim() === "") {
        const emailSubject = (await getEmailSubject()) as string;
        setCurrentEmailSubject(emailSubject);
        currentEmailSubjectText = emailSubject;
      }

      let currentEmailBodyText = currentEmailBody;
      if (!currentEmailBodyText || currentEmailBodyText.trim() === "") {
        const emailBody = (await getEmailText()) as string;
        setCurrentEmailBody(emailBody);
        currentEmailBodyText = emailBody;
      }

      let inputText = input;
      let targetLanguage = settings.emailLanguage;
      let writingTone = settings.writingTone;

      const composeRequest = new ComposeRequest(
        currentEmailSubjectText,
        currentEmailBodyText,
        inputText,
        targetLanguage,
        writingTone
      );

      const response = await fetch("http://localhost:5018/api/Outlook/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(composeRequest),
      });
      const data: ComposeResponse = await response.json();
      setSubject(data.subject);
      setBody(data.body);
      notify("success", "Email composed successfully.");
    } catch (error) {
      notify("error", "An error occurred while composing the email.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setGlobalState((prevState) => ({
      ...prevState,
      composePageState: {
        currentEmailSubject: currentEmailSubject,
        currentEmailBody: currentEmailBody,
        input,
        subject: subject,
        body: body,
      },
    }));
  }, [input, subject, body]);

  const handleInputTextChange = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const handleSubjectTextChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubject(event.target.value);
  };

  const handleBodyTextChange = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(event.target.value);
  };

  const notify = (intent: ToastIntent, message: string) => {
    dispatchToast(
      <Toast>
        <ToastTitle>{message}</ToastTitle>
      </Toast>,
      { pauseOnWindowBlur: true, intent: intent }
    );
  };

  const insertToEmail = async () => {
    try {
      if (subject !== "") {
        await insertToComposeSubject(subject);
      }
      await insertToComposeBody(body);
    } catch (error) {
      console.log("Error: " + error);
      notify("error", "An error occurred while inserting the email.");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(body);
      notify("success", "Output copied to clipboard.");
    } catch (error) {
      console.log("Error: " + error);
      notify("error", "An error occurred while copying to the clipboard.");
    }
  };

  return (
    <div className={styles.container}>
      <Field className={styles.textAreaField} size="large" label="Enter brief content for the email.">
        <Textarea
          resize="vertical"
          placeholder="Leave blank to auto compose a reply to the current email."
          value={input}
          onChange={handleInputTextChange}
          rows={7}
        />
      </Field>
      <div className={styles.buttonContainer}>
        <Button appearance="primary" className={styles.button} onClick={compose} disabled={isLoading}>
          Compose
        </Button>
      </div>
      {isLoading && <Spinner className={styles.spinner} />}
      {subject && (
        <Field className={styles.textAreaField} size="large" label="Subject">
          <Input value={subject} onChange={handleSubjectTextChange} />
        </Field>
      )}
      {body && (
        <Field className={styles.textAreaField} size="large" label="Email Body">
          <Textarea resize="vertical" value={body} onChange={handleBodyTextChange} rows={7} />
        </Field>
      )}
      {body && (
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
      )}
      <Toaster toasterId={toasterId} />
    </div>
  );
};

export default ComposePage;
