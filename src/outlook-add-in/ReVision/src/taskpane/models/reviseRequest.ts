export class ReviseRequest {
  draft: string;
  targetLanguage: string;
  writingTone: string;

  constructor(draft: string, targetLanguage: string, writingTone: string) {
    this.draft = draft;
    this.targetLanguage = targetLanguage;
    this.writingTone = writingTone;
  }
}
