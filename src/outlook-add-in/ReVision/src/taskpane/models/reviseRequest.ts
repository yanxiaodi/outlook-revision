export class ReviseRequest {
  draft: string;
  targetLanguage: string;
  userLanguage: string;
  writingTone: string;

  constructor(draft: string, targetLanguage: string, userLanguage: string, writingTone: string) {
    this.draft = draft;
    this.targetLanguage = targetLanguage;
    this.userLanguage = userLanguage;
    this.writingTone = writingTone;
  }
}
