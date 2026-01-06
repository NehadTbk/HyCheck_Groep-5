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
        const response = await fetch("/api/scheduling-data");
        const data = await response.json();

        setDentists(data.dentists);
        setBoxes(data.boxes);
        setAssistants(data.assistants);
        const slots = generateTimeSlots(timeConfig.openTime, timeConfig.closeTime, timeConfig.intervalMinutes);
    }

    fetchData();
}, []);

return (
    <div>
      <select>
        {dentists.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>
    </div>
);
}

export default SchedulingOverlay;