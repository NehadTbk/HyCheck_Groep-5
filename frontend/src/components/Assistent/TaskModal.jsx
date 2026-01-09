import React, { useState, useEffect } from "react";
import { X, Circle, CheckCircle2 } from "lucide-react";

const typeColors = {
  Ochtend: "bg-blue-100 text-blue-700 border-blue-300",
  Avond: "bg-purple-100 text-purple-700 border-purple-300",
  Wekelijks: "bg-orange-100 text-orange-700 border-orange-300",
  Maandelijks: "bg-yellow-100 text-yellow-700 border-yellow-300",
};

const taskData = {
  Ochtend: [
    { id: "o1", title: "Filters schoonmaken", desc: "De voorfilters schoonmaken" },
    { id: "o2", title: "Waterleidingen spoelen", desc: "Plaats alle instrumenten in de spoelstandaard..." },
  ],
  Avond: [
    { id: "a1", title: "Oppervlakken reinigen", desc: "De bekleding schoonmaken met desinfectiemiddel" },
    { id: "a2", title: "Aspiratiesysteem reinigen", desc: "Volledig reinigen van de slangen..." },
  ],
  Wekelijks: [
    { id: "w1", title: "MD555-oplossing", desc: "1 à 2 liter MD555-oplossing aanzuigen..." },
  ],
  Maandelijks: [
    { id: "m1", title: "Standaards schoonmaken", desc: "De spoelstandaards schoonmaken..." },
  ],
};

function TaskModal({ box, tasksState, onToggleTask, onClose, onSave }) {
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reason, setReason] = useState("");
  const [standardOptions, setStandardOptions] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  // Haal de common options op uit de database zodra de modal opent
  useEffect(() => {
    fetch("http://localhost:5001/api/tasks/options")
      .then((res) => res.json())
      .then((data) => setStandardOptions(data))
      .catch((err) => console.error("Fout bij ophalen opties:", err));
  }, []);

  if (!box) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-3xl font-bold text-gray-900">{box.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Taken Lijst */}
        <div className="overflow-y-auto p-6 space-y-8">
          {box.types.map((type) => (
            <div key={type} className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">{type}taken</h3>
                <span className={`px-4 py-1 rounded-full text-xs font-bold border shadow-sm ${typeColors[type]}`}>
                  {type}
                </span>
              </div>
              
              <div className="space-y-6">
                {taskData[type]?.map((task) => {
                  const isDone = tasksState[box.id]?.[task.id];
                  return (
                    <div 
                      key={task.id} 
                      className="flex gap-4 cursor-pointer group" 
                      onClick={() => onToggleTask(box.id, task.id)}
                    >
                      <div className={`transition-colors ${isDone ? "text-green-500" : "text-gray-300 group-hover:text-gray-400"}`}>
                        {isDone ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                      </div>
                      <div>
                        <h4 className={`font-semibold transition-all ${isDone ? "text-gray-400" : "text-gray-800"}`}>
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-500 leading-relaxed">{task.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Reden Sectie */}
        <div className="p-6 border-t bg-white">
          {showReasonInput ? (
            <div className="space-y-4 mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Standaard redenen:</label>
              
              <div className="grid grid-cols-1 gap-2">
                {standardOptions.map((opt) => (
                  <label 
                    key={opt.option_id} 
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                      selectedOptionId === opt.option_id ? "bg-[#5C2D5F]/5 border-[#5C2D5F]" : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reasonOption"
                      className="w-4 h-4 accent-[#5C2D5F]"
                      onChange={() => {
                        setSelectedOptionId(opt.option_id);
                        setReason(""); // Maak vrije tekst leeg als je een standaard optie kiest
                      }}
                      checked={selectedOptionId === opt.option_id}
                    />
                    <span className="text-sm text-gray-700 font-medium">{opt.common_comment}</span>
                  </label>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Eigen reden (overschrijft keuze):</label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setSelectedOptionId(null); // Deselecteer radiobutton als je zelf begint te typen
                  }}
                  placeholder="Typ hier de reden waarom een taak niet voltooid is..."
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C2D5F]/20 focus:border-[#5C2D5F] resize-none bg-white"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowReasonInput(false);
                    setReason("");
                    setSelectedOptionId(null);
                  }}
                  className="text-gray-500 text-xs font-bold px-4 py-2 hover:text-gray-700"
                >
                  ANNULEREN
                </button>
                <button
                  onClick={() => setShowReasonInput(false)}
                  className="bg-[#5C2D5F] text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-[#4a244d]"
                >
                  REDEN BEVESTIGEN
                </button>
              </div>
            </div>
          ) : (
            <button
              className="text-[#5C2D5F] font-bold hover:underline mb-4 flex items-center gap-2"
              onClick={() => setShowReasonInput(true)}
            >
              <span className="text-xl">+</span> Reden toevoegen
            </button>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              className="bg-[#5C2D5F] text-white px-10 py-4 rounded-2xl font-bold shadow-xl text-lg"
              onClick={() => {
                console.log("Klik geregistreerd, roep nu handleSaveTasks aan...");
                console.log("onSave is:", onSave);
                onSave?.(box.id, selectedOptionId, reason);
              }}
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