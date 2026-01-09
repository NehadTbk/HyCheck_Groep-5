import React, { useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import AssistentNavBar from "../../components/navbar/AssistentNavBar";
import StatsCard from "../../components/Assistent/StatsCard";
import PeriodicStatsCard from "../../components/Assistent/PeriodicStatsCard";
import BoxList from "../../components/Assistent/BoxList";
import TaskModal from "../../components/Assistent/TaskModal";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

function AssistentDashboard() {
  const [boxes, setBoxes] = useState([
    { id: 1, name: "Box 1", dentist: "Dr. ABCD", tasksCount: 2, status: "voltooid", types: ["Ochtend"] },
    { id: 2, name: "Box 2", dentist: "Dr. ABCD", tasksCount: 6, status: "voltooid", types: ["Avond", "Wekelijks", "Maandelijks"] },
    { id: 3, name: "Box 3", dentist: "Dr. ABCD", tasksCount: 4, status: "openstaand", types: ["Avond", "Wekelijks"] },
    { id: 4, name: "Box 4", dentist: "Dr. ABCD", tasksCount: 8, status: "openstaand", types: ["Ochtend", "Wekelijks", "Maandelijks"] },
    { id: 5, name: "Box 5", dentist: "Dr. EFGH", tasksCount: 3, status: "openstaand", types: ["Ochtend", "Wekelijks"] },
    { id: 6, name: "Box 6", dentist: "Dr. EFGH", tasksCount: 5, status: "voltooid", types: ["Avond"] },
    { id: 7, name: "Box 7", dentist: "Dr. IJKL", tasksCount: 7, status: "openstaand", types: ["Maandelijks"] },
    { id: 8, name: "Box 8", dentist: "Dr. IJKL", tasksCount: 1, status: "voltooid", types: ["Ochtend", "Maandelijks"] },
    { id: 9, name: "Box 9", dentist: "Dr. MNOP", tasksCount: 9, status: "openstaand", types: ["Avond", "Wekelijks", "Maandelijks"] },
    { id: 10, name: "Box 10", dentist: "Dr. MNOP", tasksCount: 2, status: "voltooid", types: ["Wekelijks"] },
  ]);

  const [selectedBox, setSelectedBox] = useState(null);
  const [tasksState, setTasksState] = useState({});

  const handleDirectCheck = (id) => {
    setBoxes(prev => prev.map(box => 
      box.id === id ? { ...box, status: box.status === "voltooid" ? "openstaand" : "voltooid" } : box
    ));
  };

  const handleToggleTask = (boxId, taskId) => {
    setTasksState(prev => ({
      ...prev,
      [boxId]: { ...prev[boxId], [taskId]: !prev[boxId]?.[taskId] }
    }));
  };

  const handleSaveTasks = (boxId) => {
  const currentBox = boxes.find(b => b.id === boxId);
  const boxTasks = tasksState[boxId] || {};
  
  // Tel aangevinkte taken
  const completedCount = Object.values(boxTasks).filter(v => v === true).length;
  
  // Logica voor status
  let newStatus = "openstaand";
  
  // We vergelijken met de tasksCount uit de box data
  if (completedCount >= currentBox.tasksCount) {
    newStatus = "voltooid";
  } else if (completedCount > 0) {
    newStatus = "gedeeltelijk"; // Wordt oranje met uitroepteken
  }

  setBoxes(prev => prev.map(b => b.id === boxId ? { ...b, status: newStatus } : b));
  setSelectedBox(null);
};

  const todayCompleted = boxes.filter(b => b.status === "voltooid").length;
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <PageLayout mainClassName="max-w-6xl mx-auto py-8 px-6 space-y-6">
      <AssistentNavBar />
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard title={t("assistentDashboard.todayCompleted")} value={`${todayCompleted}/${boxes.length}`} subtitle={t("assistentDashboard.completedSubtitle")} icon="check-circle" />
          <StatsCard title={t("assistentDashboard.openstaand")} value={boxes.length - todayCompleted} subtitle={t("assistentDashboard.pendingSubtitle")} icon="clock" />
          <PeriodicStatsCard weeklyDate="Vrijdag 28/11" monthlyDate="Maandag 17/11" icon="calendar" />
        </section>

        <section className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 pb-3 mb-6 border-b border-gray-300">
            {t("assistentDashboard.assignedBoxes")} — {new Date().toLocaleDateString("nl-NL")}
          </h2>
          <BoxList 
            boxes={boxes} 
            onBoxCheck={handleDirectCheck} 
            onBoxClick={(box) => setSelectedBox(box)} 
          />
        </section>

      {selectedBox && (
        <TaskModal
          box={selectedBox}
          tasksState={tasksState}
          onToggleTask={handleToggleTask}
          onSave={handleSaveTasks}
          onClose={() => setSelectedBox(null)}
        />
      )}
    </PageLayout>
  );
}

export default AssistentDashboard;