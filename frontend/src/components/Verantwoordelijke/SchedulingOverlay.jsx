import React, { useEffect, useState } from "react";
import { Plus, Trash2, Clock } from "lucide-react";
import { apiFetch } from "../../utils/api";


const typeColors = {
  ochtend: "bg-blue-100 text-blue-700 border-blue-300",
  avond: "bg-purple-100 text-purple-700 border-purple-300",
  wekelijks: "bg-orange-100 text-orange-700 border-orange-300",
  maandelijks: "bg-yellow-100 text-yellow-700 border-yellow-300",
};

const baseStyle =
  "border rounded-lg px-3 py-2 text-sm font-medium cursor-pointer transition w-full text-center";

const TASK_GROUPS = {
  ochtend: {
    label: "Ochtend",
    tasks: ["Filters", "Waterleidingen – Lange spoeling"],
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
  const [selectedTasks, setSelectedTasks] = useState([]);

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
      const res = await apiFetch(":5001/api/scheduling-data");
      const data = await res.json();
      setDentists(data.dentists);
      setBoxes(data.boxes);
      setAssistants(data.assistants);
    }
    fetchData();
  }, []);

  const addShift = () => {
    setShifts((prev) => [
      ...prev,
      {
        id: Date.now(),
        dentist: null,
        box: null,
        assistant: null,
        start: "08:00",
        end: "17:00",
        groups: [],
        tasks: [],
      },
    ]);
  };

  const updateShift = (id, field, value) => {
    setShifts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const removeShift = (id) =>
    setShifts((prev) => prev.filter((s) => s.id !== id));

  const toggleGroup = (shiftId, key) => {
    setShifts((prev) =>
      prev.map((s) => {
        if (s.id !== shiftId) return s;

        const active = s.groups.includes(key);
        let groups = active
          ? s.groups.filter((g) => g !== key)
          : [...s.groups, key];

        let tasks = [...s.tasks];

        if (active) {
          tasks = tasks.filter(
            (t) => !TASK_GROUPS[key].tasks.includes(t)
          );
        } else {
          TASK_GROUPS[key].tasks.forEach((t) => {
            if (!tasks.includes(t)) tasks.push(t);
          });
        }

        return { ...s, groups, tasks };
      })
    );
  };

  const toggleTask = (shiftId, task) => {
    setShifts((prev) =>
      prev.map((s) =>
        s.id === shiftId
          ? {
            ...s,
            tasks: s.tasks.includes(task)
              ? s.tasks.filter((t) => t !== task)
              : [...s.tasks, task],
          }
          : s
      )
    );
  };

  const isShiftValid = (shift) => {
    return (
      shift.dentist &&
      shift.box &&
      shift.assistant &&
      shift.start &&
      shift.end &&
      shift.start < shift.end &&
      shift.tasks.length > 0
    );
  };

  const canConfirm =
    shifts.length > 0 && shifts.every(isShiftValid);

  // Confirm: stuur shifts naar backend createAssignments endpoint
  const confirmSchedule = async () => {
    if (!canConfirm) return;

    const payload = {
      shifts: shifts.map((s) => ({
        date,
        box: s.box, // overlay stores box as name
        dentist: s.dentist || null,
        assistant: s.assistant || null,
        start: s.start,
        end: s.end,
        groups: s.groups || [],
      })),
    };

    try {
      const res = await apiFetch(":5001/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text(); // read response for logging
      let json;
      try { json = JSON.parse(text); } catch(e) { json = text; }

      if (!res.ok) {
        console.error("POST /api/assignments failed", json);
        return;
      }

      // notify other parts (dashboard) to refresh
      window.dispatchEvent(new CustomEvent("calendarUpdated", { detail: { date } }));

      // optional: clear shifts after success
      setShifts([]);
      console.log("Shifts saved response:", json);
    } catch (err) {
      console.error("Kon schema niet verzenden", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
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
          className="bg-[#582F5B] text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Add shift
        </button>
      </div>

      {shifts.map((shift) => (
        <div key={shift.id} className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-[#582F5B]">Shift</h3>
            <button onClick={() => removeShift(shift.id)}>
              <Trash2 size={18} className="text-red-500" />
            </button>
          </div>

          <Section title="Tandarts">
            {dentists.map((d) => (
              <Toggle
                key={d}
                active={shift.dentist === d}
                onClick={() => updateShift(shift.id, "dentist", d)}
                label={d}
              />
            ))}
          </Section>

          <Section title="Behandelbox">
            {boxes.map((b) => (
              <Toggle
                key={b.box_id}            // changed: use box_id
                active={shift.box === b.name}
                onClick={() => updateShift(shift.id, "box", b.name)}
                label={b.name}
              />
            ))}
          </Section>

          <Section title="Assistent">
            {assistants.map((a) => (
              <Toggle
                key={a}
                active={shift.assistant === a}
                onClick={() => updateShift(shift.id, "assistant", a)}
                label={a}
              />
            ))}
          </Section>

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

          <Section title="Taken">
            {Object.entries(TASK_GROUPS).map(([key, g]) => (
              <Toggle
                key={key}
                label={g.label}
                active={shift.groups.includes(key)}
                onClick={() => toggleGroup(shift.id, key)}
                colorClass={typeColors[key]}
              />
            ))}
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {shift.tasks.map((task) => {
              const groupKey = Object.keys(TASK_GROUPS).find((key) =>
                TASK_GROUPS[key].tasks.includes(task)
              );

              return (
                <Toggle
                  key={task}
                  label={task}
                  active
                  onClick={() => toggleTask(shift.id, task)}
                  colorClass={typeColors[groupKey]}
                />
              );
            })}
          </div>
          <div className="flex justify-end pt-6 border-t mt-6">
            <button
              disabled={!canConfirm}
              onClick={confirmSchedule}
              className={`px-6 py-3 rounded-lg font-semibold transition ${canConfirm
                ? "bg-[#582F5B] text-white hover:bg-[#4a254c]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
              Bevestigen
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h4 className="font-medium mb-2">{title}</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {children}
      </div>
    </div>
  );
}

function Toggle({ label, active, onClick, colorClass }) {
  const activeClass = colorClass
    ? colorClass
    : "bg-[#582F5B] text-white border-[#582F5B]";

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded border text-center transition w-full ${active
        ? activeClass
        : "bg-white border-gray-300 text-gray-600"
        }`}
    >
      {label}
    </button>
  );
}

