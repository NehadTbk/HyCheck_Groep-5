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
import { Check, X } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function AssistentDashboard() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBox, setSelectedBox] = useState(null);
  const [tasksState, setTasksState] = useState({});
  const [periodicData, setPeriodicData] = useState({ weekly: null, monthly: null });
  const [currentDate, setCurrentDate] = useState("");
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string }
  const { t } = useTranslation();
  useLanguage();

  // Auto-hide notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const token = localStorage.getItem("token");

        // Gebruik morgen als datum (YYYY-MM-DD in lokale tijd, geen UTC conversie)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateString = tomorrow.toLocaleDateString('en-CA'); // Geeft altijd YYYY-MM-DD
        setCurrentDate(dateString);

        // Gebruik de dateString variabele in de URL
        const res = await fetch(`${API_BASE_URL}/api/assistant/today-assignments?date=${dateString}`, {
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

  useEffect(() => {
    const fetchPeriodicData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/assistant/upcoming-periodic`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch periodic data");
        const data = await res.json();
        setPeriodicData(data);
      } catch (err) {
        console.error("Error loading periodic data:", err);
      }
    };

    fetchPeriodicData();
  }, []);

  const handleToggleTask = async (boxId, taskId) => {
    // Validate boxId before proceeding
    if (!boxId) {
      return;
    }

    // Calculate new value
    const newValue = !tasksState[boxId]?.[taskId];

    // Update local state immediately for responsive UI
    setTasksState(prev => ({
      ...prev,
      [boxId]: { ...prev[boxId], [taskId]: newValue },
    }));

    // Auto-save to database
    try {
      const token = localStorage.getItem("token");
      const requestBody = {
        assignment_id: boxId,
        date: currentDate,
        tasks: { [taskId]: newValue },
      };

      const res = await fetch(`${API_BASE_URL}/api/tasks/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to save");
      }

      // Update box status based on completed tasks
      const currentBox = boxes.find(b => b.id === boxId);
      if (currentBox) {
        const updatedTasksState = { ...tasksState[boxId], [taskId]: newValue };
        const completedCount = Object.values(updatedTasksState || {}).filter(Boolean).length;

        let newStatus = "openstaand";
        if (completedCount >= currentBox.tasksCount) newStatus = "voltooid";
        else if (completedCount > 0) newStatus = "gedeeltelijk";

        setBoxes(prev => prev.map(b => b.id === boxId ? { ...b, status: newStatus, doneCount: completedCount } : b));
      }
    } catch (err) {
      // Revert local state on error
      setTasksState(prev => ({
        ...prev,
        [boxId]: { ...prev[boxId], [taskId]: !newValue },
      }));
    }
  };

  const handleDirectCheck = async (id) => {
    const box = boxes.find(b => b.id === id);
    if (!box) return;

    // Determine new status: if currently completed, uncheck all; otherwise check all
    const shouldComplete = box.status !== "voltooid";
    const token = localStorage.getItem("token");

    try {
      // First, fetch the task types for this box
      const tasksRes = await fetch(
        `${API_BASE_URL}/api/tasks/boxes/${id}/tasks?date=${currentDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const tasksData = await tasksRes.json();

      if (!Array.isArray(tasksData) || tasksData.length === 0) {
        setNotification({ type: 'error', message: t('notifications.noTasksFound') });
        return;
      }

      // Build tasks object with all tasks set to the new value
      const allTasks = {};
      tasksData.forEach(task => {
        const taskId = task.id || task.task_type_id;
        allTasks[taskId] = shouldComplete;
      });

      // Save to backend
      const res = await fetch(`${API_BASE_URL}/api/tasks/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignment_id: id,
          date: currentDate,
          tasks: allTasks,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Kon taken niet opslaan");
      }

      // Update local tasksState
      setTasksState(prev => ({
        ...prev,
        [id]: allTasks,
      }));

      // Refetch boxes to get accurate status from backend
      const refreshRes = await fetch(`${API_BASE_URL}/api/assistant/today-assignments?date=${currentDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (refreshRes.ok) {
        const refreshedData = await refreshRes.json();
        setBoxes(refreshedData);
      }

      setNotification({
        type: 'success',
        message: shouldComplete ? t('notifications.allTasksCompleted') : t('notifications.allTasksReset')
      });
    } catch (err) {
      console.error("Error in handleDirectCheck:", err);
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Initialize tasks state from DB without triggering auto-save
  const handleInitTasks = (boxId, initialState) => {
    setTasksState(prev => ({
      ...prev,
      [boxId]: { ...prev[boxId], ...initialState },
    }));
  };

  const handleSaveTasks = async (boxId, reasonOptionId, reason) => {
    // Validate boxId before proceeding
    if (!boxId) {
      setNotification({ type: 'error', message: t('notifications.missingAssignmentId') });
      return;
    }

    const token = localStorage.getItem("token");
    const requestBody = {
      assignment_id: boxId,
      date: currentDate,
      tasks: tasksState[boxId],
      selected_option_id: reasonOptionId,
      custom_text: reason || null,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Kon taken niet opslaan");
      }

      // Refetch boxes from backend to get accurate status
      const refreshRes = await fetch(`${API_BASE_URL}/api/assistant/today-assignments?date=${currentDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (refreshRes.ok) {
        const refreshedData = await refreshRes.json();
        setBoxes(refreshedData);
      }

      setSelectedBox(null);
      setNotification({ type: 'success', message: t('notifications.tasksSaved') });
    } catch (err) {
      console.error("Error saving tasks:", err);
      setNotification({ type: 'error', message: err.message });
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

      {/* Notification */}
      {notification && (
        <div className={`flex items-center justify-between p-3 rounded-lg ${
          notification.type === 'success'
            ? 'bg-green-100 text-green-800 border border-green-300'
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <Check size={18} /> : <X size={18} />}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="hover:opacity-70">
            <X size={16} />
          </button>
        </div>
      )}

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
          weeklyData={periodicData.weekly}
          monthlyData={periodicData.monthly}
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
          onInitTasks={handleInitTasks}
          onSave={handleSaveTasks}
          onClose={() => setSelectedBox(null)}
        />
      )}
    </PageLayout>
  );
}

export default AssistentDashboard;
