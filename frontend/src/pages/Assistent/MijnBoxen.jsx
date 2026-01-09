import React, { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import AssistentNavBar from "../../components/navbar/AssistentNavBar";
import BoxList from "../../components/Assistent/BoxList";
import TaskModal from "../../components/Assistent/TaskModal";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

const API_BASE_URL = import.meta.env.VITE_API_URL;


function MijnBoxen() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBox, setSelectedBox] = useState(null);
  const [tasksState, setTasksState] = useState({});

  const handleToggleTask = (boxId, taskId) => {
    setTasksState(prev => ({
      ...prev,
      [boxId]: { ...prev[boxId], [taskId]: !prev[boxId]?.[taskId] }
    }));
  };

  useEffect(()=> {
    const  fetchBoxes = async () => {
      try {
        const params = new URLSearchParams({
          date: new Date().toISOString().split("T")[0],
        });
        const
      }
    }
  })
  const handleSaveTasks = async (boxId, selectedOptionId, customText) => {
    // We bouwen de payload op voor de backend
    const payload = {
      session_id: boxId,
      task_type_id: 999, // Jouw nieuwe Algemene Schoonmaak taak ID
      selected_option_id: selectedOptionId || null,
      custom_text: customText && customText.trim() !== "" ? customText : null,
      completed: 0
    };

    try {
      const response = await fetch("http://localhost:5001/api/tasks/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSelectedBox(null);
        // Zet status lokaal op openstaand in de lijst
        setBoxes(prev => prev.map(b => b.id === boxId ? { ...b, status: "openstaand" } : b));
      }
    } catch (error) {
      console.error("Opslaan mislukt:", error);
    }
  };

  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <PageLayout mainClassName="max-w-6xl mx-auto py-8 px-6 space-y-6">
      <AssistentNavBar />
      <section className="bg-white rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 pb-3 mb-6 border-b border-gray-300">{t("assistentBoxen.allBoxes")}</h1>
        <BoxList 
          boxes={boxes} 
          onBoxCheck={(id) => setBoxes(prev => prev.map(box => box.id === id ? { ...box, status: box.status === "voltooid" ? "openstaand" : "voltooid" } : box))} 
          onBoxClick={(box) => setSelectedBox(box)} 
        />
      </section>

      {selectedBox && (
        <TaskModal
          box={selectedBox}
          tasksState={tasksState}
          onToggleTask={handleToggleTask}
          onSave={handleSaveTasks} // Hier worden boxId, optionId en text doorgegeven
          onClose={() => setSelectedBox(null)}
        />
      )}
    </PageLayout>
  );
}

export default MijnBoxen;