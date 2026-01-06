import { useLanguage } from "./useLanguage";
import nl from "./locales/nl.json";
import fr from "./locales/fr.json";

const translations = { nl, fr };

export function useTranslation() {
  const { language } = useLanguage();

  function t(key) {
    const keys = key.split(".");
    let value = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    if (!value) {
      console.warn(`Missing translation: ${key} (${language})`);
      return key;
    }

    return value;
  }

  return { t, language };
}
