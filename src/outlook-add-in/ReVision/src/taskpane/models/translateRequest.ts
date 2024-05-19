export class TranslateRequest {
  sourceLanguage: string;
  targetLanguage: string;
  text: string;

  constructor(targetLanguage: string, text: string, sourceLanguage: string = "") {
    this.targetLanguage = targetLanguage;
    this.text = text;
    this.sourceLanguage = sourceLanguage;
  }
}
