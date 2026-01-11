// src/components/cards/PeriodicStatsCard.jsx
import React from "react";
import { IoCalendarOutline } from "react-icons/io5";
import { useTranslation } from "../../i18n/useTranslation";

function PeriodicStatsCard({
  weeklyData,
  monthlyData,
  icon = "calendar",
}) {
  const iconMap = {
    calendar: IoCalendarOutline,
    default: IoCalendarOutline,
  };

  const IconComponent = iconMap[icon] || iconMap.default;
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl p-6 flex flex-col justify-between shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-900">{t("periodicStatsCard.title")}</h3>
        <div className="w-8 h-8 rounded-full bg-[#F3E8FF] flex items-center justify-center">
          <IconComponent className="text-lg text-[#5F3A70]" />
        </div>
      </div>

      <div className="space-y-1 text-sm">
        <p>
          <span className="text-gray-600">{t("periodicStatsCard.weekly")} </span>
          {weeklyData ? (
            <span className="font-semibold text-gray-900">{weeklyData.date}</span>
          ) : (
            <span className="text-gray-400 italic">{t("periodicStatsCard.noWeekly")}</span>
          )}
        </p>
        <p>
          <span className="text-gray-600">{t("periodicStatsCard.monthly")} </span>
          {monthlyData ? (
            <span className="font-semibold text-gray-900">{monthlyData.date}</span>
          ) : (
            <span className="text-gray-400 italic">{t("periodicStatsCard.noMonthly")}</span>
          )}
        </p>
      </div>
    </div>
  );
}

export default PeriodicStatsCard;