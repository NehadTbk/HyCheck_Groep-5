import React from 'react';
import { IoSearch } from "react-icons/io5";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

function RapportFilter({ filters, onFilterChange }) {
    const { language, letLanguage } = useLanguage();
    const { t } = useTranslation();
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            
            <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">{t("rapportFilter.period")}</label>
                <select 
                    className="border border-gray-300 rounded-md p-2 bg-white outline-none focus:ring-1 focus:ring-purple-400"
                    value={filters.periode || "Aangepast"}
                    onChange={(e) => onFilterChange("periode", e.target.value)}
                >
                    <option value="Aangepast">{t("rapportFilter.accomodated")}</option>
                    <option value="Dagelijks">{t("rapportFilter.daily")}</option>
                    <option value="Wekelijks">{t("rapportFilter.weekly")}</option>
                    <option value="Maandelijks">{t("rapportFilter.monthly")}</option>
                </select>
            </div>

            
            {filters.periode === "Aangepast" ? (
                <>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">{t("rapportFilter.fromDate")}</label>
                        <input 
                            type="date"
                            value={filters.vanDatum}
                            onChange={(e) => onFilterChange("vanDatum", e.target.value)}
                            className="border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-purple-400"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">{t("rapportFilter.toDate")}</label>
                        <input 
                            type="date" 
                            value={filters.totDatum}
                            onChange={(e) => onFilterChange("totDatum", e.target.value)}
                            className="border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-purple-400"
                        />
                    </div>
                </>
            ) : (
                
                <div className="md:col-span-2"></div>
            )}

            
            <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">{t("rapportFilter.assistant")}</label>
                <div className="relative">
                    <input 
                        type="text"
                        value={filters.assistentZoek}
                        onChange={(e) => onFilterChange("assistentZoek", e.target.value)}
                        placeholder={t("rapportFilter.searchAssistant")}
                        className="w-full border border-gray-300 rounded-md p-2 pl-10 outline-none focus:ring-1 focus:ring-purple-400"
                    />
                    <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>
        </div>
    );
}

export default RapportFilter;