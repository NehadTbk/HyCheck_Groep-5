import React, { useEffect, useMemo, useState } from "react";

import PageLayout from "../../components/layout/PageLayout";
import AfdelingshoofdNavBar from "../../components/navbar/AfdelingshoofdNavBar";

import ProgressCard from "../../components/cards/ProgressCard";
import PeriodicCard from "../../components/cards/PeriodicCard";
import CreateAccountCard from "../../components/cards/CreateAccountCard";

import { useLanguage } from "../../i18n/useLanguage";
import { useTranslation } from "../../i18n/useTranslation";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";

const MONTHS_NL = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December",
];

function AfdelingshoofdDashboard() {
  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();
  const monthIndex = now.getMonth();   // 0..11
  const monthNumber = monthIndex + 1;  // 1..12
  const monthName = MONTHS_NL[monthIndex];

  const [thisMonth, setThisMonth] = useState({
    percentage: 0,
    status: "danger",
  });

  useEffect(() => {
    fetch(`/api/afdelingshoofd/monthly-overview?year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        const found = Array.isArray(data)
          ? data.find((m) => m?.meta?.month === monthNumber)
          : null;

        if (found) {
          setThisMonth({
            percentage: found.percentage ?? 0,
            status: found.status ?? "danger",
          });
        }
      })
      .catch((err) => console.error("Dashboard monthly fetch error:", err));
  }, [year, monthNumber]);

  // Optional: hook this to your real download endpoint later
  const handleDownload = () => {
    console.log("Download dashboard report for:", monthName, year);
    // example later:
    // window.open(`/api/reports/monthly?year=${year}&month=${monthNumber}`, "_blank");
  };

  return (
    <PageLayout>
      <AfdelingshoofdNavBar />

      <div className="bg-white rounded-xl shadow-lg p-6 min-h-[500px]">
        <section className="mb-6 flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <ProgressCard
              clickable
              month={monthName}
              percentage={thisMonth.percentage}
              status={thisMonth.status}
              onDownload={handleDownload}
              downloadTitle="Download maandrapport"
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
