import React, { useEffect, useState } from "react";
import { Copy, Plus, Trash2, Save, Calendar, CheckSquare } from "lucide-react";

const TASK_GROUPS = {
  ochtend: { label: "Ochtend", color: "bg-blue-100 text-blue-700" },
  avond: { label: "Avond", color: "bg-purple-100 text-purple-700" },
  wekelijks: { label: "Wekelijks", color: "bg-orange-100 text-orange-700" },
  maandelijks: { label: "Maandelijks", color: "bg-yellow-100 text-yellow-700" },
};

export default function ImprovedSchedulingOverlay() {
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [copyFromDate, setCopyFromDate] = useState("");
  const [dentists, setDentists] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [bulkSettings, setBulkSettings] = useState({
    startTime: "08:00",
    endTime: "17:00",
    taskGroups: [],
  });

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/scheduling-data");
      const data = await res.json();
      setDentists(data.dentists || []);
      setBoxes(data.boxes || []);
      setAssistants(data.assistants || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const copyFromPreviousDay = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().slice(0, 10);
    await loadAssignmentsFromDate(dateStr);
  };

  const loadAssignmentsFromDate = async (date) => {
    try {
      // TODO: Replace with actual API call once backend is ready
      // const res = await fetch(`http://localhost:5001/api/shift-assignments/by-date?date=${date}`);
      // const data = await res.json();

      // For now, create empty assignments for each box as placeholder
      const newAssignments = boxes.map((box, idx) => ({
        id: Date.now() + idx,
        box: box.name,
        dentist: dentists[0] || "",
        assistant: assistants[0] || "",
        startTime: "08:00",
        endTime: "17:00",
        taskGroups: ["ochtend", "avond"],
        isValid: true,
      }));

      setAssignments(newAssignments);
      alert(`Loaded schedule from ${date}`);
    } catch (error) {
      console.error("Failed to load assignments:", error);
      alert("Failed to load assignments from selected date");
    }
  };

  const addNewRow = () => {
    const newAssignment = {
      id: Date.now(),
      box: "",
      dentist: "",
      assistant: "",
      startTime: "08:00",
      endTime: "17:00",
      taskGroups: [],
      isValid: false,
    };
    setAssignments([...assignments, newAssignment]);
  };

  const updateAssignment = (id, field, value) => {
    setAssignments((prev) =>
      prev.map((assignment) => {
        if (assignment.id !== id) return assignment;

        const updated = { ...assignment, [field]: value };
        updated.isValid = validateAssignment(updated);
        return updated;
      })
    );
  };

  const validateAssignment = (assignment) => {
    return (
      assignment.box &&
      assignment.dentist &&
      assignment.assistant &&
      assignment.startTime &&
      assignment.endTime &&
      assignment.startTime < assignment.endTime &&
      assignment.taskGroups.length > 0
    );
  };

  const deleteAssignment = (id) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === assignments.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(assignments.map((a) => a.id)));
    }
  };

  const applyBulkSettings = () => {
    if (selectedRows.size === 0) {
      alert("Please select at least one row to apply bulk settings");
      return;
    }

    setAssignments((prev) =>
      prev.map((assignment) => {
        if (!selectedRows.has(assignment.id)) return assignment;

        const updated = { ...assignment };
        if (bulkSettings.startTime) updated.startTime = bulkSettings.startTime;
        if (bulkSettings.endTime) updated.endTime = bulkSettings.endTime;
        if (bulkSettings.taskGroups.length > 0) {
          updated.taskGroups = bulkSettings.taskGroups;
        }
        updated.isValid = validateAssignment(updated);
        return updated;
      })
    );

    alert(`Applied bulk settings to ${selectedRows.size} assignment(s)`);
  };

  const toggleTaskGroup = (id, group) => {
    setAssignments((prev) =>
      prev.map((assignment) => {
        if (assignment.id !== id) return assignment;

        const hasGroup = assignment.taskGroups.includes(group);
        const taskGroups = hasGroup
          ? assignment.taskGroups.filter((g) => g !== group)
          : [...assignment.taskGroups, group];

        const updated = { ...assignment, taskGroups };
        updated.isValid = validateAssignment(updated);
        return updated;
      })
    );
  };

  const toggleBulkTaskGroup = (group) => {
    setBulkSettings((prev) => {
      const hasGroup = prev.taskGroups.includes(group);
      const taskGroups = hasGroup
        ? prev.taskGroups.filter((g) => g !== group)
        : [...prev.taskGroups, group];
      return { ...prev, taskGroups };
    });
  };

  const saveAllAssignments = async () => {
    const invalidCount = assignments.filter((a) => !a.isValid).length;

    if (invalidCount > 0) {
      alert(`Please fix ${invalidCount} invalid assignment(s) before saving`);
      return;
    }

    if (assignments.length === 0) {
      alert("No assignments to save");
      return;
    }

    try {
      // TODO: Replace with actual API call once backend is ready
      const payload = {
        date: currentDate,
        shifts: assignments.map((a) => ({
          dentist: a.dentist,
          box: a.box,
          assistant: a.assistant,
          start: a.startTime,
          end: a.endTime,
          groups: a.taskGroups,
        })),
      };

      console.log("Saving assignments:", payload);

      // const res = await fetch("http://localhost:5001/api/shift-assignments", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });

      // if (!res.ok) throw new Error("Failed to save");

      alert(`Successfully saved ${assignments.length} assignment(s) for ${currentDate}`);

      // Optionally clear assignments after save
      // setAssignments([]);
      // setSelectedRows(new Set());
    } catch (error) {
      console.error("Failed to save assignments:", error);
      alert("Failed to save assignments. Please try again.");
    }
  };

  const canSave = assignments.length > 0 && assignments.every((a) => a.isValid);

  return (
    <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg space-y-6">
      {/* Header Section */}
      <div className="flex flex-wrap gap-4 items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <label className="font-semibold">Datum:</label>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyFromPreviousDay}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600"
          >
            <Copy size={16} /> Kopieer vorige dag
          </button>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={copyFromDate}
              onChange={(e) => setCopyFromDate(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="Selecteer datum"
            />
            <button
              onClick={() => copyFromDate && loadAssignmentsFromDate(copyFromDate)}
              disabled={!copyFromDate}
              className="bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-600 disabled:bg-gray-300"
            >
              <Calendar size={16} /> Laden
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Section */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <CheckSquare size={18} />
          Bulk acties (geselecteerde rijen: {selectedRows.size})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-sm font-medium mb-1 block">Start tijd</label>
            <input
              type="time"
              value={bulkSettings.startTime}
              onChange={(e) =>
                setBulkSettings({ ...bulkSettings, startTime: e.target.value })
              }
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Eind tijd</label>
            <input
              type="time"
              value={bulkSettings.endTime}
              onChange={(e) =>
                setBulkSettings({ ...bulkSettings, endTime: e.target.value })
              }
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="text-sm font-medium mb-1 block">Taken groepen</label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(TASK_GROUPS).map(([key, { label, color }]) => (
                <button
                  key={key}
                  onClick={() => toggleBulkTaskGroup(key)}
                  className={`px-3 py-1 rounded text-sm font-medium border transition ${
                    bulkSettings.taskGroups.includes(key)
                      ? color
                      : "bg-white text-gray-600 border-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={applyBulkSettings}
            disabled={selectedRows.size === 0}
            className="bg-[#582F5B] text-white px-4 py-2 rounded hover:bg-[#4a254c] disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Toepassen
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={assignments.length > 0 && selectedRows.size === assignments.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4"
                />
              </th>
              <th className="p-3 text-left font-semibold">Box</th>
              <th className="p-3 text-left font-semibold">Tandarts</th>
              <th className="p-3 text-left font-semibold">Assistent</th>
              <th className="p-3 text-left font-semibold">Start</th>
              <th className="p-3 text-left font-semibold">Eind</th>
              <th className="p-3 text-left font-semibold">Taken</th>
              <th className="p-3 text-center font-semibold">Acties</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  Geen opdrachten. Klik op "Nieuwe rij" of "Kopieer vorige dag" om te beginnen.
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr
                  key={assignment.id}
                  className={`border-t transition ${
                    !assignment.isValid ? "bg-red-50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(assignment.id)}
                      onChange={() => toggleRowSelection(assignment.id)}
                      className="w-4 h-4"
                    />
                  </td>

                  <td className="p-3">
                    <select
                      value={assignment.box}
                      onChange={(e) =>
                        updateAssignment(assignment.id, "box", e.target.value)
                      }
                      className={`border rounded px-2 py-1 w-full ${
                        !assignment.box ? "border-red-400" : ""
                      }`}
                    >
                      <option value="">Selecteer...</option>
                      {boxes.map((box) => (
                        <option key={box.id} value={box.name}>
                          {box.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3">
                    <select
                      value={assignment.dentist}
                      onChange={(e) =>
                        updateAssignment(assignment.id, "dentist", e.target.value)
                      }
                      className={`border rounded px-2 py-1 w-full ${
                        !assignment.dentist ? "border-red-400" : ""
                      }`}
                    >
                      <option value="">Selecteer...</option>
                      {dentists.map((dentist) => (
                        <option key={dentist} value={dentist}>
                          {dentist}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3">
                    <select
                      value={assignment.assistant}
                      onChange={(e) =>
                        updateAssignment(assignment.id, "assistant", e.target.value)
                      }
                      className={`border rounded px-2 py-1 w-full ${
                        !assignment.assistant ? "border-red-400" : ""
                      }`}
                    >
                      <option value="">Selecteer...</option>
                      {assistants.map((assistant) => (
                        <option key={assistant} value={assistant}>
                          {assistant}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3">
                    <input
                      type="time"
                      value={assignment.startTime}
                      onChange={(e) =>
                        updateAssignment(assignment.id, "startTime", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>

                  <td className="p-3">
                    <input
                      type="time"
                      value={assignment.endTime}
                      onChange={(e) =>
                        updateAssignment(assignment.id, "endTime", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>

                  <td className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(TASK_GROUPS).map(([key, { label, color }]) => (
                        <button
                          key={key}
                          onClick={() => toggleTaskGroup(assignment.id, key)}
                          className={`px-2 py-1 rounded text-xs font-medium border transition ${
                            assignment.taskGroups.includes(key)
                              ? color
                              : "bg-white text-gray-500 border-gray-300"
                          }`}
                          title={label}
                        >
                          {label.charAt(0)}
                        </button>
                      ))}
                    </div>
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => deleteAssignment(assignment.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Verwijderen"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <button
          onClick={addNewRow}
          className="bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-600"
        >
          <Plus size={16} /> Nieuwe rij
        </button>

        <div className="flex gap-3 items-center">
          <span className="text-sm text-gray-600">
            {assignments.length} opdracht(en) | {assignments.filter((a) => !a.isValid).length} ongeldig
          </span>
          <button
            onClick={saveAllAssignments}
            disabled={!canSave}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
              canSave
                ? "bg-[#582F5B] text-white hover:bg-[#4a254c]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Save size={18} /> Alles opslaan
          </button>
        </div>
      </div>
    </div>
  );
}
