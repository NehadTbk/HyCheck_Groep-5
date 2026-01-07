import React, { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import VerantwoordelijkeNavBar from "../../components/navbar/VerantwoordelijkeNavBar";

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function generateWeekDays(weekStart) {
  const dayNames = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"];
  const days = [];

  for (let i = 0; i < 5; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);

    days.push({
      dagNaam: dayNames[i],
      datumISO: d.toISOString().slice(0, 10),
      datumLabel: d.toLocaleDateString("nl-BE", {
        day: "2-digit",
        month: "2-digit",
      }),
    });
  }

  return days;
}

function VerantwoordelijkeDashboard() {
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [dagen, setDagen] = useState([]);
  const [boxen, setBoxen] = useState([]);
  const [planning, setPlanning] = useState({});

  useEffect(() => {
    setDagen(generateWeekDays(weekStart));
  }, [weekStart]);

  async function fetchWeekData() {
    try {
      const res = await fetch(
        `http://localhost:5001/api/calendar?weekStart=${weekStart
          .toISOString()
          .slice(0, 10)}`
      );
      if (!res.ok) {
        console.error("GET /api/calendar failed", await res.text());
        return;
      }
      const data = await res.json();
      setBoxen(data.boxen || []);
      setPlanning(data.planning || {});
    } catch (err) {
      console.error("Fout bij laden agenda:", err);
    }
  }

  useEffect(() => {
    fetchWeekData();

    const handler = (e) => {
      fetchWeekData();
    };
    window.addEventListener("calendarUpdated", handler);

    return () => window.removeEventListener("calendarUpdated", handler);
  }, [weekStart]);

  const changeWeek = (direction) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + direction * 7);
    setWeekStart(d);
  };

  return (
    <PageLayout>
      <VerantwoordelijkeNavBar />

      <div className="p-6 bg-white rounded-xl shadow-lg min-h-[500px] overflow-x-auto">
        <h1 className="text-3xl font-bold text-gray-800 pb-3 mb-6 border-b border-gray-300">
          Agenda
        </h1>

        <div className="flex space-x-6 text-2xl mb-4">
          <button
            onClick={() => changeWeek(-1)}
            className="text-gray-600 hover:text-[#582F5B]"
          >
            &lt;
          </button>
          <button
            onClick={() => changeWeek(1)}
            className="text-gray-600 hover:text-[#582F5B]"
          >
            &gt;
          </button>
        </div>

        <div className="grid grid-cols-5 gap-3 min-w-[900px]">
          {dagen.map((dag) => (
            <div
              key={dag.datumISO}
              className="bg-gray-50 border border-gray-300 p-2 text-center rounded-lg"
            >
              <div className="text-sm font-medium text-gray-600">
                {dag.dagNaam}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {dag.datumLabel}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                {boxen.length ? `${boxen.length} boxen` : "—"}
              </div>
            </div>
          ))}

          {boxen.map((box) => (
            <React.Fragment key={box.box_id}>
              <div
                className="p-3 rounded-md font-bold text-white flex items-center justify-center"
                style={{ backgroundColor: box.color_code || "#9e9e9e" }}
              >
                {box.name}
              </div>

              {dagen.map((dag) => {
                const cel = planning?.[dag.datumISO]?.[box.box_id] || null;

                return (
                  <div
                    key={`${dag.datumISO}-${box.box_id}`}
                    className={`p-3 rounded-md border flex items-center justify-center min-h-[50px] ${cel && cel.color_code
                        ? "text-white"
                        : "bg-gray-50 text-gray-700"
                      }`}
                    style={{
                      backgroundColor: cel && cel.color_code ? cel.color_code : undefined,
                    }}
                  >
                    {cel ? cel.label : ""}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

export default VerantwoordelijkeDashboard;
