import React from "react";
import Topbar from "../../components/common/Topbar";
import AssistentNavBar from "../../components/navbar/AssistentNavBar";
import ProgressCard from "../../components/cards/ProgressCard";
import PeriodicCard from "../../components/cards/PeriodicCard";
import BoxList from "../../components/assistent/BoxList";

function AssistentDashboard() {
  // Deze data kun je later uit props / API halen
  const todayCompleted = 12;
  const todayTotal = 15;
  const openTasks = 3;

  const weeklyDate = "Vrijdag 28/11";
  const monthlyDate = "Maandag 17/11";

  const boxes = [
    {
      id: 1,
      name: "Box 1",
      dentist: "Dr. ABCD",
      tasksCount: 2,
      status: "voltooid",
      types: ["Ochtend"],
    },
    {
      id: 2,
      name: "Box 2",
      dentist: "Dr. ABCD",
      tasksCount: 6,
      status: "voltooid",
      types: ["Avond", "Wekelijks", "Maandelijks"],
    },
    {
      id: 3,
      name: "Box 3",
      dentist: "Dr. ABCD",
      tasksCount: 4,
      status: "openstaand",
      types: ["Avond", "Wekelijks"],
    },
    {
      id: 4,
      name: "Box 4",
      dentist: "Dr. ABCD",
      tasksCount: 8,
      status: "openstaand",
      types: ["Ochtend", "Wekelijks", "Maandelijks"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#D7CBD6]">
      <Topbar />

      <div className="max-w-6xl mx-auto pt-6 pb-10">
        <AssistentNavBar />

        {/* Bovenste kaarten */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProgressCard
            title="Vandaag voltooid"
            value={`${todayCompleted}/${todayTotal}`}
            subtitle="Boxen schoongemaakt"
            variant="today"
          />

          <ProgressCard
            title="Openstaand"
            value={openTasks}
            subtitle="Boxen nog te doen"
            variant="open"
          />

          <PeriodicCard
            weeklyLabel="Wekelijks:"
            weeklyDate={weeklyDate}
            monthlyLabel="Maandelijks:"
            monthlyDate={monthlyDate}
          />
        </div>

        {/* Boxen overzicht */}
        <div className="mt-8">
          <BoxList boxes={boxes} />
        </div>
      </div>
    </div>
  );
}

export default AssistentDashboard;
