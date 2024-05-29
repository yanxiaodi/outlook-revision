import { Suggestion } from "./suggestResponse";

export class ReviseRequest {
  draft: string;
  targetLanguage: string;
  writingTone: string;
  suggestions: Suggestion[];

  constructor(draft: string, targetLanguage: string, writingTone: string, suggestions: Suggestion[]) {
    this.draft = draft;
    this.targetLanguage = targetLanguage;
    this.writingTone = writingTone;
    this.suggestions = suggestions;
  }
}
