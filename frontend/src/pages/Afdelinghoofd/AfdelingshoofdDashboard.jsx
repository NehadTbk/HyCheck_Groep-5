import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import AfdelingshoofdNavBar from "../../components/navbar/AfdelingshoofdNavBar";
import ProgressCard from "../../components/cards/ProgressCard";
import PeriodicCard from "../../components/cards/PeriodicCard";
import CreateAccountCard from "../../components/cards/CreateAccountCard";
import { useTranslation } from "../../i18n/useTranslation"; 
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function AfdelingshoofdDashboard() {
  const { t } = useTranslation();
  const token = useMemo(() => localStorage.getItem("token"), []);
  
  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  
  
  const MONTH_KEYS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const currentMonthKey = MONTH_KEYS[monthIndex];

  const [thisMonth, setThisMonth] = useState({
    percentage: 0,
    status: "danger",
  });

  
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/afdelingshoofd/monthly-overview?year=${year}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => res.json())
      .then((data) => {
        
        const found = Array.isArray(data) 
          ? data.find((m) => m?.meta?.month === (monthIndex + 1)) 
          : null;

        if (found) {
          setThisMonth({
            percentage: found.percentage ?? 0,
            status: found.status ?? "danger",
          });
        }
      })
      .catch((err) => console.error("Dashboard monthly fetch error:", err));
  }, [year, monthIndex, token]);

  
  const handleDownload = async () => {
    const translatedMonth = t(`progressCard.months.${currentMonthKey}`);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/reports?month=${monthIndex + 1}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        alert(t("reports.noResults") + ` (${translatedMonth} ${year})`);
        return;
      }

      const doc = new jsPDF();
      const img = new Image();
      img.src = '/hycheck-logo.png'; 

      img.onload = () => {
        doc.addImage(img, 'PNG', doc.internal.pageSize.getWidth() - 34, 10, 20, 20);
        doc.setFontSize(16);
        doc.text(`${t("reports.title")}: ${translatedMonth} ${year}`, 14, 20);

        const tableColumn = [t("reports.date"), t("reports.box"), t("reports.assistant"), t("boxCard.taskCount"), t("reports.status"), t("reports.reason")];
        const tableRows = data.map(item => [
          item.datum.split('T')[0],
          item.box,
          item.assistent,
          item.aantal || 0,
          item.status === "Voltooid" ? t("boxCard.completed") : t("boxCard.notCompleted"),
          item.reden || "-"
        ]);

        autoTable(doc, {
          startY: 35,
          head: [tableColumn],
          body: tableRows,
          theme: 'grid',
          headStyles: { fillColor: [74, 33, 68] }
        });

        doc.save(`Rapport_${translatedMonth}_${year}.pdf`);
      };
    } catch (err) {
      console.error("PDF Export fout:", err);
    }
  };

  return (
    <PageLayout>
      <AfdelingshoofdNavBar />
      <div className="bg-white rounded-xl shadow-lg p-6 min-h-[500px]">
        <section className="mb-6 flex flex-col lg:flex-row gap-6 text-black">
          <div className="flex-1">
            <ProgressCard
              clickable
             
              monthKey={currentMonthKey}
              percentage={thisMonth.percentage}
              status={thisMonth.status}
              onDownload={handleDownload}
              downloadTitle={t("progressCard.downloadTitle") || "Download"}
            />
          </div>
          <div className="flex-1">
            <PeriodicCard />
          </div>
          <div className="flex-1">
            <CreateAccountCard />
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default AfdelingshoofdDashboard;