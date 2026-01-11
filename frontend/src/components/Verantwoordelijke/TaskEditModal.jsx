import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const CATEGORY_COLORS = {
  morning: "bg-blue-100 text-blue-700 border-blue-300",
  evening: "bg-purple-100 text-purple-700 border-purple-300",
  weekly: "bg-orange-100 text-orange-700 border-orange-300",
  monthly: "bg-yellow-100 text-yellow-700 border-yellow-300",
};

const CATEGORY_LABELS = {
  morning: "taskTypes.ochtend",
  evening: "taskTypes.avond",
  weekly: "taskTypes.wekelijks",
  monthly: "taskTypes.maandelijks",
};

export default function TaskEditModal({ category, onClose }) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Map frontend category names to backend category names
  const categoryMap = {
    ochtend: "morning",
    avond: "evening",
    wekelijks: "weekly",
    maandelijks: "monthly",
  };

  const backendCategory = categoryMap[category] || category;

  useEffect(() => {
    fetchTasks();
  }, [category]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/task-types/${backendCategory}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch tasks");

      const data = await res.json();
      // Convert description string to lines array for editing
      const tasksWithLines = data.map(task => ({
        ...task,
        lines: task.description ? task.description.split('\n').filter(line => line.trim()) : [''],
      }));
      setTasks(tasksWithLines);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      {
        id: null,
        name: "",
        lines: [""],
        isNew: true,
      },
    ]);
  };

  const handleUpdateTaskName = (taskIndex, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], name: value, isDirty: true };
    setTasks(updatedTasks);
  };

  const handleUpdateLine = (taskIndex, lineIndex, value) => {
    const updatedTasks = [...tasks];
    const newLines = [...updatedTasks[taskIndex].lines];
    newLines[lineIndex] = value;
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], lines: newLines, isDirty: true };
    setTasks(updatedTasks);
  };

  const handleAddLine = (taskIndex) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      lines: [...updatedTasks[taskIndex].lines, ""],
      isDirty: true,
    };
    setTasks(updatedTasks);
  };

  const handleRemoveLine = (taskIndex, lineIndex) => {
    const updatedTasks = [...tasks];
    const newLines = updatedTasks[taskIndex].lines.filter((_, i) => i !== lineIndex);
    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      lines: newLines.length > 0 ? newLines : [""],
      isDirty: true,
    };
    setTasks(updatedTasks);
  };

  const handleDeleteTask = async (index) => {
    const task = tasks[index];

    if (task.id) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/task-types/${task.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to delete task");
      } catch (err) {
        console.error("Error deleting task:", err);
        setError(err.message);
        return;
      }
    }

    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      for (const task of tasks) {
        if (!task.name.trim()) continue;

        // Convert lines array back to description string
        const description = task.lines.filter(line => line.trim()).join('\n');

        if (task.isNew) {
          await fetch(`${API_BASE_URL}/api/task-types`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: task.name,
              description: description,
              category: backendCategory,
              isRequired: true,
            }),
          });
        } else if (task.isDirty) {
          await fetch(`${API_BASE_URL}/api/task-types/${task.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: task.name,
              description: description,
              isRequired: true,
            }),
          });
        }
      }

      onClose(true);
    } catch (err) {
      console.error("Error saving tasks:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const colorClass = CATEGORY_COLORS[backendCategory] || "bg-gray-100 text-gray-700";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${colorClass}`}>
          <h2 className="text-xl font-bold">
            {t("taskEditModal.editTasks")} - {t(CATEGORY_LABELS[backendCategory])}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="p-1 hover:bg-black/10 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              {t("taskEditModal.loading")}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="space-y-6">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t("taskEditModal.noTasks")}
                </div>
              ) : (
                tasks.map((task, taskIndex) => (
                  <div
                    key={task.id || `new-${taskIndex}`}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    {/* Task Header with Number and Title */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-[#5C2D5F] text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {taskIndex + 1}
                      </div>
                      <input
                        type="text"
                        value={task.name}
                        onChange={(e) => handleUpdateTaskName(taskIndex, e.target.value)}
                        placeholder={t("taskEditModal.taskName")}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C2D5F] font-semibold"
                      />
                      <button
                        onClick={() => handleDeleteTask(taskIndex)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition"
                        title={t("taskEditModal.deleteTask")}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Instruction Lines */}
                    <div className="ml-11 space-y-2">
                      <label className="text-sm font-medium text-gray-600">
                        {t("taskEditModal.instructions")}:
                      </label>
                      {task.lines.map((line, lineIndex) => (
                        <div key={lineIndex} className="flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          <input
                            type="text"
                            value={line}
                            onChange={(e) => handleUpdateLine(taskIndex, lineIndex, e.target.value)}
                            placeholder={t("taskEditModal.instructionPlaceholder")}
                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C2D5F] text-sm"
                          />
                          {task.lines.length > 1 && (
                            <button
                              onClick={() => handleRemoveLine(taskIndex, lineIndex)}
                              className="p-1 text-gray-400 hover:text-red-500 transition"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddLine(taskIndex)}
                        className="text-sm text-[#5C2D5F] hover:underline flex items-center gap-1 mt-2"
                      >
                        <Plus size={14} />
                        {t("taskEditModal.addInstruction")}
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Add Task Button */}
              <button
                onClick={handleAddTask}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#5C2D5F] hover:text-[#5C2D5F] transition flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                {t("taskEditModal.addTask")}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={() => onClose(false)}
            className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 transition"
          >
            {t("taskEditModal.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#5C2D5F] text-white rounded-lg hover:bg-[#4A2144] transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? t("taskEditModal.saving") : t("taskEditModal.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
