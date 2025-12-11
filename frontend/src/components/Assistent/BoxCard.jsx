import React from "react";

function BoxCard({ box }) {
  const isDone = box.status === "voltooid";

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm bg-white ${
        isDone ? "border-green-400" : "border-red-300"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold">{box.name}</p>
          <p className="text-xs text-gray-500">
            Tandarts: {box.dentist}
          </p>
          <p className="text-xs text-gray-500">
            Aantal taken: {box.tasksCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">Soort taken:</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {box.types.map((type) => (
              <span
                key={type}
                className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full ${
              isDone
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {isDone ? "Voltooid" : "Openstaand"}
          </span>
          <button className="w-5 h-5 border border-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default BoxCard;
