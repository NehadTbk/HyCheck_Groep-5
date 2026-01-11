import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import AfdelingshoofdNavBar from "../../components/navbar/AfdelingshoofdNavBar";
import MonthlyProgressCard from "../../components/cards/ProgressCard";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
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
  // Always show 12 months (even if backend returns fewer)
  const byName = new Map((Array.isArray(apiData) ? apiData : []).map((x) => [String(x.month), x]));

  return MONTHS_NL.map((mName, idx) => {
    const raw = byName.get(mName);
    const pct = raw?.percentage ?? 0;
    const status = raw?.status || statusFromPercentage(pct);
    return {
      month: mName,
      percentage: Number.isFinite(pct) ? pct : 0,
      status,
      meta: raw?.meta || { year, month: idx + 1 },
    };
  });
}

function AfdelingshoofdMonthlyOverview() {
  const token = useMemo(() => localStorage.getItem("token"), []);

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const [monthData, setMonthData] = useState(() => normalizeMonthData([], currentYear));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <PageLayout>
      <AfdelingshoofdNavBar />

      <div className="bg-white rounded-xl shadow-lg p-6 min-h-[500px]">
        <div className="mb-6 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">{t("afdelingshoofdMonthlyOverview.title")}</h1>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600" htmlFor="yearSelect">
                {t("afdelingshoofdMonthlyOverview.selectYear")}
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
            <div className="text-sm text-gray-500">{t("afdelingshoofdMonthlyOverview.loading")}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {monthData.map((item) => (
                <MonthlyProgressCard
                  key={`${item.meta?.year ?? year}-${item.meta?.month ?? item.month}`}
                  month={item.month}
                  percentage={item.percentage}
                  status={item.status}
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
