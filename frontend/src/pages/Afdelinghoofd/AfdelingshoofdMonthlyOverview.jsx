import React, { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import AfdelingshoofdNavBar from "../../components/navbar/AfdelingshoofdNavBar";
import MonthlyProgressCard from "../../components/cards/ProgressCard";

function AfdelingshoofdMonthlyOverview() {
  const [monthData, setMonthData] = useState([]);

  useEffect(() => {
    async function fetchMonthData() {
      try {
        const res = await fetch(`/api/afdelingshoofd/monthly-overview?year=${new Date().getFullYear()}`); //We hebben nog geen api's voor dynamische data
        const data = await res.json();
        setMonthData(data);
      } catch (err) {
        console.error("Fout bij ophalen maanddata:", err);
      }
    }
    fetchMonthData();
  }, []);

  /*const MONTH_DATA = [
  { month: "December", percentage: 67, status: "warning" },
  { month: "November", percentage: 97, status: "ok" },
  { month: "Oktober", percentage: 72, status: "ok" },
  { month: "September", percentage: 61, status: "warning" },
  { month: "Augustus", percentage: 39, status: "danger" },
  { month: "Juli", percentage: 93, status: "ok" },
];*/

  return (
    <PageLayout>
      <AfdelingshoofdNavBar />
        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[500px]">
          <div className="mb-6 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {monthData.map((item) => (
                <MonthlyProgressCard
                  key={item.month}
                  month={item.month}
                  percentage={item.percentage}
                  status={item.status}
                />
              ))}
            </div>
          </div>
        </div>
    </PageLayout>
  );
}

export default AfdelingshoofdMonthlyOverview;
