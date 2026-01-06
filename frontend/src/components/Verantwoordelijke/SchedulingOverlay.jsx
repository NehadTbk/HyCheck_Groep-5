import { use, useEffect, useState } from "react";
import { X, Plus, Trash2, Clock } from "lucide-react";

function SchedulingOverlay() {
const [dentists, setDentists] = useState([]);
const [boxes, setBoxes] = useState([]);
const [assistants, setAssistants] = useState([]);

useEffect(() => {
    async function fetchData() {
        const response = await fetch("/api/scheduling-data");
        const data = await response.json();

        setDentists(data.dentists);
        setBoxes(data.boxes);
        setAssistants(data.assistants);
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