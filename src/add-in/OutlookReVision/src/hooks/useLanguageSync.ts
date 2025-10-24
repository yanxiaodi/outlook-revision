/* global console */
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "./useSettings";

/**
 * Custom hook to synchronize the UI language setting with i18next
 * This ensures that when the user changes the UI language in settings,
 * the interface language updates immediately.
 */
export const useLanguageSync = () => {
  const { i18n } = useTranslation();
  const { settings } = useSettings();

  useEffect(() => {
    if (settings.uiLanguage) {
      console.log("Language sync - settings.uiLanguage:", settings.uiLanguage);
      console.log("Language sync - current i18n.language:", i18n.language);

      // Use the language code directly as it comes from the dropdown (e.g., zh-CN, zh-TW, en-US, en-GB)
      // Only change if it's different from current language
      if (i18n.language !== settings.uiLanguage) {
        console.log("Changing language to:", settings.uiLanguage);
        i18n.changeLanguage(settings.uiLanguage);
      }
    }
  }, [settings.uiLanguage, i18n]);

  return {
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage,
  };
};
