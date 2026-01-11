import React, { useEffect, useState, useRef } from "react";
import { Trash2, Clock, CheckCircle2, X, Check, Edit2 } from "lucide-react";
import DateCalendar from "./DateCalendar";
import TaskEditModal from "./TaskEditModal";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

const TASK_TYPES = {
  ochtend: {
    labelKey: "taskTypes.ochtend",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    defaultStart: "08:00",
    defaultEnd: "12:00",
    useTime: true,
  },
  avond: {
    labelKey: "taskTypes.avond",
    color: "bg-purple-100 text-purple-700 border-purple-300",
    defaultStart: "13:00",
    defaultEnd: "17:00",
    useTime: true,
  },
  wekelijks: {
    labelKey: "taskTypes.wekelijks",
    color: "bg-orange-100 text-orange-700 border-orange-300",
    defaultStart: new Date().toISOString().slice(0, 10),
    defaultEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    useTime: false,
  },
  maandelijks: {
    labelKey: "taskTypes.maandelijks",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    defaultStart: new Date().toISOString().slice(0, 10),
    defaultEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    useTime: false,
  },
};

export default function SchedulingOverlay() {
  const [selectedDates, setSelectedDates] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [notification, setNotification] = useState(null); 
  const notificationTimeoutRef = useRef(null);
  const [editingTaskType, setEditingTaskType] = useState(null);
  const { t } = useTranslation();

  // Step 1: Select task types
  const [selectedTaskTypes, setSelectedTaskTypes] = useState([]);
  // Step 2: Set times for selected task types
  const [taskTypeTimes, setTaskTypeTimes] = useState({});
  // Step 3: Select tandarts and assistant, then assign to boxes
  const [selectedDentist, setSelectedDentist] = useState("");
  const [selectedAssistant, setSelectedAssistant] = useState("");
  const [assignments, setAssignments] = useState([]); 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/scheduling-data");
      const data = await res.json();
      setDentists(data.dentists || []);

      const sortedBoxes = (data.boxes || []).sort((a, b) => {
        const getBoxValue = (name) => {
          const num = name.replace("Box ", "");
          if (!isNaN(num)) return parseInt(num);
          return 1000 + num.charCodeAt(0);
        };
        return getBoxValue(a.name) - getBoxValue(b.name);
      });

      setBoxes(sortedBoxes);
      setAssistants(data.assistants || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const showNotification = (type, key, params = {}, duration = 4000) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    setNotification({ type, key, params });

    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimeoutRef.current = null;
    }, duration);
  };

  const isDentistRequired = () => {
    return selectedTaskTypes.includes("ochtend") || selectedTaskTypes.includes("avond");
  };

  const selectBox = (boxName) => {
    const existingIndex = assignments.findIndex(a => a.box === boxName);

    if (existingIndex >= 0) {
      setAssignments(assignments.filter((_, i) => i !== existingIndex));
    } else {
      if (isDentistRequired() && !selectedDentist) {
        showNotification('error', 'notifications.selectDentist'); 
        return;
      }
      if (!selectedAssistant) {
        showNotification('error', 'notifications.selectAssistant');
        return;
      }
      
      setAssignments([...assignments, {
        dentist: selectedDentist || null,
        assistant: selectedAssistant,
        box: boxName
      }]);
    }
  };

  const removeAssignment = (index) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const isBoxAssigned = (boxName) => {
    return assignments.some(a => a.box === boxName);
  };

  const getBoxDentist = (boxName) => {
    const assignment = assignments.find(a => a.box === boxName);
    return assignment?.dentist || null;
  };

  const toggleTaskType = (taskType) => {
    const isSelected = selectedTaskTypes.includes(taskType);

    if (isSelected) {
      const newTypes = selectedTaskTypes.filter((t) => t !== taskType);
      const { [taskType]: removed, ...rest } = taskTypeTimes;
      setSelectedTaskTypes(newTypes);
      setTaskTypeTimes(rest);
    } else {
      setSelectedTaskTypes([...selectedTaskTypes, taskType]);
      setTaskTypeTimes({
        ...taskTypeTimes,
        [taskType]: {
          start: TASK_TYPES[taskType].defaultStart,
          end: TASK_TYPES[taskType].defaultEnd,
        },
      });
    }
  };

  const updateTaskTypeTime = (taskType, field, value) => {
    setTaskTypeTimes({
      ...taskTypeTimes,
      [taskType]: {
        ...taskTypeTimes[taskType],
        [field]: value,
      },
    });
  };

  const handleConfirm = async () => {
    const shifts = [];
    const timeBasedTypes = selectedTaskTypes.filter(t => TASK_TYPES[t].useTime);
    let startTime = "08:00";
    let endTime = "17:00";

    if (timeBasedTypes.length > 0) {
      const starts = timeBasedTypes.map(t => taskTypeTimes[t]?.start || TASK_TYPES[t].defaultStart);
      const ends = timeBasedTypes.map(t => taskTypeTimes[t]?.end || TASK_TYPES[t].defaultEnd);
      startTime = starts.sort()[0];
      endTime = ends.sort().reverse()[0];
    }

    selectedDates.forEach((date) => {
      assignments.forEach((assignment) => {
        shifts.push({
          date: date,
          dentist: assignment.dentist,
          box: assignment.box,
          assistant: assignment.assistant,
          start: startTime,
          end: endTime,
          groups: selectedTaskTypes,
        });
      });
    });

    try {
      const response = await fetch("http://localhost:5001/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shifts }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create assignments");
      }

      const result = await response.json();

      showNotification(
        'success',
        'notifications.assignmentsCreated',
        { count: result.assignments.length }
      );

      window.dispatchEvent(new Event("calendarUpdated"));

      setSelectedDates([]);
      setSelectedTaskTypes([]);
      setTaskTypeTimes({});
      setSelectedAssistant("");
      setSelectedDentist("");
      setAssignments([]);
    } catch (error) {
      console.error("Error creating assignments:", error);
      showNotification('error', 'notifications.genericError');
    }
  };

  const canConfirm =
    selectedDates.length > 0 &&
    selectedTaskTypes.length > 0 &&
    assignments.length > 0;

  return (
    <div className="max-w-7xl mx-auto bg-white p-4 rounded-lg shadow-lg space-y-3">
      {/* Notification */}
      {notification && (
        <div className={`flex items-center justify-between p-3 rounded-lg ${notification.type === 'success'
          ? 'bg-green-100 text-green-800 border border-green-300'
          : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <Check size={18} /> : <X size={18} />}
            <span className="font-medium">{t(notification.key, notification.params)}</span>
          </div>
          <button onClick={() => setNotification(null)} className="hover:opacity-70">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Step 1: Date & Task Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b">
        <div>
          <label className="font-semibold text-sm block mb-2">{t("schedulingOverlay.selectDate")}</label>
          <DateCalendar selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
        </div>

        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-sm mb-2">{t("schedulingOverlay.selectTaskTypes")}</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TASK_TYPES).map(([key, { labelKey, color }]) => (
                <div key={key} className="relative">
                  <button
                    onClick={() => toggleTaskType(key)}
                    className={`w-full p-2 rounded border-2 text-center transition font-medium text-sm pr-8 ${selectedTaskTypes.includes(key)
                      ? color + " scale-105 shadow-sm"
                      : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                      }`}
                  >
                    {selectedTaskTypes.includes(key) && (
                      <CheckCircle2 className="inline mr-1" size={14} />
                    )}
                    {t(labelKey)}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTaskType(key);
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-[#5C2D5F] hover:bg-gray-100 rounded transition"
                    title={t("schedulingOverlay.editTasks")}
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Time/Date Settings */}
      {selectedTaskTypes.length > 0 && (
        <div className="space-y-2 pb-3 border-b">
          <h3 className="font-semibold text-sm flex items-center gap-1">
            <Clock size={14} />
            {t("schedulingOverlay.setTimeDateForTasks")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {selectedTaskTypes.map((taskType) => (
              <div key={taskType} className={`p-2 rounded border ${TASK_TYPES[taskType].color}`}>
                <div className="font-medium mb-1 text-xs">{t(TASK_TYPES[taskType].labelKey)}</div>
                <div className="flex items-center gap-1 text-xs">
                  <input
                    type={TASK_TYPES[taskType].useTime ? "time" : "date"}
                    value={taskTypeTimes[taskType]?.start || ""}
                    onChange={(e) => updateTaskTypeTime(taskType, "start", e.target.value)}
                    className="border rounded px-1 py-0.5 bg-white w-20 text-xs"
                  />
                  <span>–</span>
                  <input
                    type={TASK_TYPES[taskType].useTime ? "time" : "date"}
                    value={taskTypeTimes[taskType]?.end || ""}
                    onChange={(e) => updateTaskTypeTime(taskType, "end", e.target.value)}
                    className="border rounded px-1 py-0.5 bg-white w-20 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Selection & Boxes */}
      {selectedTaskTypes.length > 0 && (
        <div className="space-y-3 pb-3 border-b">
          <div>
            <label className="text-xs font-medium mb-1 block">{t("schedulingOverlay.selectAssistant")}</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {assistants.map((assistant) => (
                <button
                  key={assistant}
                  onClick={() => setSelectedAssistant(assistant)}
                  className={`p-2 rounded border text-center transition text-sm ${selectedAssistant === assistant
                    ? "bg-[#582F5B] text-white border-[#582F5B]"
                    : "bg-white border-gray-300 text-gray-700 hover:border-[#582F5B]"
                    }`}
                >
                  {assistant}
                </button>
              ))}
            </div>
          </div>

          {isDentistRequired() && (
            <div>
              <label className="text-xs font-medium mb-1 block">{t("schedulingOverlay.selectDentist")}</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {dentists.map((dentist) => (
                  <button
                    key={dentist}
                    onClick={() => setSelectedDentist(dentist)}
                    className={`p-2 rounded border text-center transition text-sm ${selectedDentist === dentist
                      ? "bg-[#582F5B] text-white border-[#582F5B]"
                      : "bg-white border-gray-300 text-gray-700 hover:border-[#582F5B]"
                      }`}
                  >
                    {dentist.replace("Dr. ", "")}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium mb-1 block">
              {isDentistRequired() ? "2. " : ""}{t("schedulingOverlay.selectBoxes")}
            </label>
            <div className="grid grid-cols-7 md:grid-cols-14 gap-1">
              {boxes.map((box) => {
                const assigned = isBoxAssigned(box.name);
                const boxDentist = getBoxDentist(box.name);
                return (
                  <button
                    key={box.box_id}
                    onClick={() => selectBox(box.name)}
                    title={assigned && boxDentist ? `${boxDentist}` : ""}
                    className={`p-1.5 rounded border text-center transition text-xs font-medium ${assigned
                      ? "bg-[#582F5B] text-white border-[#582F5B]"
                      : "bg-white border-gray-300 text-gray-700 hover:border-[#582F5B]"
                      }`}
                  >
                    {box.name.replace("Box ", "")}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">{t("schedulingOverlay.clickBoxToAssign")}</p>
          </div>

          {assignments.length > 0 && (
            <div className="space-y-2 mt-3">
              <label className="text-xs font-medium text-gray-500">{t("schedulingOverlay.addedAssignments")} ({assignments.length}):</label>
              <div className="flex flex-wrap gap-2">
                {assignments.map((assignment, index) => (
                  <div key={index} className="flex items-center gap-2 px-2 py-1 bg-gray-100 border rounded text-sm">
                    <span>
                      <span className="font-medium">{assignment.box}</span>
                      <span className="mx-1">{assignment.assistant}</span>
                      {assignment.dentist && <span>→{assignment.dentist.replace("Dr. ", "")}</span>}
                    </span>
                    <button onClick={() => removeAssignment(index)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirm Button */}
      <div className="flex justify-between items-center pt-3 border-t">
        <div className="text-xs text-gray-600">
          {assignments.length > 0 && selectedDates.length > 0 ? (
            <>
              <strong>{selectedDates.length * assignments.length}</strong> {t("schedulingOverlay.shifts")}
              {selectedDates.length * assignments.length !== 1 ? "s" : ""}
              <span className="ml-1">
                ({selectedDates.length} {t("schedulingOverlay.dates")} × {assignments.length} {t("schedulingOverlay.assignments")})
              </span>
            </>
          ) : (
            <span className="text-red-500">
              {selectedDates.length === 0 && t("schedulingOverlay.selectDate")}
              {selectedTaskTypes.length === 0 && ` ${t("schedulingOverlay.selectTaskTypes")}`}
              {assignments.length === 0 && selectedTaskTypes.length > 0 && ` ${t("schedulingOverlay.selectAssistantAndBox")}`}
            </span>
          )}
        </div>
        <button
          disabled={!canConfirm}
          onClick={handleConfirm}
          className={`px-6 py-2 rounded font-semibold text-sm transition ${canConfirm
            ? "bg-[#582F5B] text-white hover:bg-[#4a254c]"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
        >
          {t("schedulingOverlay.confirmAssignments")}
        </button>
      </div>

      {/* Task Edit Modal */}
      {editingTaskType && (
        <TaskEditModal
          category={editingTaskType}
          onClose={(saved) => {
            setEditingTaskType(null);
            if (saved) {
              showNotification('success', 'schedulingOverlay.tasksSaved');
            }
          }}
        />
      )}
    </div>
  );
}