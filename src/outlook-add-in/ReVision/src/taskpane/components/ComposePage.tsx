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
} from "@fluentui/react-components";
import { SettingsContext } from "./App";
import { GlobalStateContext } from "./TabsContainer";
import { getEmailText, insertToComposeBody, isReadMode } from "../services/emailServices";
import { ComposeRequest } from "../models/composeRequest";
import { ComposeResponse } from "../models/composeResponse";

export interface ComposePageState {
  currentEmail: string;
  input: string;
  output: string;
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

const ComposePage: React.FC = () => {
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);
  const { settings, setSettings } = React.useContext(SettingsContext);
  const { composePageState, setGlobalState } = React.useContext(GlobalStateContext);
  const [currentEmail, setCurrentEmail] = useState(composePageState.currentEmail);
  const [input, setInput] = useState(composePageState.input);
  const [output, setOutput] = useState(composePageState.output);
  const [isLoading, setIsLoading] = useState(false);

  const styles = useStyles();

  const compose = async () => {
    try {
      setIsLoading(true);
      let currentEmailText = currentEmail;
      if (!currentEmail || currentEmail.trim() === "") {
        const emailBody = (await getEmailText()) as string;
        setCurrentEmail(emailBody);
        currentEmailText = emailBody;
      }

      let inputText = input;
      let targetLanguage = settings.emailLanguage;
      let writingTone = settings.writingTone;

      const composeRequest = new ComposeRequest(currentEmailText, inputText, targetLanguage, writingTone);

      const response = await fetch("http://localhost:5018/api/Outlook/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(composeRequest),
      });
      const data: ComposeResponse = await response.json();
      setOutput(data.text);
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
        currentEmail,
        input,
        output,
      },
    }));
  }, [input, output]);

  const handleInputTextChange = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const handleOutputTextChange = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOutput(event.target.value);
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
      await insertToComposeBody(output);
    } catch (error) {
      console.log("Error: " + error);
      notify("error", "An error occurred while inserting the email.");
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
      {output && (
        <Field className={styles.textAreaField} size="large" label="AI Generated Email">
          <Textarea resize="vertical" value={output} onChange={handleOutputTextChange} rows={7} />
        </Field>
      )}
      {output && (
        <div className={styles.buttonContainer}>
          <Button
            appearance="primary"
            className={styles.button}
            disabled={isLoading || isReadMode()}
            onClick={insertToEmail}
          >
            Insert to Email
          </Button>
        </div>
      )}
      <Toaster toasterId={toasterId} />
    </div>
  );
};

export default ComposePage;
