import React from "react";
import { IoSearch } from "react-icons/io5";
import { useTranslation } from "../../i18n/useTranslation";

function PersoneelSearch({ value, onChange, label }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      {/* label is optioneel (als je het wil tonen zoals in Rapporten) */}
      {label && (
        <label className="text-sm font-semibold text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          placeholder={t("personeelSearch.placeholder")}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 pl-10 outline-none focus:ring-1 focus:ring-purple-400"
        />
        <IoSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
      </div>
    </div>
  );
}

export default PersoneelSearch;
