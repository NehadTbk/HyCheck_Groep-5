// src/components/cards/CreateAccountCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

function CreateAccountCard() {
  const navigate = useNavigate();
  const { language, letLanguage } = useLanguage();
  const { t } = useTranslation();

  const handleClick = () => {
    navigate("/afdelingshoofd/mijn-personeel", {
      state: { openAddPersonnel:true},
    });
  };

  return (
    <article
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className="
        bg-white rounded-xl shadow-lg px-8 py-10 min-h-[260px] w-full
        flex items-center justify-center
        cursor-pointer select-none
        transition-all
        hover:shadow-lg hover:bg-gray-50
        focus:outline-none focus:ring-2 focus:ring-[#7A4A77]
      "
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
    >
      <span className="text-base font-medium">
        {t("createAccountCard.title")}
      </span>
    </article>
  );
}

export default CreateAccountCard;
