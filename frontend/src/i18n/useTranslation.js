import { useLanguage } from "./useLanguage";
import nl from "./locales/nl.json";
import fr from "./locales/fr.json";

const translations = { nl, fr };

function interpolate(str, vars = {}) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] !== undefined ? vars[key] : `{{${key}}}`
  );
}

export function useTranslation() {
  const { language } = useLanguage();

  function t(key, vars) {
    const keys = key.split(".");
    let value = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    if (!value) {
      console.warn(`Missing translation: ${key} (${language})`);
      return key;
    }

    if (typeof value === "string") {
      return interpolate(value, vars);
    }

    return value;
  }

  return { t, language };
}
