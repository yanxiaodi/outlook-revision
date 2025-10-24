/* global process */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { customLanguageDetector } from "./detector";

// Import translations from TypeScript files - one-to-one mapping with languages.ts
import { en } from "./locales/en";
import { enUS } from "./locales/en-us";
import { enGB } from "./locales/en-gb";
import { esES } from "./locales/es-es";
import { esMX } from "./locales/es-mx";
import { ptBR } from "./locales/pt-br";
import { ptPT } from "./locales/pt-pt";
import { zhCN } from "./locales/zh-cn";
import { zhTW } from "./locales/zh-tw";
import { fr } from "./locales/fr";
import { de } from "./locales/de";
import { it } from "./locales/it";
import { ja } from "./locales/ja";
import { ko } from "./locales/ko";
import { ru } from "./locales/ru";
import { ar } from "./locales/ar";
import { hi } from "./locales/hi";
import { tr } from "./locales/tr";
import { nl } from "./locales/nl";
import { sv } from "./locales/sv";
import { no } from "./locales/no";
import { da } from "./locales/da";
import { fi } from "./locales/fi";
import { pl } from "./locales/pl";
import { cs } from "./locales/cs";
import { hu } from "./locales/hu";
import { ro } from "./locales/ro";
import { bg } from "./locales/bg";
import { sk } from "./locales/sk";
import { sl } from "./locales/sl";
import { uk } from "./locales/uk";
import { vi } from "./locales/vi";
import { th } from "./locales/th";
import { he } from "./locales/he";
import { fa } from "./locales/fa";
import { id } from "./locales/id";
import { ms } from "./locales/ms";
import { bn } from "./locales/bn";
import { ur } from "./locales/ur";

// Define available languages - exactly matching the dropdown codes from languages.ts
export const availableLanguages = {
  // Languages with meaningful variants
  "en-US": "English (United States)",
  "en-GB": "English (United Kingdom)",
  "es-ES": "Spanish (Spain)",
  "es-MX": "Spanish (Mexico)",
  "pt-BR": "Portuguese (Brazil)",
  "pt-PT": "Portuguese (Portugal)",
  "zh-CN": "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",

  // Languages with single locale files
  fr: "French",
  de: "German",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  ru: "Russian",
  ar: "Arabic",
  hi: "Hindi",
  th: "Thai",
  vi: "Vietnamese",
  nl: "Dutch",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  fi: "Finnish",
  pl: "Polish",
  tr: "Turkish",
  he: "Hebrew",
  cs: "Czech",
  hu: "Hungarian",
  ro: "Romanian",
  bg: "Bulgarian",
  sk: "Slovak",
  sl: "Slovenian",
  uk: "Ukrainian",
  id: "Indonesian",
  ms: "Malay",
  bn: "Bengali",
  fa: "Persian",
  ur: "Urdu",
} as const;

export type SupportedLanguage = keyof typeof availableLanguages;

