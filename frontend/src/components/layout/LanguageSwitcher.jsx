import { useState } from "react";

export default function LanguageSwitcher({
  languages = ['nl', 'fr'],
  defaultLang = 'nl',
  onLanguageChange,
  className = '',
  variant = 'default'  // 'default' | 'blue'
}) {
  const [currentLang, setCurrentLang] = useState(() => {
    const savedLang = localStorage.getItem('preferredLanguage');
    const lang = savedLang && languages.includes(savedLang) ? savedLang : defaultLang;

    if (onLanguageChange) {
      onLanguageChange(lang);
    }

    return lang;
  });

  const handleLanguageChange = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('preferredLanguage', lang);

    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  const languageLabels = {
    nl: "NL",
    fr: "FR"
  };

  // Variant-based styling
  const baseStyles = "flex border border-gray-300 rounded-full overflow-hidden text-sm font-semibold";

  const variantStyles = {
    default: {
      active: 'bg-gray-200 px-2 py-1 text-gray-800',
      inactive: 'px-2 py-1 text-gray-500 cursor-pointer hover:bg-gray-100'
    },
    blue: {
      active: 'bg-blue-600 text-white px-3 py-1 transition-colors duration-200',
      inactive: 'text-gray-500 hover:bg-gray-100 px-3 py-1 transition-colors duration-200'
    }
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div className={`${baseStyles} ${className}`}>
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang)}
          className={currentLang === lang ? styles.active : styles.inactive}
        >
          {languageLabels[lang] || lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
