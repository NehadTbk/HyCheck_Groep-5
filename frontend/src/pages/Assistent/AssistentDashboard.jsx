import React, { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import AssistentNavBar from "../../components/navbar/AssistentNavBar";
import StatsCard from "../../components/Assistent/StatsCard";
import PeriodicStatsCard from "../../components/Assistent/PeriodicStatsCard";
import BoxList from "../../components/Assistent/BoxList";
import TaskModal from "../../components/Assistent/TaskModal";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function AssistentDashboard() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBox, setSelectedBox] = useState(null);
  const [tasksState, setTasksState] = useState({});
  const { t } = useTranslation();
  useLanguage();

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const token = localStorage.getItem("token");
        const params = new URLSearchParams({
          date: new Date().toISOString().split("T")[0],
        });

        const res = await fetch(`${API_BASE_URL}/api/assistant/dashboard?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch dashboard");
        const data = await res.json();
        setBoxes(data);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoxes();
  }, []);

  const handleToggleTask = (boxId, taskId) => {
    setTasksState(prev => ({
      ...prev,
      [boxId]: { ...prev[boxId], [taskId]: !prev[boxId]?.[taskId] },
    }));
  };

  const handleDirectCheck = (id) => {
    setBoxes(prev => prev.map(box =>
      box.id === id ? { ...box, status: box.status === "voltooid" ? "openstaand" : "voltooid" } : box
    ));
  };

  const handleSaveTasks = async (boxId, reasonOptionId, reason) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: boxId,
          tasks: tasksState[boxId],
          selected_option_id: reasonOptionId,
          custom_text: reason || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Kon taken niet opslaan");
      }

      const currentBox = boxes.find(b => b.id === boxId);
      const completedCount = Object.values(tasksState[boxId] || {}).filter(Boolean).length;

      let newStatus = "openstaand";
      if (completedCount >= currentBox.tasksCount) newStatus = "voltooid";
      else if (completedCount > 0) newStatus = "gedeeltelijk";

      setBoxes(prev => prev.map(b => b.id === boxId ? { ...b, status: newStatus } : b));
      setSelectedBox(null);
    } catch (err) {
      console.error("Error saving tasks:", err);
      alert(err.message);
    }
  };

  const todayCompleted = boxes.filter(b => b.status === "voltooid").length;

  if (loading) {
    return (
      <PageLayout mainClassName="max-w-6xl mx-auto py-8 px-6 space-y-6">
        <AssistentNavBar />
        <p>{t("assistentDashboard.loading")}</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout mainClassName="max-w-6xl mx-auto py-8 px-6 space-y-6">
      <AssistentNavBar />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title={t("assistentDashboard.todayCompleted")}
          value={`${todayCompleted}/${boxes.length}`}
          subtitle={t("assistentDashboard.completedSubtitle")}
          icon="check-circle"
        />
        <StatsCard
          title={t("assistentDashboard.openstaand")}
          value={boxes.length - todayCompleted}
          subtitle={t("assistentDashboard.pendingSubtitle")}
          icon="clock"
        />
        <PeriodicStatsCard
          weeklyDate="Vrijdag 28/11"
          monthlyDate="Maandag 17/11"
          icon="calendar"
        />
      </section>

      <section className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 pb-3 mb-6 border-b border-gray-300">
          {t("assistentDashboard.assignedBoxes")} — {new Date().toLocaleDateString("nl-NL")}
        </h2>

        <BoxList
          boxes={boxes}
          onBoxCheck={handleDirectCheck}
          onBoxClick={setSelectedBox}
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
