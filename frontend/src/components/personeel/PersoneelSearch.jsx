import React from "react";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

function PersoneelSearch({ value, onChange }) {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="flex items-center bg-[#C1A9CF] rounded-full px-4 py-1 w-56">
      <input
        type="text"
        placeholder={t("personeelSearch.placeholder")}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="bg-transparent flex-1 text-xs outline-none placeholder:text-gray-600"
      />
      <span className="text-sm">🔍</span>
    </div>
  );
}

export default PersoneelSearch;
