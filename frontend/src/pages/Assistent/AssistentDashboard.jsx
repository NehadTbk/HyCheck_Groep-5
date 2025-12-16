import React from "react";
import Topbar from "../../components/common/Topbar";
import AssistentNavBar from "../../components/Assistent/AssistentNavBar";
import StatsCard from "../../components/Assistent/StatsCard";
import PeriodicStatsCard from "../../components/Assistent/PeriodicStatsCard";
import BoxList from "../../components/Assistent/BoxList";

function AssistentDashboard() {
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
    {
      id: 5,
      name: "Box 5",
      dentist: "Dr. EFGH",
      tasksCount: 3,
      status: "openstaand",
      types: ["Ochtend", "Wekelijks"],
    },
    {
      id: 6,
      name: "Box 6",
      dentist: "Dr. EFGH",
      tasksCount: 5,
      status: "voltooid",
      types: ["Avond"],
    },
    {
      id: 7,
      name: "Box 7",
      dentist: "Dr. IJKL",
      tasksCount: 7,
      status: "openstaand",
      types: ["Maandelijks"],
    },
    {
      id: 8,
      name: "Box 8",
      dentist: "Dr. IJKL",
      tasksCount: 1,
      status: "voltooid",
      types: ["Ochtend", "Maandelijks"],
    },
    {
      id: 9,
      name: "Box 9",
      dentist: "Dr. MNOP",
      tasksCount: 9,
      status: "openstaand",
      types: ["Avond", "Wekelijks", "Maandelijks"],
    },
    {
      id: 10,
      name: "Box 10",
      dentist: "Dr. MNOP",
      tasksCount: 2,
      status: "voltooid",
      types: ["Wekelijks"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#E5DCE7]">
      {/* Topbar */}
      <Topbar />

      {/* Alles onder de paarse header in een centrale container */}
      <main className="max-w-6xl mx-auto py-8 px-6 space-y-6">
        {/* NavBar op exact dezelfde breedte */}
        <AssistentNavBar />

        {/* Bovenste statistiek-kaarten */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Vandaag voltooid"
            value={`${todayCompleted}/${todayTotal}`}
            subtitle="Boxen schoongemaakt"
            icon="check-circle"
          />
          <StatsCard
            title="Openstaand"
            value={openTasks}
            subtitle="Boxen nog te doen"
            icon="clock"
          />
          <PeriodicStatsCard
            weeklyDate={weeklyDate}
            monthlyDate={monthlyDate}
            icon="calendar"
          />
        </section>

        {/* Boxen-lijst */}
        <section className="bg-white rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 pb-3 mb-6 border-b border-gray-300">
            Mijn toegewezen boxen - 20/11
          </h2>
          <BoxList boxes={boxes} />
        </section>
      </main>
    </div>
  );
}

export default AssistentDashboard;
