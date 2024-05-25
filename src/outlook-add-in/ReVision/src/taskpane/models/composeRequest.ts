export class ComposeRequest {
  currentEmail: string;
  input: string;
  targetLanguage: string;
  writingTone: string;
  constructor(currentEmail: string, input: string, targetLanguage: string, writingTone: string) {
    this.currentEmail = currentEmail;
    this.input = input;
    this.targetLanguage = targetLanguage;
    this.writingTone = writingTone;
  }
}
