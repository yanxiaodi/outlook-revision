import "react-i18next";

// Define the resource structure based on our translations
interface CommonTranslations {
  appName: string;
  welcome: string;
  loading: string;
  settings: string;
  back: string;
  buttons: {
    save: string;
    cancel: string;
    submit: string;
    reset: string;
  };
  messages: {
    success: string;
    error: string;
    noSettings: string;
  };
}

interface SettingsTranslations {
  title: string;
  description: string;
  emailWritingLanguage: {
    label: string;
    placeholder: string;
    description: string;
  };
  nativeLanguage: {
    label: string;
    placeholder: string;
    description: string;
  };
  uiLanguage: {
    label: string;
    placeholder: string;
    description: string;
  };
  writingTone: {
    label: string;
    placeholder: string;
    description: string;
  };
}

interface TabsTranslations {
  translate: string;
  compose: string;
  revise: string;
}

// Extend the react-i18next types
declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: CommonTranslations;
      settings: SettingsTranslations;
      tabs: TabsTranslations;
    };
  }
}
