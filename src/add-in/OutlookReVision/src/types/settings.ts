export interface Language {
  code: string;
  name: string;
}

export interface AppSettings {
  emailWritingLanguage: string;
  nativeLanguage: string;
  writingTone: string;
  uiLanguage: string;
}

export const WRITING_TONES = {
  professional: "Professional",
  friendly: "Friendly",
  formal: "Formal",
  casual: "Casual",
  enthusiastic: "Enthusiastic",
  confident: "Confident",
  empathetic: "Empathetic",
  direct: "Direct",
  persuasive: "Persuasive",
  academic: "Academic",
} as const;

export type WritingToneKey = keyof typeof WRITING_TONES;

export const DEFAULT_SETTINGS: AppSettings = {
  emailWritingLanguage: "en-US",
  nativeLanguage: "en-US", // Will be overridden by browser language
  writingTone: "professional",
  uiLanguage: "en-US",
};
