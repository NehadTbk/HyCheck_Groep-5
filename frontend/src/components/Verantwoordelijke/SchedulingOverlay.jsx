import { useEffect, useState } from "react";
import { X, Plus, Trash2, Clock } from "lucide-react";

function SchedulingOverlay() {
  const [dentists, setDentists] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]); // ⚡ nu een state

  const timeConfig = { openTime: "08:00", closeTime: "18:00", intervalMinutes: 30 };

  function generateTimeSlots(openTime, closeTime, interval) {
    const slots = [];

    let [h, m] = openTime.split(":").map(Number);
    let currentMinutes = h * 60 + m;

    const [ch, cm] = closeTime.split(":").map(Number);
    const endMinutes = ch * 60 + cm;

    while (currentMinutes <= endMinutes) {
      const hour = String(Math.floor(currentMinutes / 60)).padStart(2, "0");
      const minutes = String(currentMinutes % 60).padStart(2, "0");
      slots.push(`${hour}:${minutes}`);
      currentMinutes += interval;
    }

    return slots;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:5001/api/scheduling-data");
        const data = await response.json();

        setDentists(data.dentists);
        setBoxes(data.boxes);
        setAssistants(data.assistants);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    fetchData();

    const generatedSlots = generateTimeSlots(
      timeConfig.openTime,
      timeConfig.closeTime,
      timeConfig.intervalMinutes
    );
    setTimeSlots(generatedSlots);
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg grid gap-6 max-w-3xl mx-auto">
      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700 flex items-center gap-1">
          <Clock size={16} /> Tijd
        </label>
        <select className="p-2 rounded border border-gray-300 bg-input" disabled={timeSlots.length === 0}>
          {timeSlots.length > 0 ? (
            timeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))
          ) : (
            <option value="">Geen tijdslots beschikbaar</option>
          )}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">Dentist</label>
        <select className="p-2 rounded border border-gray-300 bg-input" disabled={dentists.length === 0}>
          {dentists.length > 0 ? (
            dentists.map((d) => <option key={d}>{d}</option>)
          ) : (
            <option value="">Geen dentists</option>
          )}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">Box</label>
        <select className="p-2 rounded border border-gray-300 bg-input" disabled={boxes.length === 0}>
          {boxes.length > 0 ? (
            boxes.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))
          ) : (
            <option value="">Geen boxes</option>
          )}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">Assistant</label>
        <select className="p-2 rounded border border-gray-300 bg-input" disabled={assistants.length === 0}>
          {assistants.length > 0 ? (
            assistants.map((a) => <option key={a}>{a}</option>)
          ) : (
            <option value="">Geen assistants</option>
          )}
        </select>
      </div>
    </div>
  );
}

export default SchedulingOverlay;