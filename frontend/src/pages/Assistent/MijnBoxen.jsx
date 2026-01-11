import React, { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import AssistentNavBar from "../../components/navbar/AssistentNavBar";
import BoxList from "../../components/Assistent/BoxList";
import TaskModal from "../../components/Assistent/TaskModal";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";
import { Check, X } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function MijnBoxen() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBox, setSelectedBox] = useState(null);
  const [tasksState, setTasksState] = useState({});
  const [currentDate, setCurrentDate] = useState("");
  const [notification, setNotification] = useState(null);
  const { t } = useTranslation();
  useLanguage();

  // Auto-hide notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
      setCurrentDate(dateString); // Store the date for later use

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

  // Initialize tasks state from DB without triggering auto-save
  const handleInitTasks = (boxId, initialState) => {
    setTasksState(prev => ({
      ...prev,
      [boxId]: { ...prev[boxId], ...initialState },
    }));
  };

  const handleSaveTasks = async (boxId, selectedOptionId, customText) => {
    if (!boxId) {
      setNotification({ type: 'error', message: t('notifications.missingAssignmentId') });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Send assignment_id and date (not session_id)
      const payload = {
        assignment_id: boxId,
        date: currentDate,
        tasks: tasksState[boxId] || {},
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
      await fetchBoxes(); // Ververs de lijst voor de nieuwe percentages/status
      setNotification({ type: 'success', message: t('notifications.tasksSaved') });
    } catch (err) {
      console.error("Error saving tasks:", err);
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Quick check/uncheck all tasks for a box
  const handleBoxCheck = async (id) => {
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

      // Refetch boxes to get accurate status
      await fetchBoxes();

      setNotification({
        type: 'success',
        message: shouldComplete ? t('notifications.allTasksCompleted') : t('notifications.allTasksReset')
      });
    } catch (err) {
      console.error("Error in handleBoxCheck:", err);
      setNotification({ type: 'error', message: err.message });
    }
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
          onInitTasks={handleInitTasks}
          onSave={handleSaveTasks}
          onClose={() => setSelectedBox(null)}
        />
      )}
    </PageLayout>
  );
}

export default MijnBoxen;