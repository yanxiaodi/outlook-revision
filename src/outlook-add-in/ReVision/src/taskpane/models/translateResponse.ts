export class TranslateResponse {
  translatedText: string;
  summary: string;
  constructor(translatedText: string, summary: string) {
    this.translatedText = translatedText;
    this.summary = summary;
  }
}
