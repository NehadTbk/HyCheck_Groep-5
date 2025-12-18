// src/components/cards/PeriodicStatsCard.jsx
import React from "react";
import { IoCalendarOutline } from "react-icons/io5";

function PeriodicStatsCard({
  title = "Periodieke reiniging",
  weeklyLabel = "Wekelijks:",
  weeklyDate,
  monthlyLabel = "Maandelijks:",
  monthlyDate,
  icon = "calendar",
}) {
  const iconMap = {
    calendar: IoCalendarOutline,
    default: IoCalendarOutline,
  };

  const IconComponent = iconMap[icon] || iconMap.default;

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col justify-between shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <div className="w-8 h-8 rounded-full bg-[#F3E8FF] flex items-center justify-center">
          <IconComponent className="text-lg text-[#5F3A70]" />
        </div>
      </div>

      <div className="space-y-1 text-sm">
        <p>
          <span className="text-gray-600">{weeklyLabel} </span>
          <span className="font-semibold text-gray-900">{weeklyDate}</span>
        </p>
        <p>
          <span className="text-gray-600">{monthlyLabel} </span>
          <span className="font-semibold text-gray-900">{monthlyDate}</span>
        </p>
      </div>
    </div>
  );
}

export default PeriodicStatsCard;