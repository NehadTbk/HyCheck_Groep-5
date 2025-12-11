import React, { useState } from "react";
import BoxCard from "./BoxCard";

function BoxList({ boxes }) {
  const [filter, setFilter] = useState("alles");

  const filtered = boxes.filter((box) => {
    if (filter === "alles") return true;
    if (filter === "openstaand") return box.status === "openstaand";
    if (filter === "voltooid") return box.status === "voltooid";
    return true;
  });

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">Mijn toegewezen boxen - 20/11</p>
        <div className="flex gap-3 text-sm">
          <button
            onClick={() => setFilter("alles")}
            className={`px-3 py-1 rounded-full ${
              filter === "alles"
                ? "bg-purple-900 text-white"
                : "text-gray-600"
            }`}
          >
            Alles
          </button>
          <button
            onClick={() => setFilter("openstaand")}
            className={`px-3 py-1 rounded-full ${
              filter === "openstaand"
                ? "bg-purple-100 text-purple-900"
                : "text-gray-600"
            }`}
          >
            Openstaand
          </button>
          <button
            onClick={() => setFilter("voltooid")}
            className={`px-3 py-1 rounded-full ${
              filter === "voltooid"
                ? "bg-green-100 text-green-700"
                : "text-gray-600"
            }`}
          >
            Voltooid
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {filtered.map((box) => (
          <BoxCard key={box.id} box={box} />
        ))}
      </div>
    </div>
  );
}

export default BoxList;
