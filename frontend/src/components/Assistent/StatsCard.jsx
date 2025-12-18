// src/components/cards/StatsCard.jsx
import React from "react";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { IoTimeOutline } from "react-icons/io5";

function StatsCard({ title, value, subtitle, icon = "default" }) {
  const iconMap = {
    "check-circle": IoCheckmarkCircleOutline,
    clock: IoTimeOutline,
    default: IoCheckmarkCircleOutline,
  };

  const IconComponent = iconMap[icon] || iconMap.default;

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col justify-between shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-[#F3E8FF] flex items-center justify-center">
          <IconComponent className="text-lg text-[#5F3A70]" />
        </div>
      </div>
      <div className="text-3xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

export default StatsCard;