/* global navigator */
import { Language } from "../types/settings";

export const LANGUAGES: Language[] = [
  // Major languages with variants (most commonly used first)
  { code: "en-US", name: "English (United States)" },
  { code: "en-GB", name: "English (United Kingdom)" },

  { code: "es-ES", name: "Spanish (Spain)" },
  { code: "es-MX", name: "Spanish (Mexico)" },

  { code: "fr", name: "French" },
  { code: "de", name: "German" },

  { code: "pt-BR", name: "Portuguese (Brazil)" },
  { code: "pt-PT", name: "Portuguese (Portugal)" },

  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "zh-TW", name: "Chinese (Traditional)" },

  // Other major languages (alphabetical by English name)
  { code: "ar", name: "Arabic" },
  { code: "bn", name: "Bengali" },
  { code: "bg", name: "Bulgarian" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "nl", name: "Dutch" },
  { code: "fi", name: "Finnish" },
  { code: "he", name: "Hebrew" },
  { code: "hi", name: "Hindi" },
  { code: "hu", name: "Hungarian" },
  { code: "id", name: "Indonesian" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ms", name: "Malay" },
  { code: "no", name: "Norwegian" },
  { code: "fa", name: "Persian" },
  { code: "pl", name: "Polish" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "sv", name: "Swedish" },
  { code: "th", name: "Thai" },
  { code: "tr", name: "Turkish" },
  { code: "uk", name: "Ukrainian" },
  { code: "ur", name: "Urdu" },
  { code: "vi", name: "Vietnamese" },
];

// Helper function to get browser's default language
export const getBrowserLanguage = (): string => {
  const browserLang = navigator.language || "en-US";

  // Check if browser language exists in our supported languages
  const supportedLanguage = LANGUAGES.find((lang) => lang.code === browserLang);
  if (supportedLanguage) {
    return browserLang;
  }

  // Try to match just the language part (e.g., 'en' from 'en-AU')
  const langPart = browserLang.split("-")[0];
  const matchedLanguage = LANGUAGES.find((lang) => lang.code.startsWith(langPart));

  return matchedLanguage ? matchedLanguage.code : "en-US";
};

// Helper function to get language name by code
export const getLanguageNameByCode = (code: string): string => {
  const language = LANGUAGES.find((lang) => lang.code === code);
  return language ? language.name : code;
};
