import React, { useState } from 'react';
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

function Rapporten({ data = [] }) {
    const { language, letLanguage } = useLanguage();
    const { t } = useTranslation();

    const getTypeColor = (type) => {
        const typeLower = type.toLowerCase().trim();
        if (typeLower === 'ochtend') return 'bg-blue-100 text-blue-700 border-blue-300';
        if (typeLower === 'avond') return 'bg-purple-100 text-purple-700 border-purple-300';
        if (typeLower === 'wekelijks') return 'bg-orange-100 text-orange-700 border-orange-300';
        if (typeLower === 'maandelijks') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        return 'bg-gray-100 text-gray-700 border-gray-300';
    };

    return(
        <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-[#F8F9FA]">
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">{t("rapporten.date")}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">{t("rapporten.box")}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">{t("rapporten.assistant")}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">{t("rapporten.amountTasks")}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">{t("rapporten.sortTasks")}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">{t("rapporten.status")}</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">{t("rapporten.reason")}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id} className="bg-white hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm border-b border-gray-100">{item.datum}</td>
                            <td className="px-6 py-4 text-sm border-b border-gray-100">{item.box}</td>
                            <td className="px-6 py-4 text-sm border-b border-gray-100">{item.assistent}</td>
                            <td className="px-6 py-4 text-sm border-b border-gray-100">{item.aantal}</td>
                            <td className="px-6 py-4 text-sm border-b border-gray-100">
                                <div className="flex flex-wrap gap-1">
                                    {(item.soort || '').split(',').map((type, idx) => (
                                        <span
                                            key={idx}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(type)}`}
                                        >
                                            {type.trim()}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm">{item.status}</td>
                            <td>{item.reden || "N.v.t."}</td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan="7" className="text-center py-10 text-gray-400 italic">{t("rapporten.noResults")}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

    );

}
export default Rapporten;