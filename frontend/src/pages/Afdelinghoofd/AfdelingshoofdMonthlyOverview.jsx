import React, { useEffect, useState } from "react";
import Topbar from "../../components/layout/Topbar";
import AfdelingshoofdNavBar from "../../components/navbar/AfdelingshoofdNavBar";
import MonthlyProgressCard from "../../components/cards/ProgressCard";

function AfdelingshoofdMonthlyOverview() {
  const [monthData, setMonthData] = useState([]);

  useEffect(() => {
    async function fetchMonthData() {
      try {
        const res = await fetch("/api/afdelingshoofd/monthly-overview"); //We hebben nog geen api's voor dynamische data
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
    <div className="min-h-screen bg-[#C6B6C2] flex flex-col">
      <Topbar />
      <main className="flex-1 px-8 py-6">
        <AfdelingshoofdNavBar />
        <div className="bg-[#E5E5E5] rounded-xl min-h-[calc(100vh-7rem)] px-10 py-6">
          <div className="mt-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
      </main>
    </div>
  );
}

export default AfdelingshoofdMonthlyOverview;
