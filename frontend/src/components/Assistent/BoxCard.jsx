import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

const typeColors = {
  Ochtend: "bg-blue-100 text-blue-700 border-blue-300",
  Avond: "bg-purple-100 text-purple-700 border-purple-300",
  Wekelijks: "bg-orange-100 text-orange-700 border-orange-300",
  Maandelijks: "bg-yellow-100 text-yellow-700 border-yellow-300",
};

function BoxCard({ box, onCheck, onClick }) {
  const isVoltooid = box.status === "voltooid";
  const isGedeeltelijk = box.status === "gedeeltelijk";
  const { t } = useTranslation();
  useLanguage();

  // Kleuren aangepast voor beter contrast
  const cardStyles = isVoltooid
    ? "border-green-400 bg-green-50"
    : isGedeeltelijk
      ? "border-orange-400 bg-orange-50"
      : "border-red-300 bg-red-50";

  return (
    <div
      onClick={() => onClick(box)}
      className={`rounded-xl border px-4 py-3 shadow-lg cursor-pointer transition-all hover:brightness-95
                  w-[260px] h-[150px] flex flex-col justify-between relative ${cardStyles}`}
    >
      <div>
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-[16px]">{box.name}</h3>

          {/* Status badges en checkbox/icoon */}
          <div className="flex items-center gap-2">
            {isVoltooid && (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-normal bg-green-100 text-green-700 border border-green-200">
                {t("boxCard.completed")}
              </span>
            )}
            {isGedeeltelijk && (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-normal bg-orange-100 text-orange-700 border border-orange-200">
                {t("boxCard.partial")}
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onCheck(box.id);
              }}
              className="transition-colors"
            >
              {isGedeeltelijk ? (
                <AlertCircle size={22} className="text-orange-500" strokeWidth={2.5} />
              ) : (
                <CheckCircle
                  size={22}
                  strokeWidth={2.5}
                  className={isVoltooid ? "text-green-500" : "text-gray-300 hover:text-green-400"}
                />
              )}
            </button>
          </div>
        </div>

        <p className="text-[14px] text-gray-700 font-medium">
          {t("boxCard.dentist")}: {box.dentist}
        </p>
        <p className="text-[14px] text-gray-700">
          {t("boxCard.taskCount")}: {box.tasksCount}
        </p>
      </div>

      {/* Taak tags met kleuren */}
      <div className="mt-2 flex gap-2 overflow-x-hidden">
        {box.types.map((type) => (
          <span
            key={type}
            className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${typeColors[type] || "bg-gray-100"
              }`}
          >
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}

export default BoxCard;