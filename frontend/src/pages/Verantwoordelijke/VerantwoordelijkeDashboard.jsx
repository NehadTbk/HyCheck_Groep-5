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
      datumLabel: d.toLocaleDateString("nl-BE", { day: "2-digit", month: "2-digit" }),
    });
  }
  return days;
}

function VerantwoordelijkeDashboard() {
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [dagen, setDagen] = useState([]);
  const [planning, setPlanning] = useState({});

  useEffect(() => {
    setDagen(generateWeekDays(weekStart));
  }, [weekStart]);

  async function fetchWeekData() {
    try {
      const res = await fetch(
        `http://localhost:5001/api/calendar?weekStart=${weekStart.toISOString().slice(0, 10)}`
      );
      if (!res.ok) {
        console.error("GET /api/calendar failed", await res.text());
        return;
      }
      const data = await res.json();

      const newPlanning = {};
      const rawPlanning = data.planning || {};
      for (const [dateKey, boxesMap] of Object.entries(rawPlanning)) {
        newPlanning[dateKey] = [];
        for (const [boxId, assignment] of Object.entries(boxesMap || {})) {
          // normalize fields for frontend
          const rawAssistant = assignment.assistant_name || assignment.assistant || "";
          const assistantFirst = rawAssistant ? String(rawAssistant).split(" ")[0] : null;

          const normalized = {
            ...assignment,
            box_id: Number(boxId),
            shift_date: assignment.shift_date || dateKey,
            assistant_name: assignment.assistant_name || assignment.assistant || null,
            assistant_first: assistantFirst,
            dentist_name: assignment.dentist_name || assignment.dentist || null,
            box_color: assignment.box_color || assignment.color_code || null,
            task_groups: assignment.task_groups || [],
          };

          newPlanning[dateKey].push(normalized);
        }
        // sort by box_id
        newPlanning[dateKey].sort((a, b) => (a.box_id || 0) - (b.box_id || 0));
      }

      setPlanning(newPlanning);
    } catch (err) {
      console.error("Fout bij laden agenda:", err);
    }
  }

  useEffect(() => {
    fetchWeekData();
    const handler = () => fetchWeekData();
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
        <h1 className="text-3xl font-bold text-gray-800 pb-3 mb-6 border-b border-gray-300">Agenda</h1>

        <div className="flex space-x-6 text-2xl mb-4">
          <button onClick={() => changeWeek(-1)} className="text-gray-600 hover:text-[#582F5B]">&lt;</button>
          <button onClick={() => changeWeek(1)} className="text-gray-600 hover:text-[#582F5B]">&gt;</button>
        </div>

        <div className="grid grid-cols-5 gap-3 min-w-[900px]">
          {dagen.map((dag) => {
            const dayAssignments = planning[dag.datumISO] || [];

            // Sorteer assignments op box_id numeriek
            dayAssignments.sort((a, b) => a.box_id - b.box_id);

            return (
              <div key={dag.datumISO} className="flex flex-col space-y-2">
                <div className="bg-gray-50 border border-gray-300 p-2 text-center rounded-lg">
                  <div className="text-sm font-medium text-gray-600">{dag.dagNaam}</div>
                  <div className="text-lg font-bold text-gray-900">{dag.datumLabel}</div>
                </div>

                {dayAssignments.length > 0 ? (
                  dayAssignments.map((assignment) => {
                    const label = (() => {
                      const raw = assignment.task_groups;
                      const groups = Array.isArray(raw)
                        ? raw
                        : raw
                        ? String(raw).split(",")
                        : [];

                      if (groups.length === 0) return "O";

                      return groups
                        .map((g) => {
                          const key = String(g).trim();
                          switch (key) {
                            case "ochtend":
                              return "O";
                            case "avond":
                              return "A";
                            case "wekelijks":
                              return "W";
                            case "maandelijks":
                              return "M";
                            default:
                              return key.charAt(0).toUpperCase() || "?";
                          }
                        })
                        .join("+");
                    })();

                    return (
                      <div
                        key={`${dag.datumISO}-${assignment.box_id}-${assignment.start_time}`}
                        className="p-3 rounded-md border flex flex-col justify-center min-h-[50px] text-white"
                        style={{ backgroundColor: assignment.box_color || "#9e9e9e" }}
                      >
                        <div className="font-bold">
                          Box {assignment.box_id} / {assignment.assistant_first} / {label}
                        </div>
                        <div className="text-sm">
                          {assignment.start_time} - {assignment.end_time}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 border rounded-md text-gray-500 text-center">
                    Geen shifts
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}

export default VerantwoordelijkeDashboard;
