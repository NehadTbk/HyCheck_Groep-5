import React, { useState } from 'react';
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

function Rapporten({ data = [] }) {
    const { language, letLanguage } = useLanguage();
    const { t } = useTranslation();

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
                                <span className="bg-[#E1F0FF] text-[#007BFF] px-3 py-1 rounded-md text-xs font-medium border border-[#A5D1FF]">
                                    {item.soort}
                                </span>
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