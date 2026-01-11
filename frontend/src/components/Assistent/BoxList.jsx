import React, { useState } from "react";
import BoxCard from "./BoxCard";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";


// Voeg onBoxCheck en onBoxClick toe aan de props
function BoxList({ boxes, onBoxCheck, onBoxClick }) {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const [statusFilter, setStatusFilter] = useState("alles");
  const [typeFilter, setTypeFilter] = useState("alle");

  const statusOptions = [
  { key: "alles", labelKey: "status.all" },
  { key: "openstaand", labelKey: "status.open" },
  { key: "voltooid", labelKey: "status.completed" },
];

  const typeOptions = [
    { key: "alle", labelKey: "tags.all" },
    { key: "morning", labelKey: "tags.morning" },
    { key: "evening", labelKey: "tags.evening" },
    { key: "weekly", labelKey: "tags.weekly" },
    { key: "monthly", labelKey: "tags.monthly" },
  ];

  const filtered = boxes.filter((box) => {
    if (statusFilter === "openstaand" && box.status !== "openstaand") {
      return false;
    }
    if (statusFilter === "voltooid" && box.status !== "voltooid") {
      return false;
    }
    if (typeFilter !== "alle" && !box.types.includes(typeFilter)) {
      return false;
    }
    return true;
  });

  const getStatusClasses = (key) => {
    const isActive = statusFilter === key;
    return [
      "px-3 py-1 text-xs rounded-full border",
      "bg-white text-gray-700 border-gray-300",
      isActive ? "font-semibold bg-gray-100" : "font-normal"
    ].join(" ");
  };

  const getTypeClasses = (key) => {
    const base = "px-3 py-1 text-xs rounded-full border font-medium";
    const isActive = typeFilter === key;

    const typeColors = {
  morning: "bg-blue-100 text-blue-700 border-blue-300",
  evening: "bg-purple-100 text-purple-700 border-purple-300",
  weekly: "bg-orange-100 text-orange-700 border-orange-300",
  monthly: "bg-yellow-100 text-yellow-700 border-yellow-300",
  alle: "bg-white text-gray-700 border-gray-300",
};

    // Voeg een visuele hint toe als een filter actief is
    const activeClass = isActive ? " ring-2 ring-offset-1 ring-gray-400" : "";

    return `${base} ${typeColors[key] || "bg-white text-gray-700 border-gray-300"}${activeClass}`;
  };

  return (
    <div className="space-y-4">
      {/* Filters bovenaan */}
      <div className="flex justify-end">
        <div className="flex flex-wrap gap-2 items-center">
          {statusOptions.map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={getStatusClasses(item.key)}
            >
              {t(item.labelKey)}
            </button>
          ))}

          <span className="mx-2 h-4 w-px bg-gray-200" />

          {typeOptions.map((item) => (
            <button
              key={item.key}
              onClick={() => setTypeFilter(item.key)}
              className={getTypeClasses(item.key)}
            >
              {t(item.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid met kaarten */}
      <div
        className="
          grid 
          gap-4 
          justify-center
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
      >
        {filtered.map((box) => (
          <BoxCard
            key={box.id}
            box={box}
            onCheck={onBoxCheck}
            onClick={onBoxClick}
          />
        ))}
      </div>
    </div>
  );
}

export default BoxList;