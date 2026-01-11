import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import AfdelingshoofdNavBar from "../../components/navbar/AfdelingshoofdNavBar";
import MonthlyProgressCard from "../../components/cards/ProgressCard";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

  const handleDownloadPDF = async (monthName, monthIndex) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/reports?month=${monthIndex + 1}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        alert(`Geen gegevens gevonden voor ${monthName} ${year}`);
        return;
      }

      const doc = new jsPDF();
      const img = new Image();
      img.src = '/hycheck-logo.png'; // Zorg dat dit logo in je /public map staat

      img.onload = () => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const imgWidth = 20;
        const imgHeight = 20;
        const margin = 14;

        // Logo toevoegen rechtsboven
        doc.addImage(img, 'PNG', pageWidth - imgWidth - margin, 10, imgWidth, imgHeight);

        // Titel
        doc.setFontSize(16);
        doc.text(`Maandrapportage: ${monthName} ${year}`, margin, 20);

        const tableColumn = ["Datum", "Box", "Assistent", "Status", "Reden"];
        const tableRows = data.map(item => [
          item.datum,
          item.box,
          item.assistent,
          item.status,
          item.reden || "-"
        ]);

        autoTable(doc, {
          startY: 35,
          head: [tableColumn],
          body: tableRows,
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 3,
            valign: 'middle',
            overflow: 'linebreak'
          },
          headStyles: {
            fillColor: [74, 33, 68], // De paarse kleur uit je andere PDF
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 50 }
          },
          margin: { left: 15, right: 15 }
        });

        doc.save(`Rapportage_${monthName}_${year}.pdf`);
      };
    } catch (err) {
      console.error("PDF Export fout:", err);
      alert("Fout bij het genereren van de PDF.");
    }
  };

  return (
    <PageLayout>
      <AfdelingshoofdNavBar />

      <div className="bg-white rounded-xl shadow-lg p-6 min-h-[500px]">
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
                  month={item.month}
                  percentage={item.percentage}
                  status={item.status}
                  // HIER koppel je jouw functie aan de prop van de ProgressCard
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
