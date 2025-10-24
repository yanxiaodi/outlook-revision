/* global console */
// Translation loader utility to dynamically load JSON files
export class TranslationLoader {
  private static cache: Map<string, any> = new Map();

  static async loadTranslations(language: string) {
    const cacheKey = language;

    // Return cached translations if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Use dynamic imports to load JSON files
      const [commonModule, settingsModule, tabsModule] = await Promise.all([
        this.loadJsonModule(`./locales/${language}/common.json`),
        this.loadJsonModule(`./locales/${language}/settings.json`),
        this.loadJsonModule(`./locales/${language}/tabs.json`),
      ]);

      const translations = {
        common: commonModule,
        settings: settingsModule,
        tabs: tabsModule,
      };

      // Cache the loaded translations
      this.cache.set(cacheKey, translations);

      return translations;
    } catch (error) {
      console.warn(`Failed to load translations for ${language}:`, error);

      // Fallback to English if the requested language fails and it's not English
      if (language !== "en") {
        console.log(`Falling back to English translations`);
        return this.loadTranslations("en");
      }

      // If English also fails, return empty translations
      console.error("Failed to load English translations, using empty fallback");
      return {
        common: {},
        settings: {},
        tabs: {},
      };
    }
  }

  private static async loadJsonModule(path: string) {
    try {
      // Use dynamic import for JSON files
      const module = await import(path);
      return module.default || module;
    } catch (error) {
      console.warn(`Failed to load JSON module: ${path}`, error);
      throw error;
    }
  }

  static clearCache() {
    this.cache.clear();
  }
}
