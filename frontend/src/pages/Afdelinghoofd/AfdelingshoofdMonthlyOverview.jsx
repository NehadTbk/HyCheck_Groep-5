import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import AfdelingshoofdNavBar from "../../components/navbar/AfdelingshoofdNavBar";
import MonthlyProgressCard from "../../components/cards/ProgressCard";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");

const MONTHS_NL = [
  "Januari",
  "Februari",
  "Maart",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Augustus",
  "September",
  "Oktober",
  "November",
  "December",
];

function statusFromPercentage(pct) {
  if (pct >= 70) return "ok";
  if (pct >= 50) return "warning";
  return "danger";
}

function normalizeMonthData(apiData, year) {
  const byName = new Map((Array.isArray(apiData) ? apiData : []).map((x) => [String(x.month), x]));

  const MONTH_KEYS = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];

  return MONTHS_NL.map((mName, idx) => {
    const raw = byName.get(mName);
    const pct = raw?.percentage ?? 0;
    const status = raw?.status || statusFromPercentage(pct);
    return {
      month: mName, 
      monthKey: MONTH_KEYS[idx], 
      percentage: Number.isFinite(pct) ? pct : 0,
      status,
      meta: raw?.meta || { year, month: idx + 1 },
    };
  });
}

function AfdelingshoofdMonthlyOverview() {
  const token = useMemo(() => localStorage.getItem("token"), []);
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const [monthData, setMonthData] = useState(() => normalizeMonthData([], currentYear));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchMonthData() {
      setIsLoading(true);
      setError("");

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/afdelingshoofd/monthly-overview?year=${year}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        );

        if (!res.ok) {
          throw new Error(`Monthly overview ophalen faalde (HTTP ${res.status})`);
        }

        const data = await res.json();
        if (cancelled) return;

        setMonthData(normalizeMonthData(data, year));
      } catch (err) {
        if (cancelled) return;
        console.error("Fout bij ophalen maanddata:", err);
        setMonthData(normalizeMonthData([], year));
        setError(err?.message || "Fout bij ophalen maanddata");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchMonthData();
    return () => {
      cancelled = true;
    };
  }, [year, token]);

  const handleDownloadPDF = async (monthName, monthIndex) => {
  // Gebruik de sleutels die exact in je fr.json/nl.json staan
  const MONTH_KEYS = ["january", "february", "march", "april", "may", "june", 
                      "july", "august", "september", "october", "november", "december"];
  
  // Vertaal de maandnaam dynamisch op basis van de geselecteerde taal op de site
  const translatedMonth = t(`progressCard.months.${MONTH_KEYS[monthIndex]}`);

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/reports?month=${monthIndex + 1}&year=${year}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      // Gebruik de nieuwe 'reports.noResults' sleutel voor de rode melding
      setInfoMsg(`${t("reports.noResults")} (${translatedMonth} ${year})`);
      setTimeout(() => setInfoMsg(""), 3000);
      return;
    }

    const doc = new jsPDF();
    const img = new Image();
    img.src = '/hycheck-logo.png'; 

    img.onload = () => {
      // Logo rechtsboven plaatsen
      doc.addImage(img, 'PNG', doc.internal.pageSize.getWidth() - 34, 10, 20, 20);

      // Titel vertalen (bijv. "Maandrapportage" of "Rapport mensuel")
      doc.setFontSize(16);
      doc.text(`${t("reports.title")}: ${translatedMonth} ${year}`, 14, 20);

      // Tabelkoppen vertalen met je nieuwe 'reports' keys
      const tableColumn = [
        t("reports.date"),
        t("reports.box"),
        t("reports.assistant"),
        t("reports.status"),
        t("reports.reason")
      ];

      const tableRows = data.map(item => [
        item.datum,
        item.box,
        item.assistent,
        // Status vertalen: check de waarde en kies de juiste Franse/Nederlandse term
        item.status === "Voltooid" ? t("boxCard.completed") : t("boxCard.notCompleted"),
        item.reden || "-"
      ]);

      autoTable(doc, {
        startY: 35,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [74, 33, 68] }, // De paarse kleur uit je dashboard
        styles: { fontSize: 8 }
      });

      doc.save(`Rapport_${translatedMonth}_${year}.pdf`);
    };
  } catch (err) {
    console.error("PDF Fout:", err);
  }
};

  return (
    <PageLayout>
      <AfdelingshoofdNavBar />

      <div className="bg-white rounded-xl shadow-lg p-6 min-h-[500px]">
        {infoMsg && (
            <div className="fixed top-[240px] left-1/2 transform -translate-x-1/2 z-[9999]">
                <div className="bg-[#FEE2E2] text-[#B91C1C] px-6 py-2 rounded-lg shadow-sm border border-[#FCA5A5] flex items-center gap-3 font-medium text-sm">
                    
                    <div className="w-5 h-5 rounded-full border-2 border-[#EF4444] flex items-center justify-center text-[#EF4444] bg-white text-[10px] font-black">
                        !
                    </div>
                    {infoMsg}
                </div>
            </div>
        )}
        <div className="mb-6 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Maandoverzicht</h1>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600" htmlFor="yearSelect">
                Jaar
              </label>
              <select
                id="yearSelect"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="text-sm text-gray-500">Bezig met laden…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {monthData.map((item, idx) => (
                <MonthlyProgressCard
                  key={`${item.meta?.year ?? year}-${item.month}`}
                  
                  monthKey={item.monthKey} 
                  percentage={item.percentage}
                  status={item.status}
                  onDownload={() => handleDownloadPDF(item.month, idx)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default AfdelingshoofdMonthlyOverview;
