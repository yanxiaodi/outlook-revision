/* global localStorage, console */
import { useState, useEffect, useCallback } from "react";
import { AppSettings, DEFAULT_SETTINGS } from "../types/settings";
import { getBrowserLanguage } from "../data/languages";

const SETTINGS_STORAGE_KEY = "outlookRevisionSettings";

interface UseSettingsReturn {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  hasSettings: boolean;
  isLoading: boolean;
  saveDefaultSettings: () => void;
}

export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hasSettings, setHasSettings] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load settings from localStorage
  const loadSettings = useCallback(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings) as Partial<AppSettings>;

        // Ensure backward compatibility by adding missing fields with defaults
        const completeSettings: AppSettings = {
          emailWritingLanguage:
            parsedSettings.emailWritingLanguage || DEFAULT_SETTINGS.emailWritingLanguage,
          nativeLanguage: parsedSettings.nativeLanguage || getBrowserLanguage(),
          writingTone: parsedSettings.writingTone || DEFAULT_SETTINGS.writingTone,
          uiLanguage: parsedSettings.uiLanguage || DEFAULT_SETTINGS.uiLanguage,
        };

        setSettings(completeSettings);
        setHasSettings(true);

        // Save the updated settings to ensure new fields are persisted
        if (!parsedSettings.uiLanguage) {
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(completeSettings));
        }
      } else {
        // No settings found, create defaults with browser language
        const browserLang = getBrowserLanguage();
        const defaultsWithBrowserLang: AppSettings = {
          ...DEFAULT_SETTINGS,
          emailWritingLanguage: browserLang, // Use browser language for email writing too
          nativeLanguage: browserLang,
          uiLanguage: browserLang, // Use browser language for UI as well
        };
        setSettings(defaultsWithBrowserLang);
        setHasSettings(false);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      // Fallback to defaults with browser language
      const browserLang = getBrowserLanguage();
      const defaultsWithBrowserLang: AppSettings = {
        ...DEFAULT_SETTINGS,
        emailWritingLanguage: browserLang, // Use browser language for email writing too
        nativeLanguage: browserLang,
        uiLanguage: browserLang, // Use browser language for UI as well
      };
      setSettings(defaultsWithBrowserLang);
      setHasSettings(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: AppSettings) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setHasSettings(true);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }, []);

  // Update a specific setting
  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prevSettings) => {
        const newSettings = { ...prevSettings, [key]: value };
        saveSettings(newSettings);
        return newSettings;
      });
    },
    [saveSettings]
  );

  // Initialize settings on component mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Save default settings if they don't exist (for first-time users)
  const saveDefaultSettings = useCallback(() => {
    if (!hasSettings && !isLoading) {
      saveSettings(settings);
    }
  }, [hasSettings, isLoading, settings, saveSettings]);

  return {
    settings,
    updateSetting,
    hasSettings,
    isLoading,
    saveDefaultSettings,
  };
};

// Export individual setting getters for easy access from other components
export const getSettings = (): AppSettings | null => {
  try {
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return storedSettings ? JSON.parse(storedSettings) : null;
  } catch {
    return null;
  }
};

export const getSetting = <K extends keyof AppSettings>(key: K): AppSettings[K] | null => {
  const settings = getSettings();
  return settings ? settings[key] : null;
};

// Helper function to get the current UI language
export const getUILanguage = (): string => {
  const uiLanguage = getSetting("uiLanguage");
  return uiLanguage || "en-US"; // Default to English if not set
};
