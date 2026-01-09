import React, { useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import AssistentNavBar from "../../components/navbar/AssistentNavBar";
import HistoryModal from "../../components/Assistent/HistoryModal";
import { Search, Eye } from "lucide-react";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

function Historiek() {
  const [selectedHistory, setSelectedHistory] = useState(null);

  // Voorbeeld data voor de historiek
  const historyData = [
    { id: 1, boxNr: "Box 1", date: "20/11/2024", status: "voltooid", tasks: [
        { title: "Filters schoonmaken", status: "voltooid", time: "08:15" },
        { title: "Waterleidingen spoelen", status: "voltooid", time: "08:20" }
    ]},
    { id: 2, boxNr: "Box 4", date: "19/11/2024", status: "gedeeltelijk", tasks: [
        { title: "Oppervlakken reinigen", status: "voltooid", time: "17:45" },
        { title: "Aspiratiesysteem reinigen", status: "niet voltooid", time: "-" },
        { title: "Spoelbekken schoonmaken", status: "voltooid", time: "18:05" }
    ]},
    { id: 3, boxNr: "Box 2", date: "18/11/2024", status: "niet voltooid", tasks: [
        { title: "MD555-oplossing", status: "niet voltooid", time: "-" }
    ]},
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "voltooid": return "bg-green-100 text-green-700 border-green-200";
      case "gedeeltelijk": return "bg-orange-100 text-orange-700 border-orange-200";
      case "niet voltooid": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <PageLayout mainClassName="max-w-6xl mx-auto py-8 px-6 space-y-6">
      <AssistentNavBar />

        <section className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center pb-3 mb-6 border-b border-gray-300">
            <h1 className="text-3xl font-bold text-gray-800">{t("historyAll.title")}</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder={t("historyAll.search") || "Zoeken..."} 
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5C2D5F]/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-gray-500 text-sm uppercase tracking-wider">
                  <th className="px-6 py-2 font-semibold">{t("historyAll.title")}</th>
                  <th className="px-6 py-2 font-semibold">{t("historyAll.date")}</th>
                  <th className="px-6 py-2 font-semibold">{t("historyAll.status")}</th>
                  <th className="px-6 py-2 font-semibold text-right">{t("historyAll.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((item) => (
                  <tr key={item.id} className="bg-gray-50/50 hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 rounded-l-2xl font-bold text-gray-800">{item.boxNr}</td>
                    <td className="px-6 py-4 text-gray-600">{item.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(item.status)}`}>
                        {item.status === "gedeeltelijk" ? "Gedeeltelijk voltooid" : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 rounded-r-2xl text-right">
                      <button 
                        onClick={() => setSelectedHistory(item)}
                        className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[#5C2D5F] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#5C2D5F] hover:text-white transition-all shadow-sm"
                      >
                        <Eye size={16} /> {t("historyAll.details")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      {selectedHistory && (
        <HistoryModal
          data={selectedHistory}
          onClose={() => setSelectedHistory(null)}
        />
      )}
    </PageLayout>
  );
}

export default Historiek;