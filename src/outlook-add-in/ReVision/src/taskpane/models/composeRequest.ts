export class ComposeRequest {
  currentEmailSubject: string;
  currentEmailBody: string;
  input: string;
  targetLanguage: string;
  writingTone: string;
  constructor(
    currentEmailSubject: string,
    currentEmailBody: string,
    input: string,
    targetLanguage: string,
    writingTone: string
  ) {
    this.currentEmailSubject = currentEmailSubject;
    this.currentEmailBody = currentEmailBody;
    this.input = input;
    this.targetLanguage = targetLanguage;
    this.writingTone = writingTone;
  }
}
