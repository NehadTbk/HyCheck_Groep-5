import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

const typeColors = {
  Ochtend: "bg-blue-100 text-blue-700 border-blue-300",
  Avond: "bg-purple-100 text-purple-700 border-purple-300",
  Wekelijks: "bg-orange-100 text-orange-700 border-orange-300",
  Maandelijks: "bg-yellow-100 text-yellow-700 border-yellow-300",
};

function BoxCard({ box, onCheck, onClick }) {
  const isVoltooid = box.status === "voltooid";
  const isGedeeltelijk = box.status === "gedeeltelijk";

  // Kleuren aangepast voor beter contrast
  const cardStyles = isVoltooid 
    ? "border-green-400 bg-green-50" 
    : isGedeeltelijk 
      ? "border-orange-400 bg-orange-50" // Feller oranje
      : "border-red-300 bg-red-50";

  return (
    <div
      onClick={() => onClick(box)}
      className={`rounded-2xl border px-4 py-3 shadow-sm cursor-pointer transition-all hover:brightness-95
                  w-[260px] h-[150px] flex flex-col justify-between relative ${cardStyles}`}
    >
      <div>
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-[16px]">{box.name}</h3>
          <div className="flex items-center gap-2">
            {isVoltooid && (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-normal bg-green-100 text-green-700 border border-green-200">
                Voltooid
              </span>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCheck(box.id);
              }}
              className="transition-colors"
            >
              {isGedeeltelijk ? (
                <AlertCircle size={22} className="text-orange-500" strokeWidth={2.5} />
              ) : (
                <CheckCircle 
                  size={22} 
                  strokeWidth={2.5} 
                  className={isVoltooid ? "text-green-500" : "text-gray-300 hover:text-green-400"} 
                />
              )}
            </button>
          </div>
        </div>
        <p className="text-[14px] text-gray-700 font-medium">Tandarts: {box.dentist}</p>
        <p className="text-[14px] text-gray-700">Aantal taken: {box.tasksCount}</p>
      </div>

      <div className="mt-2 flex gap-2 overflow-x-hidden">
        {box.types.map((type) => (
          <span key={type} className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${typeColors[type] || "bg-gray-100"}`}>
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}

export default BoxCard;