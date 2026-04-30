import fs from 'fs';
import path from 'path';

/**
 * Loads translation strings for a specific locale to be used in Playwright tests.
 */
export function getTranslations(locale: string) {
  const language = locale.split('-')[0]; // Handle en-US, es-ES, etc.
  const filePath = path.resolve(process.cwd(), `src/locales/${language}/translation.json`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Translation file not found for locale: ${locale} at ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Helper to get a nested translation string using dot notation.
 */
export function t(translations: any, key: string): string {
  const parts = key.split('.');
  let current = translations;
  
  for (const part of parts) {
    if (current[part] === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    current = current[part];
  }
  
  return current;
}
