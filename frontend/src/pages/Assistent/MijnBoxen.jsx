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

  const fetchBoxes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Geen token gevonden, login vereist");

      const params = new URLSearchParams({
        date: new Date().toISOString().split("T")[0],
      });

      const res = await fetch(`${API_BASE_URL}/api/assistant/all-boxes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Fout bij ophalen boxen");
      }

      const data = await res.json();

      // ✅ Bereken status correct
  const formattedBoxes = data
  .filter(row => row.tasksCount > 0)
  .map((row) => ({
    ...row,
    types: Array.isArray(row.types) ? row.types : row.types?.split(",") || [],
    status: row.completedCount === row.tasksCount
      ? "voltooid"
      : row.completedCount > 0
        ? "gedeeltelijk"
        : "openstaand",
  }));

      console.log("Fetched boxes:", formattedBoxes);
      setBoxes(formattedBoxes);
    } catch (err) {
      console.error("Error fetching boxes: ", err);
      alert("Fout bij ophalen van boxen: " + err.message);
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
      [boxId]: { ...prev[boxId], [taskId]: !prev[boxId]?.[taskId] },
    }));
  };

  const handleSaveTasks = async (boxId, selectedOptionId, customText) => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        session_id: Number(boxId),
        task_type_id: 999, // pas aan naar echte value
        selected_option_id: selectedOptionId || null,
        custom_text: customText?.trim() || null,
        completed: 0,
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
      fetchBoxes(); // refresh na update
    } catch (err) {
      console.error("Error saving tasks:", err);
      alert("Fout bij opslaan: " + err.message);
    }
  };

  const handleBoxCheck = (id) => {
    setBoxes((prev) =>
      prev.map((box) => {
        if (box.id !== id) return box;
        // toggle alleen voltooid/openstaand, behoud gedeeltelijk
        const newStatus =
          box.status === "voltooid"
            ? "openstaand"
            : box.status === "openstaand"
              ? "voltooid"
              : "gedeeltelijk";
        return { ...box, status: newStatus };
      })
    );
  };

  if (loading) {
    return (
      <PageLayout mainClassName="max-w-6xl mx-auto py-8 px-6 space-y-6">
        <AssistentNavBar />
        <p>Loading boxen...</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout mainClassName="max-w-6xl mx-auto py-8 px-6 space-y-6">
      <AssistentNavBar />
      <section className="bg-white rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 pb-3 mb-6 border-b border-gray-300">
          {t("assistentBoxen.allBoxes")}
        </h1>

        <BoxList
          boxes={boxes}
          onBoxCheck={handleBoxCheck}
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


export default MijnBoxen;