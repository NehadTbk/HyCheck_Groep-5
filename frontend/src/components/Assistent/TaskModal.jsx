import React, { useState, useEffect } from "react";
import { X, Circle, CheckCircle2 } from "lucide-react";

function TaskModal({ box, tasksState, onToggleTask, onClose, onSave }) {
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reason, setReason] = useState("");
  const [standardOptions, setStandardOptions] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [taskByType, setTaskByType] = useState({});
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Taken ophalen
  useEffect(() => {
    if (!box || !box.assignment_id) return; 
    const token = localStorage.getItem("token");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split("T")[0];

    fetch(`${API_BASE_URL}/api/tasks/boxes/${box.assignment_id}/tasks?date=${dateString}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((data) => {
        const grouped = {};
        if (Array.isArray(data)) {
          data.forEach(task => {
            const type = task.tag || task.category || "Overig";
            if (!grouped[type]) grouped[type] = [];

            const taskId = task.id || task.schedule_id;

            grouped[type].push({
              id: taskId,
              title: task.title || task.task_name,
              desc: task.desc || task.description || "",
              completed: !!task.completed
            });

            // Alleen syncen als de taak in DB op 1 staat 
            // EN hij in onze huidige UI nog niet op 'true' staat
            if (task.completed && !tasksState[box.id]?.[taskId]) {
              onToggleTask(box.id, taskId);
            }
          });
        }
        setTaskByType(grouped);
      })
      .catch(err => console.error("Fout bij taken:", err));
    // LET OP: We voegen box.id toe aan dependency array, maar NIET tasksState
    // anders krijg je een infinite loop!
  }, [box?.assignment_id]);

  // Redenen ophalen uit comment_option
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/api/tasks/options`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        // We slaan de data op die uit comment_option komt
        setStandardOptions(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Fout bij opties:", err));
  }, []);

  if (!box) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-3xl font-bold text-gray-900">{box.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Taken Lijst */}
        <div className="overflow-y-auto p-6 space-y-8 flex-1">
          {Object.keys(taskByType).length > 0 ? (
            Object.keys(taskByType).map((type) => (
              <div key={type} className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
                <h3 className="font-bold text-lg text-gray-800 mb-4">{type} taken</h3>
                <div className="space-y-6">
                  {taskByType[type].map((task) => {
                    const isDone = tasksState[box.id]?.[task.id];
                    return (
                      <div key={task.id} className="flex gap-4 cursor-pointer" onClick={() => onToggleTask(box.id, task.id)}>
                        <div className={isDone ? "text-green-500" : "text-gray-300"}>
                          {isDone ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                        </div>
                        <div>
                          <h4 className={`font-semibold ${isDone ? "text-gray-400 line-through" : "text-gray-800"}`}>
                            {task.title}
                          </h4>
                          <p className="text-sm text-gray-500">{task.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-10 text-gray-400">Geen taken gevonden voor morgen.</p>
          )}
        </div>

        {/* Reden Sectie */}
        <div className="p-6 border-t bg-white">
          {showReasonInput ? (
            <div className="space-y-4 mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase">Selecteer een reden:</p>
              <div className="grid grid-cols-1 gap-2">
                {standardOptions.map((opt) => (
                  <label key={opt.option_id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer ${selectedOptionId === opt.option_id ? "bg-[#5C2D5F]/5 border-[#5C2D5F]" : "bg-white"}`}>
                    <input
                      type="radio"
                      name="reasonOption"
                      checked={selectedOptionId === opt.option_id}
                      onChange={() => {
                        setSelectedOptionId(opt.option_id);
                        setReason(""); // Maak eigen tekst leeg bij keuze optie
                      }}
                    />
                    {/* HIER GEBRUIKEN WE DE KOLOM UIT JE DB */}
                    <span className="text-sm text-gray-700">{opt.common_comment}</span>
                  </label>
                ))}
              </div>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setSelectedOptionId(null); // Deselecteer optie bij zelf typen
                }}
                placeholder="Of typ hier een eigen opmerking..."
                className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none"
                rows={2}
              />
            </div>
          ) : (
            <button className="text-[#5C2D5F] font-bold mb-4" onClick={() => setShowReasonInput(true)}>
              + Reden toevoegen
            </button>
          )}

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-4 text-gray-500 font-bold">Annuleren</button>
            <button
              className="bg-[#5C2D5F] text-white px-10 py-4 rounded-2xl font-bold shadow-lg text-lg"
              onClick={() => onSave(box.id, selectedOptionId, reason)}
            >
              Opslaan & Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;