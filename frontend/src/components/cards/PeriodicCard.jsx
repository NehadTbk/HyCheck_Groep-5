import React from "react";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

function PeriodicCard() {
  const { language, letLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <article className="bg-white rounded-xl shadow-md px-8 py-6 min-h-[260px] w-full">
      <h3 className="text-base font-medium mb-4">{t("periodicCard.title")}</h3>

      <div className="flex gap-2 text-sm mb-1">
        <span className="text-gray-600 w-20">{t("periodicCard.weekly")}</span>
        <span className="font-semibold">
          Dinsdag 1/11, Vrijdag 9/11, Woensdag 16/11, Donderdag 27/11
        </span>
      </div>

      <div className="flex gap-2 text-sm">
        <span className="text-gray-600 w-20">{t("periodicCard.monthly")}</span>
        <span className="font-semibold">Maandag 17/11</span>
      </div>
    </article>
  );
}

export default PeriodicCard;
