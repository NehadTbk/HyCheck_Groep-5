import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import AfdelingshoofdNavBar from "../../components/navbar/AfdelingshoofdNavBar";
import MonthlyProgressCard from "../../components/cards/ProgressCard";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslation } from "../../i18n/useTranslation";

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
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
        console.error(err);
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
    const MONTH_KEYS = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    const translatedMonth = t(`progressCard.months.${MONTH_KEYS[monthIndex]}`);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/reports?month=${monthIndex + 1}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setInfoMsg(`${t("reports.noResults")} (${translatedMonth} ${year})`);
        setTimeout(() => setInfoMsg(""), 3000);
        return;
      }

      const doc = new jsPDF();
      const img = new Image();
      img.src = "/hycheck-logo.png";

      img.onload = () => {
        doc.addImage(img, "PNG", doc.internal.pageSize.getWidth() - 34, 10, 20, 20);

        doc.setFontSize(16);
        doc.text(`${t("reports.title")}: ${translatedMonth} ${year}`, 14, 20);

        autoTable(doc, {
          startY: 35,
          head: [[
            t("reports.date"),
            t("reports.box"),
            t("reports.assistant"),
            t("reports.status"),
            t("reports.reason"),
          ]],
          body: data.map(item => [
            item.datum,
            item.box,
            item.assistent,
            item.status === "Voltooid"
              ? t("boxCard.completed")
              : t("boxCard.notCompleted"),
            item.reden || "-"
          ]),
          theme: "grid",
          headStyles: { fillColor: [74, 33, 68] },
          styles: { fontSize: 8 },
        });

        doc.save(`Rapport_${translatedMonth}_${year}.pdf`);
      };
    } catch (err) {
      console.error("PDF fout:", err);
    }
  };

  return (
    <PageLayout>
      <AfdelingshoofdNavBar />

      <div className="bg-white rounded-xl shadow-lg p-6 min-h-[500px]">
        {infoMsg && (
          <div className="fixed top-60 left-1/2 -translate-x-1/2 z-9999">
            <div className="bg-red-100 text-red-700 px-6 py-2 rounded-lg border border-red-300 text-sm font-medium">
              {infoMsg}
            </div>
          </div>
        )}

        <div className="mb-6 w-full">
          <div className="flex justify-between items-end pb-3 mb-8 border-b border-gray-300">
            <h1 className="text-3xl font-bold text-gray-800">{t("afdelingshoofdMonthlyOverview.title")}</h1>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">{t("afdelingshoofdMonthlyOverview.year")}</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-sm text-gray-500">Bezig met laden…</div>
          ) : (
            <>
              {/* ✅ RESPONSIVE GRID: past zich aan schermgrootte aan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default AfdelingshoofdMonthlyOverview;
