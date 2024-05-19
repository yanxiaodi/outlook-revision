export class TranslateRequest {
  targetLanguage: string;
  text: string;

  constructor(targetLanguage: string, text: string) {
    this.targetLanguage = targetLanguage;
    this.text = text;
  }
}