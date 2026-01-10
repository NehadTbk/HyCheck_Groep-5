import React, { useState } from "react";
import BoxCard from "./BoxCard";

// Voeg onBoxCheck en onBoxClick toe aan de props
function BoxList({ boxes, onBoxCheck, onBoxClick }) {
  const [statusFilter, setStatusFilter] = useState("alles");
  const [typeFilter, setTypeFilter] = useState("alle"); 

  const statusOptions = [
    { key: "alles", label: "Alles" },
    { key: "openstaand", label: "Openstaand" },
    { key: "voltooid", label: "Voltooid" }
  ];

  const typeOptions = [
    { key: "alle", label: "Alle tags" },
    { key: "Ochtend", label: "Ochtend" },
    { key: "Avond", label: "Avond" },
    { key: "Wekelijks", label: "Wekelijks" },
    { key: "Maandelijks", label: "Maandelijks" }
  ];

  const filtered = boxes.filter((box) => {
    if (statusFilter === "openstaand" && box.status !== "openstaand") {
      return false;
    }
    if (statusFilter === "voltooid" && box.status !== "voltooid") {
      return false;
    }
    if (typeFilter !== "alle" && !box.types.includes(typeFilter)) {
      return false;
    }
    return true;
  });

  const getStatusClasses = (key) => {
    const isActive = statusFilter === key;
    return [
      "px-3 py-1 text-xs rounded-full border",
      "bg-white text-gray-700 border-gray-300",
      isActive ? "font-semibold bg-gray-100" : "font-normal"
    ].join(" ");
  };

  const getTypeClasses = (key) => {
    const base = "px-3 py-1 text-xs rounded-full border font-medium";
    const isActive = typeFilter === key;

    const typeColors = {
      Ochtend: "bg-blue-100 text-blue-700 border-blue-300",
      Avond: "bg-purple-100 text-purple-700 border-purple-300",
      Wekelijks: "bg-orange-100 text-orange-700 border-orange-300",
      Maandelijks: "bg-yellow-100 text-yellow-700 border-yellow-300",
      alle: "bg-white text-gray-700 border-gray-300"
    };

    // Voeg een visuele hint toe als een filter actief is
    const activeClass = isActive ? " ring-2 ring-offset-1 ring-gray-400" : "";

    return `${base} ${typeColors[key] || "bg-white text-gray-700 border-gray-300"}${activeClass}`;
  };

  return (
    <div className="space-y-4">
      {/* Filters bovenaan */}
      <div className="flex justify-end">
        <div className="flex flex-wrap gap-2 items-center">
          {statusOptions.map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={getStatusClasses(item.key)}
            >
              {item.label}
            </button>
          ))}

          <span className="mx-2 h-4 w-px bg-gray-200" />

          {typeOptions.map((item) => (
            <button
              key={item.key}
              onClick={() => setTypeFilter(item.key)}
              className={getTypeClasses(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid met kaarten */}
      <div
        className="
          grid 
          gap-4 
          justify-center
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
      >
        {filtered.map((box) => (
          <BoxCard 
            key={box.id} 
            box={box} 
            onCheck={onBoxCheck} 
            onClick={onBoxClick} 
          />
        ))}
      </div>
    </div>
  );
}

export default BoxList;