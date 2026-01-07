import React, { useEffect, useState } from "react";
import { Plus, Trash2, Clock, CheckCircle2 } from "lucide-react";
import DateCalendar from "./DateCalendar";

const TASK_TYPES = {
  ochtend: {
    label: "Ochtend",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    defaultStart: "08:00",
    defaultEnd: "12:00",
    useTime: true,
  },
  avond: {
    label: "Avond",
    color: "bg-purple-100 text-purple-700 border-purple-300",
    defaultStart: "13:00",
    defaultEnd: "17:00",
    useTime: true,
  },
  wekelijks: {
    label: "Wekelijks",
    color: "bg-orange-100 text-orange-700 border-orange-300",
    defaultStart: new Date().toISOString().slice(0, 10),
    defaultEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    useTime: false,
  },
  maandelijks: {
    label: "Maandelijks",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    defaultStart: new Date().toISOString().slice(0, 10),
    defaultEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    useTime: false,
  },
};

export default function TaskTypeSchedulingOverlay() {
  const [selectedDates, setSelectedDates] = useState([new Date().toISOString().slice(0, 10)]);
  const [dentists, setDentists] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [assistants, setAssistants] = useState([]);

  // Step 1: Select task types
  const [selectedTaskTypes, setSelectedTaskTypes] = useState([]);

  // Step 2: Set times for selected task types
  const [taskTypeTimes, setTaskTypeTimes] = useState({});

  // Step 3: Assign boxes -> dentist -> assistant
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/scheduling-data");
      const data = await res.json();
      setDentists(data.dentists || []);

      // Sort boxes: 1-11 (numbers), then A, B, C (letters)
      const sortedBoxes = (data.boxes || []).sort((a, b) => {
        const getBoxValue = (name) => {
          const num = name.replace("Box ", "");
          // If it's a number, return it as number for sorting
          if (!isNaN(num)) return parseInt(num);
          // If it's a letter, return a high number + charCode for sorting after numbers
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

  const toggleTaskType = (taskType) => {
    const isSelected = selectedTaskTypes.includes(taskType);

    if (isSelected) {
      // Deselect this task type
      const newTypes = selectedTaskTypes.filter((t) => t !== taskType);
      const { [taskType]: removed, ...rest } = taskTypeTimes;
      setSelectedTaskTypes(newTypes);
      setTaskTypeTimes(rest);
    } else {
      // Add this task type
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

  const addAssignment = () => {
    if (selectedTaskTypes.length === 0) {
      alert("Selecteer eerst minimaal één taak type");
      return;
    }

    const newAssignment = {
      id: Date.now(),
      box: "",
      dentist: "",
      assistant: "",
    };
    setAssignments([...assignments, newAssignment]);
  };

  const updateAssignment = (id, field, value) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const deleteAssignment = (id) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const isDentistRequired = () => {
    // Dentist is only required if Ochtend or Avond is selected
    return selectedTaskTypes.includes("ochtend") || selectedTaskTypes.includes("avond");
  };

  const isAssignmentValid = (assignment) => {
    const dentistRequired = isDentistRequired();

    return (
      assignment.box &&
      assignment.assistant &&
      (!dentistRequired || assignment.dentist) // Dentist only required for Ochtend/Avond
    );
  };

  const canConfirm =
    selectedTaskTypes.length > 0 &&
    assignments.length > 0 &&
    assignments.every(isAssignmentValid);


  const handleConfirm = async () => {
    // Prepare data for backend
    const shifts = [];

    selectedDates.forEach((date) => {
      assignments.forEach((assignment) => {
        // Create ONE shift per assignment with ALL selected task types
        shifts.push({
          date: date,
          dentist: assignment.dentist || null,
          box: assignment.box,
          assistant: assignment.assistant,
          start: selectedTaskTypes[0] ? taskTypeTimes[selectedTaskTypes[0]].start : "08:00",
          end: selectedTaskTypes[0] ? taskTypeTimes[selectedTaskTypes[0]].end : "17:00",
          groups: selectedTaskTypes, // All selected task types
        });
      });
    });

    console.log("CONFIRMED SCHEDULE:", {
      selectedDates,
      selectedTaskTypes,
      taskTypeTimes,
      shifts,
      totalShifts: shifts.length,
    });

    try {
      const response = await fetch("http://localhost:5001/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shifts }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create assignments");
      }

      const result = await response.json();

      alert(
        `✅ Successfully created ${result.assignments.length} assignment(s)!\n\n` +
        `The assignments will now appear in the agenda.`
      );

      // Dispatch custom event to trigger calendar refresh
      window.dispatchEvent(new Event("calendarUpdated"));

      // Reset form
      setSelectedDates([new Date().toISOString().slice(0, 10)]);
      setSelectedTaskTypes([]);
      setTaskTypeTimes({});
      setAssignments([]);
    } catch (error) {
      console.error("Error creating assignments:", error);
      alert(`❌ Error: ${error.message}\n\nPlease check the console for more details.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto bg-white p-4 rounded-lg shadow-lg space-y-3">
      {/* Step 1: Date & Task Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b">
        {/* Calendar */}
        <div>
          <label className="font-semibold text-sm block mb-2">Selecteer Datums:</label>
          <DateCalendar selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
        </div>

        {/* Task Types */}
        <div className="space-y-2">

          <div>
            <h3 className="font-semibold text-sm mb-2">Selecteer Taak Types:</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TASK_TYPES).map(([key, { label, color }]) => (
                <button
                  key={key}
                  onClick={() => toggleTaskType(key)}
                  className={`p-2 rounded border-2 text-center transition font-medium text-sm ${
                    selectedTaskTypes.includes(key)
                      ? color + " scale-105 shadow-sm"
                      : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {selectedTaskTypes.includes(key) && (
                    <CheckCircle2 className="inline mr-1" size={14} />
                  )}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Time/Date Settings for Selected Task Types */}
      {selectedTaskTypes.length > 0 && (
        <div className="space-y-2 pb-3 border-b">
          <h3 className="font-semibold text-sm flex items-center gap-1">
            <Clock size={14} />
            Tijden/Periodes:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {selectedTaskTypes.map((taskType) => (
              <div
                key={taskType}
                className={`p-2 rounded border ${TASK_TYPES[taskType].color}`}
              >
                <div className="font-medium mb-1 text-xs">{TASK_TYPES[taskType].label}</div>
                <div className="flex items-center gap-1 text-xs">
                  <input
                    type={TASK_TYPES[taskType].useTime ? "time" : "date"}
                    value={taskTypeTimes[taskType]?.start || ""}
                    onChange={(e) =>
                      updateTaskTypeTime(taskType, "start", e.target.value)
                    }
                    className="border rounded px-1 py-0.5 bg-white w-20 text-xs"
                  />
                  <span>–</span>
                  <input
                    type={TASK_TYPES[taskType].useTime ? "time" : "date"}
                    value={taskTypeTimes[taskType]?.end || ""}
                    onChange={(e) =>
                      updateTaskTypeTime(taskType, "end", e.target.value)
                    }
                    className="border rounded px-1 py-0.5 bg-white w-20 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Assign Boxes -> Dentist -> Assistant */}
      {selectedTaskTypes.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">
              Toewijzingen:
              <span className="ml-2 text-xs text-gray-500 font-normal">
                ({assignments.length})
              </span>
            </h3>
          </div>

          {assignments.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-xs border border-dashed rounded">
              Klik hieronder op "Voeg toe"
            </div>
          ) : (
            <div className="space-y-2">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className={`border rounded p-3 transition ${
                    !isAssignmentValid(assignment)
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-[#582F5B]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1 text-xs">
                      {selectedTaskTypes.map((taskType) => (
                        <span
                          key={taskType}
                          className={`px-1.5 py-0.5 rounded text-xs ${TASK_TYPES[taskType].color}`}
                        >
                          {TASK_TYPES[taskType].label.charAt(0)}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => deleteAssignment(assignment.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Verwijder"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Box Selection - Buttons */}
                    <div>
                      <label className="text-xs font-medium mb-1 block">Box *</label>
                      <div className="grid grid-cols-7 md:grid-cols-14 gap-1">
                        {boxes.map((box) => (
                          <button
                            key={box.box_id}
                            onClick={() => updateAssignment(assignment.id, "box", box.name)}
                            className={`p-1.5 rounded border text-center transition text-xs font-medium ${
                              assignment.box === box.name
                                ? "bg-[#582F5B] text-white border-[#582F5B]"
                                : "bg-white border-gray-300 text-gray-700 hover:border-[#582F5B]"
                            }`}
                          >
                            {box.name.replace("Box ", "")}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dentist Selection - Buttons (only show if Ochtend or Avond selected) */}
                    {isDentistRequired() && (
                      <div>
                        <label className="text-xs font-medium mb-1 block">Tandarts *</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                          {dentists.map((dentist) => (
                            <button
                              key={dentist}
                              onClick={() => updateAssignment(assignment.id, "dentist", dentist)}
                              className={`p-1.5 rounded border text-center transition text-xs ${
                                assignment.dentist === dentist
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

                    {/* Assistant Selection - Buttons */}
                    <div>
                      <label className="text-xs font-medium mb-1 block">Assistent *</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                        {assistants.map((assistant) => (
                          <button
                            key={assistant}
                            onClick={() => updateAssignment(assignment.id, "assistant", assistant)}
                            className={`p-1.5 rounded border text-center transition text-xs ${
                              assignment.assistant === assistant
                                ? "bg-[#582F5B] text-white border-[#582F5B]"
                                : "bg-white border-gray-300 text-gray-700 hover:border-[#582F5B]"
                            }`}
                          >
                            {assistant}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Assignment Button at Bottom */}
          <div className="flex justify-center pt-2">
            <button
              onClick={addAssignment}
              className="bg-[#582F5B] text-white px-4 py-2 rounded flex items-center gap-1 hover:bg-[#4a254c] text-sm font-medium"
            >
              <Plus size={16} /> Voeg toe
            </button>
          </div>
        </div>
      )}

      {/* Confirm Button */}
      <div className="flex justify-between items-center pt-3 border-t">
        <div className="text-xs text-gray-600">
          {assignments.length > 0 && selectedTaskTypes.length > 0 && (
            <>
              <strong>{selectedDates.length * assignments.length * selectedTaskTypes.length}</strong> shift
              {selectedDates.length * assignments.length * selectedTaskTypes.length !== 1 ? "s" : ""}
              <span className="ml-1">
                ({selectedDates.length} datum{selectedDates.length !== 1 ? "s" : ""} × {assignments.length} × {selectedTaskTypes.length})
              </span>
            </>
          )}
        </div>
        <button
          disabled={!canConfirm}
          onClick={handleConfirm}
          className={`px-6 py-2 rounded font-semibold text-sm transition ${
            canConfirm
              ? "bg-[#582F5B] text-white hover:bg-[#4a254c]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Bevestigen
        </button>
      </div>

      {/* Helper Text */}
      {selectedTaskTypes.length === 0 && (
        <div className="text-center text-gray-500 text-xs py-3">
          👆 Selecteer eerst taak types
        </div>
      )}
    </div>
  );
}
