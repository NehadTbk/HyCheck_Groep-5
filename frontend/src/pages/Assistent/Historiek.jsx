import React, { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import AssistentNavBar from "../../components/navbar/AssistentNavBar";
import HistoryModal from "../../components/Assistent/HistoryModal";
import { Search, Eye } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_BASE = `${API_BASE_URL}/api/history`;

const getToken = () => localStorage.getItem("token");

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const dateOnly = String(dateStr).split("T")[0];
  const parts = dateOnly.split("-");
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
};

function Historiek() {
  const { t } = useTranslation();

  const [selectedHistory, setSelectedHistory] = useState(null);
  const [historyRows, setHistoryRows] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const getStatusKey = (done, total, sessionStatus) => {
    if (total > 0 && done === total) return "completed";
    if (total > 0 && done > 0 && done < total) return "partial";
    if (sessionStatus === "completed") return "completed";
    return "notCompleted";
  };

  const getStatusStyle = (statusKey) => {
    switch (statusKey) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "partial":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "notCompleted":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const loadHistory = async (qValue = "") => {
    const token = getToken();
    if (!token) {
      setErrorMsg("Geen token gevonden. Log opnieuw in.");
      setHistoryRows([]);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const url = `${API_BASE}${qValue.trim() ? `?q=${encodeURIComponent(qValue.trim())}` : ""}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`History fetch failed (${res.status}): ${txt}`);
      }

      const data = await res.json();

      const mapped = (Array.isArray(data) ? data : []).map((r) => {
        const done = Number(r.done_tasks ?? 0);
        const total = Number(r.total_tasks ?? 0);

        const statusKey = getStatusKey(done, total, r.session_status);

        return {
          id: r.session_id,
          boxNr: r.box_name ? r.box_name : `Box ${r.box_id ?? ""}`.trim(),
          date: formatDate(r.date),
          statusKey,
          meta: {
            sessionId: r.session_id,
            rawDate: r.date,
            boxId: r.box_id,
            assistant: r.assistant_name,
            dentist: r.dentist_name,
            doneTasks: done,
            totalTasks: total,
          },
        };
      });

      setHistoryRows(mapped);
    } catch (err) {
      console.error(err);
      setErrorMsg("Kon historiek niet laden.");
      setHistoryRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory("");
  }, []);

  useEffect(() => {
    const id = setTimeout(() => loadHistory(search), 300);
    return () => clearTimeout(id);
  }, [search]);

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("historyAll.search") || "Zoeken..."}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5C2D5F]/20"
            />
          </div>
        </div>

        {loading && <div className="text-sm text-gray-500 mb-3">{t("historyModal.loading")}</div>}
        {errorMsg && <div className="text-sm text-red-600 mb-3">{errorMsg}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-gray-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-2 font-semibold">Box</th>
                <th className="px-6 py-2 font-semibold">{t("historyAll.date")}</th>
                <th className="px-6 py-2 font-semibold">{t("historyAll.status")}</th>
                <th className="px-6 py-2 font-semibold text-right">{t("historyAll.actions")}</th>
              </tr>
            </thead>

            <tbody>
              {historyRows.map((item) => (
                <tr key={item.id} className="bg-gray-50/50 hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 rounded-l-2xl font-bold text-gray-800">{item.boxNr}</td>
                  <td className="px-6 py-4 text-gray-600">{item.date}</td>

                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(item.statusKey)}`}>
                      {t(`historyModal.${item.statusKey}`)}
                    </span>

                    {item.meta?.totalTasks > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.meta.doneTasks}/{item.meta.totalTasks} {t("rapporten.amountTasks") || "taken"}
                      </div>
                    )}
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

              {!loading && historyRows.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-gray-500" colSpan={4}>
                    {t("historyModal.noTasks")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedHistory && <HistoryModal data={selectedHistory} onClose={() => setSelectedHistory(null)} />}
    </PageLayout>
  );
}

export default Historiek;