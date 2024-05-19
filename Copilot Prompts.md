# Copilot Prompts

## Introduction

This document contains a list of prompts that I used to generate code snippets for this project.

## Prompts

### Create a setting component

I want to create a new react component. This component has the following elements:
* A title "Settings".
* A label "source language", following with a dropdownlist that contains a list of language names, e.g. "en", "zh-cn", etc.
* A label "your language", following with a dropdownlist that contains a list of language names, e.g. "en", "zh-cn", etc.
* A label "writing tone", following with a dropdownlist that contains a list of tones, e.g. "casual", "professional", etc.
* When first time load this component, save the settings to local storage. When use changes the settings, save the settings to local storage. When load the component next time, read settings from local storage and update the selected item for those dropdownlists.
Follow the code style of the Header.tsx.
List the steps and explain the concepts. At the end, give me all the complete code.

### Create a TranslatePage component

I want to create a new react component for the Translate page. This component has the following elements:

* A button "Translate" that triggers the translation.
* A text area for the input text. Show a placeholder "Leave blank to auto translate the current email.". The label for this text area is "Input".
* A text area for the output text. The label for this text area is "Translated Output".
* A text area for the summary. The label for this text area is "Summary".

When the user clicks the "Translate" button, the component should call the Office JS to read the current email body and call a translation API to translate the email body.

The API request uses a `POST` method, and the body is a JSON object that contains the source language (which can be `null` by default), target language, and the email body.

The API response is a JSON object that contains the translated email body and the summary.

When the API response is received, the component should update the output text area and the summary text area. It should also save the translated email body and the summary to local storage. The saved data should contain the id of the email and the translated email body and the summary. The id of the email is the `Office.context.mailbox.item.itemId`.

When the component is first loaded, it should check if there is any saved data in the local storage. If there is, and the UserLanguage is the same as the target language of the saved data, it should load the data and update the output text area and the summary text area.

Use a fake API to simulate the translation. I'll replace the URL with the real API URL later.

The CSS style should follow the FluentUI style.