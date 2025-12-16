import { useState, useEffect } from "react";

export default function LanguageSwitcher({
    languages = ['nl', 'fr'],
    defaultLang = 'fr',
    onLanguageChange,
    className = ''
}) {
    const [currentLang, setCurrentLang] = useState(()=> {
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

        if(onLanguageChange) {
            onLanguageChange(lang);
        }
    };

    const languageLabels = {
        nl: "NL",
        fr: "FR"
    };

    return (
        <div className={`flex border border-gray-300 rounded-full overflow-hidden text-sm font-semibold ${className}`}>
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang)}
          className={`
            px-3 py-1 
            transition-colors duration-200 
            ${currentLang === lang 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-500 hover:bg-gray-100'
            }
          `}
        >
          {languageLabels[lang] || lang.toUpperCase()}
        </button>
      ))}
    </div>
    );
}