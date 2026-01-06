import React, { useEffect, useState } from "react";
import { Plus, Trash2, Clock } from "lucide-react";

const TASK_GROUPS = {
  ochtend: {
    label: "Ochtend",
    tasks: [
      "Filters",
      "Waterleidingen – Lange spoeling",
    ],
  },
  avond: {
    label: "Avond",
    tasks: [
      "Oppervlakken",
      "Afzuigsysteem – Reiniging van de afzuigslangen",
      "Speekselopvangbak (Crachot)",
    ],
  },
  wekelijks: {
    label: "Wekelijks",
    tasks: ["MD555 cleaner – Wekelijkse reiniging"],
  },
  maandelijks: {
    label: "Maandelijks",
    tasks: [
      "Afzuigsysteem en waterleidingen",
      "Filters extensief",
    ],
  },
};

export default function SchedulingOverlay() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dentists, setDentists] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    const slots = [];
    for (let h = 8; h <= 18; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
      if (h !== 18) slots.push(`${String(h).padStart(2, "0")}:30`);
    }
    setTimeSlots(slots);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:5001/api/scheduling-data");
        const data = await res.json();
        setDentists(data.dentists);
        setBoxes(data.boxes);
        setAssistants(data.assistants);
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, []);

  const addShift = () => {
    setShifts((prev) => [
      ...prev,
      {
        id: Date.now(),
        dentist: "",
        box: "",
        assistant: "",
        start: "08:00",
        end: "17:00",
        selectedGroups: [],
        selectedTasks: [],
      },
    ]);
  };

  const updateShift = (id, field, value) => {
    setShifts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const removeShift = (id) => {
    setShifts((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleGroup = (shiftId, groupKey) => {
    setShifts((prev) =>
      prev.map((s) => {
        if (s.id !== shiftId) return s;

        const isActive = s.selectedGroups.includes(groupKey);
        let newGroups;
        let newTasks = [...s.selectedTasks];

        if (isActive) {
          newGroups = s.selectedGroups.filter((g) => g !== groupKey);
          newTasks = newTasks.filter(
            (t) => !TASK_GROUPS[groupKey].tasks.includes(t)
          );
        } else {
          newGroups = [...s.selectedGroups, groupKey];
          TASK_GROUPS[groupKey].tasks.forEach((t) => {
            if (!newTasks.includes(t)) newTasks.push(t);
          });
        }

        return {
          ...s,
          selectedGroups: newGroups,
          selectedTasks: newTasks,
        };
      })
    );
  };

  const toggleTask = (shiftId, task) => {
    setShifts((prev) =>
      prev.map((s) =>
        s.id === shiftId
          ? {
              ...s,
              selectedTasks: s.selectedTasks.includes(task)
                ? s.selectedTasks.filter((t) => t !== task)
                : [...s.selectedTasks, task],
            }
          : s
      )
    );
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="font-semibold">Datum</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>

        <button
          onClick={addShift}
          className="bg-[#582F5B] text-white px-4 py-2 rounded flex items-center gap-2 hover:opacity-90"
        >
          <Plus size={16} /> Add shift
        </button>
      </div>

      {shifts.map((shift) => (
        <div
          key={shift.id}
          className="border rounded-lg p-4 space-y-4 bg-[#F9F6F9]"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-[#582F5B]">Shift</h3>
            <button onClick={() => removeShift(shift.id)}>
              <Trash2 className="text-red-500" size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              list="dentists"
              placeholder="Tandarts"
              value={shift.dentist}
              onChange={(e) =>
                updateShift(shift.id, "dentist", e.target.value)
              }
              className={`p-2 border rounded ${
                shift.dentist && "bg-[#582F5B] text-white"
              }`}
            />
            <datalist id="dentists">
              {dentists.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>

            <input
              list="boxes"
              placeholder="Box"
              value={shift.box}
              onChange={(e) => updateShift(shift.id, "box", e.target.value)}
              className={`p-2 border rounded ${
                shift.box && "bg-[#582F5B] text-white"
              }`}
            />
            <datalist id="boxes">
              {boxes.map((b) => (
                <option key={b.id} value={b.name} />
              ))}
            </datalist>

            <input
              list="assistants"
              placeholder="Assistent"
              value={shift.assistant}
              onChange={(e) =>
                updateShift(shift.id, "assistant", e.target.value)
              }
              className={`p-2 border rounded ${
                shift.assistant && "bg-[#582F5B] text-white"
              }`}
            />
            <datalist id="assistants">
              {assistants.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </div>

          <div className="flex items-center gap-3">
            <Clock size={16} />
            <select
              value={shift.start}
              onChange={(e) => updateShift(shift.id, "start", e.target.value)}
              className="border rounded p-2"
            >
              {timeSlots.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            –
            <select
              value={shift.end}
              onChange={(e) => updateShift(shift.id, "end", e.target.value)}
              className="border rounded p-2"
            >
              {timeSlots.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(TASK_GROUPS).map(([key, group]) => (
              <button
                key={key}
                onClick={() => toggleGroup(shift.id, key)}
                className={`p-2 rounded border ${
                  shift.selectedGroups.includes(key)
                    ? "bg-[#582F5B] text-white"
                    : "bg-white"
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {shift.selectedTasks.map((task) => (
              <button
                key={task}
                onClick={() => toggleTask(shift.id, task)}
                className="p-2 border rounded bg-[#582F5B] text-white text-left"
              >
                {task}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