// Translation resources - one-to-one mapping with dropdown codes from languages.ts
const resources = {
  // Languages with meaningful variants (separate locale files)
  "en-US": {
    common: enUS.common,
    settings: enUS.settings,
    tabs: enUS.tabs,
    currentSettings: enUS.currentSettings,
    labels: enUS.labels,
    buttons: enUS.buttons,
    feedback: enUS.feedback,
    writingTones: enUS.writingTones,
  },
  "en-GB": {
    common: enGB.common,
    settings: enGB.settings,
    tabs: enGB.tabs,
    currentSettings: enGB.currentSettings,
    labels: enGB.labels,
    buttons: enGB.buttons,
    feedback: enGB.feedback,
    writingTones: enGB.writingTones,
  },
  "es-ES": {
    common: esES.common,
    settings: esES.settings,
    tabs: esES.tabs,
    currentSettings: esES.currentSettings,
    labels: esES.labels,
    buttons: esES.buttons,
    feedback: esES.feedback,
    writingTones: esES.writingTones,
  },
  "es-MX": {
    common: esMX.common,
    settings: esMX.settings,
    tabs: esMX.tabs,
    currentSettings: esMX.currentSettings,
    labels: esMX.labels,
    buttons: esMX.buttons,
    feedback: esMX.feedback,
    writingTones: esMX.writingTones,
  },
  "pt-BR": {
    common: ptBR.common,
    settings: ptBR.settings,
    tabs: ptBR.tabs,
    currentSettings: ptBR.currentSettings,
    labels: ptBR.labels,
    buttons: ptBR.buttons,
    feedback: ptBR.feedback,
    writingTones: ptBR.writingTones,
  },
  "pt-PT": {
    common: ptPT.common,
    settings: ptPT.settings,
    tabs: ptPT.tabs,
    currentSettings: ptPT.currentSettings,
    labels: ptPT.labels,
    buttons: ptPT.buttons,
    feedback: ptPT.feedback,
    writingTones: ptPT.writingTones,
  },
  "zh-CN": {
    common: zhCN.common,
    settings: zhCN.settings,
    tabs: zhCN.tabs,
    currentSettings: zhCN.currentSettings,
    labels: zhCN.labels,
    buttons: zhCN.buttons,
    feedback: zhCN.feedback,
    writingTones: zhCN.writingTones,
  },
  "zh-TW": {
    common: zhTW.common,
    settings: zhTW.settings,
    tabs: zhTW.tabs,
    currentSettings: zhTW.currentSettings,
    labels: zhTW.labels,
    buttons: zhTW.buttons,
    feedback: zhTW.feedback,
    writingTones: zhTW.writingTones,
  },
  // Languages with single locale files (no variants)
  fr: {
    common: fr.common,
    settings: fr.settings,
    tabs: fr.tabs,
    currentSettings: fr.currentSettings,
    labels: fr.labels,
    buttons: fr.buttons,
    feedback: fr.feedback,
    writingTones: fr.writingTones,
  },
  de: {
    common: de.common,
    settings: de.settings,
    tabs: de.tabs,
    currentSettings: de.currentSettings,
    labels: de.labels,
    buttons: de.buttons,
    feedback: de.feedback,
    writingTones: de.writingTones,
  },
  it: {
    common: it.common,
    settings: it.settings,
    tabs: it.tabs,
    currentSettings: it.currentSettings,
    labels: it.labels,
    buttons: it.buttons,
    feedback: it.feedback,
    writingTones: it.writingTones,
  },
  ja: {
    common: ja.common,
    settings: ja.settings,
    tabs: ja.tabs,
    currentSettings: ja.currentSettings,
    labels: ja.labels,
    buttons: ja.buttons,
    feedback: ja.feedback,
    writingTones: ja.writingTones,
  },
  ko: {
    common: ko.common,
    settings: ko.settings,
    tabs: ko.tabs,
    currentSettings: ko.currentSettings,
    labels: ko.labels,
    buttons: ko.buttons,
    feedback: ko.feedback,
    writingTones: ko.writingTones,
  },
  ru: {
    common: ru.common,
    settings: ru.settings,
    tabs: ru.tabs,
    currentSettings: ru.currentSettings,
    labels: ru.labels,
    buttons: ru.buttons,
    feedback: ru.feedback,
    writingTones: ru.writingTones,
  },
  ar: {
    common: ar.common,
    settings: ar.settings,
    tabs: ar.tabs,
    currentSettings: ar.currentSettings,
    labels: ar.labels,
    buttons: ar.buttons,
    feedback: ar.feedback,
    writingTones: ar.writingTones,
  },
  hi: {
    common: hi.common,
    settings: hi.settings,
    tabs: hi.tabs,
    currentSettings: hi.currentSettings,
    labels: hi.labels,
    buttons: hi.buttons,
    feedback: hi.feedback,
    writingTones: hi.writingTones,
  },
  th: {
    common: th.common,
    settings: th.settings,
    tabs: th.tabs,
    currentSettings: th.currentSettings,
    labels: th.labels,
    buttons: th.buttons,
    feedback: th.feedback,
    writingTones: th.writingTones,
  },
  vi: {
    common: vi.common,
    settings: vi.settings,
    tabs: vi.tabs,
    currentSettings: vi.currentSettings,
    labels: vi.labels,
    buttons: vi.buttons,
    feedback: vi.feedback,
    writingTones: vi.writingTones,
  },
  nl: {
    common: nl.common,
    settings: nl.settings,
    tabs: nl.tabs,
    currentSettings: nl.currentSettings,
    labels: nl.labels,
    buttons: nl.buttons,
    feedback: nl.feedback,
    writingTones: nl.writingTones,
  },
  sv: {
    common: sv.common,
    settings: sv.settings,
    tabs: sv.tabs,
    currentSettings: sv.currentSettings,
    labels: sv.labels,
    buttons: sv.buttons,
    feedback: sv.feedback,
    writingTones: sv.writingTones,
  },
  no: {
    common: no.common,
    settings: no.settings,
    tabs: no.tabs,
    currentSettings: no.currentSettings,
    labels: no.labels,
    buttons: no.buttons,
    feedback: no.feedback,
    writingTones: no.writingTones,
  },
  da: {
    common: da.common,
    settings: da.settings,
    tabs: da.tabs,
    currentSettings: da.currentSettings,
    labels: da.labels,
    buttons: da.buttons,
    feedback: da.feedback,
    writingTones: da.writingTones,
  },
  fi: {
    common: fi.common,
    settings: fi.settings,
    tabs: fi.tabs,
    currentSettings: fi.currentSettings,
    labels: fi.labels,
    buttons: fi.buttons,
    feedback: fi.feedback,
    writingTones: fi.writingTones,
  },
  pl: {
    common: pl.common,
    settings: pl.settings,
    tabs: pl.tabs,
    currentSettings: pl.currentSettings,
    labels: pl.labels,
    buttons: pl.buttons,
    feedback: pl.feedback,
    writingTones: pl.writingTones,
  },
  tr: {
    common: tr.common,
    settings: tr.settings,
    tabs: tr.tabs,
    currentSettings: tr.currentSettings,
    labels: tr.labels,
    buttons: tr.buttons,
    feedback: tr.feedback,
    writingTones: tr.writingTones,
  },
  he: {
    common: he.common,
    settings: he.settings,
    tabs: he.tabs,
    currentSettings: he.currentSettings,
    labels: he.labels,
    buttons: he.buttons,
    feedback: he.feedback,
    writingTones: he.writingTones,
  },
  cs: {
    common: cs.common,
    settings: cs.settings,
    tabs: cs.tabs,
    currentSettings: cs.currentSettings,
    labels: cs.labels,
    buttons: cs.buttons,
    feedback: cs.feedback,
    writingTones: cs.writingTones,
  },
  hu: {
    common: hu.common,
    settings: hu.settings,
    tabs: hu.tabs,
    currentSettings: hu.currentSettings,
    labels: hu.labels,
    buttons: hu.buttons,
    feedback: hu.feedback,
    writingTones: hu.writingTones,
  },
  ro: {
    common: ro.common,
    settings: ro.settings,
    tabs: ro.tabs,
    currentSettings: ro.currentSettings,
    labels: ro.labels,
    buttons: ro.buttons,
    feedback: ro.feedback,
    writingTones: ro.writingTones,
  },
  bg: {
    common: bg.common,
    settings: bg.settings,
    tabs: bg.tabs,
    currentSettings: bg.currentSettings,
    labels: bg.labels,
    buttons: bg.buttons,
    feedback: bg.feedback,
    writingTones: bg.writingTones,
  },
  sk: {
    common: sk.common,
    settings: sk.settings,
    tabs: sk.tabs,
    currentSettings: sk.currentSettings,
    labels: sk.labels,
    buttons: sk.buttons,
    feedback: sk.feedback,
    writingTones: sk.writingTones,
  },
  sl: {
    common: sl.common,
    settings: sl.settings,
    tabs: sl.tabs,
    currentSettings: sl.currentSettings,
    labels: sl.labels,
    buttons: sl.buttons,
    feedback: sl.feedback,
    writingTones: sl.writingTones,
  },
  uk: {
    common: uk.common,
    settings: uk.settings,
    tabs: uk.tabs,
    currentSettings: uk.currentSettings,
    labels: uk.labels,
    buttons: uk.buttons,
    feedback: uk.feedback,
    writingTones: uk.writingTones,
  },
  id: {
    common: id.common,
    settings: id.settings,
    tabs: id.tabs,
    currentSettings: id.currentSettings,
    labels: id.labels,
    buttons: id.buttons,
    feedback: id.feedback,
    writingTones: id.writingTones,
  },
  ms: {
    common: ms.common,
    settings: ms.settings,
    tabs: ms.tabs,
    currentSettings: ms.currentSettings,
    labels: ms.labels,
    buttons: ms.buttons,
    feedback: ms.feedback,
    writingTones: ms.writingTones,
  },
  bn: {
    common: bn.common,
    settings: bn.settings,
    tabs: bn.tabs,
    currentSettings: bn.currentSettings,
    labels: bn.labels,
    buttons: bn.buttons,
    feedback: bn.feedback,
    writingTones: bn.writingTones,
  },
  fa: {
    common: fa.common,
    settings: fa.settings,
    tabs: fa.tabs,
    currentSettings: fa.currentSettings,
    labels: fa.labels,
    buttons: fa.buttons,
    feedback: fa.feedback,
    writingTones: fa.writingTones,
  },
  ur: {
    common: ur.common,
    settings: ur.settings,
    tabs: ur.tabs,
    currentSettings: ur.currentSettings,
    labels: ur.labels,
    buttons: ur.buttons,
    feedback: ur.feedback,
    writingTones: ur.writingTones,
  },
  // Fallback to English for compatibility
  en: {
    common: en.common,
    settings: en.settings,
    tabs: en.tabs,
    currentSettings: en.currentSettings,
    labels: en.labels,
    buttons: en.buttons,
    feedback: en.feedback,
    writingTones: en.writingTones,
  },
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(customLanguageDetector)
  .use(initReactI18next)
  .init({
    resources,

    // Default language (use US English by default)
    fallbackLng: "en-US",

    // Default namespace
    defaultNS: "common",

    // Namespaces
    ns: ["common", "settings", "tabs", "currentSettings", "labels", "buttons", "feedback", "writingTones"],

    // Language detection options
    detection: {
      order: ["custom", "navigator", "htmlTag"],
      caches: ["localStorage"],
      excludeCacheFor: ["cimode"],
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // React options
    react: {
      useSuspense: false, // Disable suspense for Office Add-ins
    },

    // Debug mode
    debug: process.env.NODE_ENV === "development",

    returnNull: false,
    returnEmptyString: false,
  });

export default i18n;
