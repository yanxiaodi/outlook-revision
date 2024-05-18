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