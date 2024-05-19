export class TranslateResponse {
  text: string;
  summary: string;
  constructor(text: string, summary: string) {
    this.text = text;
    this.summary = summary;
  }
}
