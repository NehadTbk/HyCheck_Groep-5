import React, { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import AssistentNavBar from "../../components/navbar/AssistentNavBar";
import BoxList from "../../components/Assistent/BoxList";
import TaskModal from "../../components/Assistent/TaskModal";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function MijnBoxen() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBox, setSelectedBox] = useState(null);
  const [tasksState, setTasksState] = useState({});
  const { t } = useTranslation();
  useLanguage();

  // Helper voor de datum van morgen
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const fetchBoxes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Veilige manier om lokale datum van morgen te pakken (YYYY-MM-DD)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toLocaleDateString('en-CA'); // Geeft altijd YYYY-MM-DD

      console.log("Fetching for date:", dateString); // Debug check in je browser console

      const res = await fetch(`${API_BASE_URL}/api/assistant/all-boxes?date=${dateString}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Fout bij ophalen");
      const data = await res.json();
      setBoxes(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxes();
  }, []);
  const handleToggleTask = (boxId, taskId) => {
    setTasksState((prev) => ({
      ...prev,
      [boxId]: {
        ...prev[boxId],
        [taskId]: !prev[boxId]?.[taskId]
      },
    }));
  };

  const handleSaveTasks = async (boxId, selectedOptionId, customText) => {
    if (!boxId) {
      alert("Fout: Geen geldige sessie-ID gevonden.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // We sturen de session_id (boxId) en de volledige set aan vinkjes (tasksState)
      const payload = {
        session_id: boxId,
        tasks: tasksState[boxId] || {}, // De vinkjes uit de modal
        selected_option_id: selectedOptionId || null,
        custom_text: customText?.trim() || null,
      };

      const res = await fetch(`${API_BASE_URL}/api/tasks/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Kon taken niet opslaan");
      }

      setSelectedBox(null);
      fetchBoxes(); // Ververs de lijst voor de nieuwe percentages/status
    } catch (err) {
      console.error("Error saving tasks:", err);
      alert("Fout bij opslaan: " + err.message);
    }
  };

  // Mock function voor de checkbox op de kaart zelf (optioneel)
  const handleBoxCheck = (id) => {
    // In 'Mijn Boxen' (alle boxen) is direct inchecken meestal niet wenselijk 
    // zonder modal, maar we behouden de logica voor UI consistentie
    setBoxes((prev) =>
      prev.map((box) => {
        if (box.id !== id) return box;
        const newStatus = box.status === "voltooid" ? "openstaand" : "voltooid";
        return { ...box, status: newStatus };
      })
    );
  };

  if (loading) {
    return (
      <PageLayout mainClassName="max-w-6xl mx-auto py-8 px-6 space-y-6">
        <AssistentNavBar />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 animate-pulse text-lg italic">Boxen ophalen...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout mainClassName="max-w-6xl mx-auto py-8 px-6 space-y-6">
      <AssistentNavBar />

      <section className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {t("assistentBoxen.allBoxes")}
          </h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
            {new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString('nl-BE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}          </span>
        </div>

        <BoxList
          boxes={boxes}
          onBoxCheck={handleBoxCheck}
          onBoxClick={(box) => setSelectedBox(box)}
        />

        {boxes.length === 0 && (
          <p className="text-center py-12 text-gray-400 italic">
            Geen boxen toegewezen voor vandaag.
          </p>
        )}
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

export default MijnBoxen;