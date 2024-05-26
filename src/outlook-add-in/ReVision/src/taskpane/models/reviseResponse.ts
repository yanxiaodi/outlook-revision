export class ReviseResponse {
  suggestionCategories: SuggestionCategory[];
  constructor(suggestionCategories: SuggestionCategory[]) {
    this.suggestionCategories = suggestionCategories;
  }
}

export class SuggestionCategory {
  category: string;
  suggestions: Suggestion[];
  constructor(category: string, suggestions: Suggestion[]) {
    this.category = category;
    this.suggestions = suggestions;
  }
}

export class Suggestion {
  title: string;
  explanation: string;
  selected: boolean = false;
  constructor(title: string, explanation: string) {
    this.title = title;
    this.explanation = explanation;
  }
}
