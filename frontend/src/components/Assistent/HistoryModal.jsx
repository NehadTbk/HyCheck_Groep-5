import React from "react";
import { X, CheckCircle2, Clock, Circle } from "lucide-react";

function HistoryModal({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Details {data.boxNr}</h2>
            <p className="text-sm text-gray-500">{data.date}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest">Uitgevoerde taken</h3>
          <div className="space-y-3">
            {data.tasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  {task.status === "voltooid" ? (
                    <CheckCircle2 className="text-green-500" size={20} />
                  ) : (
                    <Circle className="text-gray-300" size={20} />
                  )}
                  <span className={`font-medium ${task.status === "niet voltooid" ? "text-gray-400" : "text-gray-700"}`}>
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <Clock size={14} />
                  <span>{task.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6 border-t flex justify-end">
          <button 
            className="bg-[#5C2D5F] text-white px-8 py-2.5 rounded-xl font-bold"
            onClick={onClose}
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}

export default HistoryModal;