export class ReviseResponse {
  suggestionCategories: SuggestionCategory[];
  constructor(suggestionCategories: SuggestionCategory[]) {
    this.suggestionCategories = suggestionCategories;
  }
}

export class SuggestionCategory {
  category: string;
  categoryInUserLanguage: string;
  suggestions: Suggestion[];
  constructor(category: string, categoryInUserLanguage: string, suggestions: Suggestion[]) {
    this.category = category;
    this.categoryInUserLanguage = categoryInUserLanguage;
    this.suggestions = suggestions;
  }
}

export class Suggestion {
  needsAttention: boolean;
  title: string;
  titleInUserLanguage: string;
  explanation: string;
  explanationInUserLanguage: string;
  selected: boolean = false;
  constructor(
    needsAttention: boolean,
    title: string,
    titleInUserLanguage: string,
    explanation: string,
    explanationInUserLanguage: string
  ) {
    this.needsAttention = needsAttention;
    this.title = title;
    this.titleInUserLanguage = titleInUserLanguage;
    this.explanation = explanation;
    this.explanationInUserLanguage = explanationInUserLanguage;
  }
}
