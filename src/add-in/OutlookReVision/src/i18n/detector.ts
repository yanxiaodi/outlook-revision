/* global console, navigator */
import { LanguageDetectorModule } from "i18next";
import { getUILanguage } from "../hooks/useSettings";

export const customLanguageDetector: LanguageDetectorModule = {
  type: "languageDetector",
  detect: function () {
    // Get the UI language from settings - this returns the exact code from languages.ts (e.g., zh-CN, zh-TW, en-US, en-GB)
    const uiLanguage = getUILanguage();
    if (uiLanguage) {
      console.log("Detected language from settings:", uiLanguage);
      // Return the language code directly as it comes from the dropdown
      return uiLanguage;
    }

    // Fallback to browser language detection
    const browserLang = navigator.language || navigator.languages?.[0] || "en-US";
    console.log("Fallback to browser language:", browserLang);

    // Return the browser language (e.g., 'en-US', 'zh-CN', etc.)
    return browserLang;
  },
  init: function () {
    // Initialization logic if needed
  },
  cacheUserLanguage: function (lng: string) {
    // The language will be cached through the settings hook when user changes it
    console.log("Language change detected:", lng);
  },
};
