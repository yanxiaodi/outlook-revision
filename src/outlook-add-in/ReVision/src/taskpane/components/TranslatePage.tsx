import React, { useState, useEffect } from "react";
import { makeStyles, Textarea, Button, Field, tokens } from "@fluentui/react-components";
import { getEmailText, getEmailId } from "../services/emailServices";
import { TranslateRequest } from "../models/translateRequest";
import { TranslateResponse } from "../models/translateResponse";

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
  buttonContainer:{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    display: "flex",
    alignContent: "center",
    justifyContent: "center",
  },
});

const TranslatePage: React.FC = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [summary, setSummary] = useState("");
  const [emailId, setEmailId] = useState("");

  const styles = useStyles();

  const translate = async () => {
    try {
      const emailBody = await getEmailText();
      const translateRequest = new TranslateRequest("en", emailBody as string);
      const response = await fetch("https://fakeapi.com/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(translateRequest),
      });
      const data: TranslateResponse = await response.json();
      setOutput(data.translatedText);
      setSummary(data.summary);
      setEmailId(getEmailId());
      localStorage.setItem(emailId, JSON.stringify({ translatedText: data.translatedText, summary: data.summary }));
    } catch (error) {
      console.error(error);
      // Show a toast notification
      Office.context.ui.displayDialogAsync(
        "https://myAddin.com/error.html",
        { height: 30, width: 20, displayInIframe: true },
        function (asyncResult) {
          if (asyncResult.status === Office.AsyncResultStatus.Failed) {
            console.error("Failed to show error dialog: " + asyncResult.error.message);
          }
        }
      );
    }
  };

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem(emailId));
    if (savedData) {
      setOutput(savedData.translatedText);
      setSummary(savedData.summary);
    }
  }, [emailId]);

  const handleInputTextChange = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  return (
    <div className={styles.container}>
      <Field className={styles.textAreaField} size="large" label="Enter text to be translated.">
        <Textarea
          resize="vertical"
          placeholder="Leave blank to auto translate the current email."
          value={input}
          onChange={handleInputTextChange}
        />
      </Field>
      <div className={styles.buttonContainer}>
        <Button appearance="primary" className={styles.button} onClick={translate}>
          Translate
        </Button>
      </div>
      <Field className={styles.textAreaField} size="large" label="Translated Text">
        <Textarea resize="vertical" readOnly value={output} />
      </Field>
      <Field className={styles.textAreaField} size="large" label="Summary">
        <Textarea resize="vertical" readOnly value={summary} />
      </Field>
    </div>
  );
};

export default TranslatePage;
