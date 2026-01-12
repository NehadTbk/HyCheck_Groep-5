import React from "react";
import { useTranslation } from "../../i18n/useTranslation";

function PeriodicCard({ weeklyData, monthlyData }) {
  const { t } = useTranslation();

  const formatData = (data, fallbackKey) => {
    if (!data) return <span className="text-gray-400 italic">{t(fallbackKey)}</span>;
    const dateString = typeof data === 'object' ? data.date : data;
    return <span className="font-semibold text-gray-900">{dateString}</span>;
  };

  return (
    <article className="bg-white rounded-xl shadow-md px-8 py-6 min-h-[260px] w-full flex flex-col">
      <h3 className="text-base font-medium mb-4">{t("periodicCard.title")}</h3>

      <div className="space-y-3">
        <div className="flex gap-2 text-sm items-start">
          <span className="text-gray-600 min-w-[80px]">{t("periodicCard.weekly")}</span>
          <div className="flex-1">
            {formatData(weeklyData, "periodicCard.noWeekly")}
          </div>
        </div>

        <div className="flex gap-2 text-sm items-start">
          <span className="text-gray-600 min-w-[80px]">{t("periodicCard.monthly")}</span>
          <div className="flex-1">
            {formatData(monthlyData, "periodicCard.noMonthly")}
          </div>
        </div>
      </div>
    </article>
  );
}

export default PeriodicCard;