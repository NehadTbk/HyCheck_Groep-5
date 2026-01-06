import { use, useEffect, useState } from "react";
import { X, Plus, Trash2, Clock } from "lucide-react";

function SchedulingOverlay() {
  const [dentists, setDentists] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [assistants, setAssistants] = useState([]);
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

    setTimeSlots(generateTimeSlots(timeConfig.openTime, timeConfig.closeTime, timeConfig.intervalMinutes));
  }, []);

  return (
    <div>
      <label>Tijd</label>
      <select>
        {timeSlots.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>

      <label>Dentist</label>
      <select>
        {dentists.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>

      <label>Box</label>
      <select>
        {boxes.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      <label>Assistant</label>
      <select>
        {assistants.map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>
    </div>
  );
}

export default SchedulingOverlay;