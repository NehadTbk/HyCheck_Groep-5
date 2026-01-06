import React, { useState } from "react";
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

  if (!box) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">{box.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
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
        
        <div className="p-6 border-t bg-white">
          {showReasonInput ? (
            <div className="space-y-3 mb-4">
              <label className="text-sm font-semibold text-gray-700">Reden toevoegen:</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Typ hier de reden waarom een taak niet voltooid is..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C2D5F]/20 focus:border-[#5C2D5F] resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowReasonInput(false);
                    setReason("");
                  }}
                  className="text-gray-600 text-sm font-semibold hover:text-gray-800 px-3 py-1"
                >
                  Annuleren
                </button>
                <button
                  onClick={() => {
                    console.log("Reden opgeslagen:", reason);
                    setShowReasonInput(false);
                  }}
                  className="bg-[#5C2D5F] hover:bg-[#4A2144] text-white px-4 py-1 rounded-lg text-sm font-semibold transition-colors"
                >
                  Bevestigen
                </button>
              </div>
            </div>
          ) : (
            <button
              className="text-[#5C2D5F] font-bold hover:underline mb-4"
              onClick={() => setShowReasonInput(true)}
            >
              + Reden toevoegen
            </button>
          )}

          <div className="flex justify-end">
            <button
              className="bg-[#5C2D5F] hover:bg-[#4a244d] text-white px-10 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
              onClick={() => onSave(box.id)}
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