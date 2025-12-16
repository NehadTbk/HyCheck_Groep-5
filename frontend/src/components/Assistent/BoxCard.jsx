import React from "react";

const typeColors = {
  Ochtend: "bg-blue-100 text-blue-700 border-blue-300",
  Avond: "bg-purple-100 text-purple-700 border-purple-300",
  Wekelijks: "bg-orange-100 text-orange-700 border-orange-300",
  Maandelijks: "bg-yellow-100 text-yellow-700 border-yellow-300",
};

function BoxCard({ box }) {
  const isDone = box.status === "voltooid";

  return (
    <div
      className={`rounded-2xl border px-4 py-3 shadow-sm 
                  w-[260px] h-[150px]          /* iets breder zodat tags passen */
                  flex flex-col justify-between
                  ${
                    isDone
                      ? "border-green-300 bg-green-50"
                      : "border-red-300 bg-red-50"
                  }`}
    >
      {/* bovenste content */}
      <div>
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-[16px]">{box.name}</h3>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-normal ${
              isDone
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isDone ? "Voltooid" : "Openstaand"}
          </span>
        </div>

        <p className="text-[14px] text-gray-700">
          Tandarts: {box.dentist}
        </p>
        <p className="text-[14px] text-gray-700">
          Aantal taken: {box.tasksCount}
        </p>
      </div>

      {/* tags onderaan, geen wrap zodat ze 1 lijn blijven */}
      <div className="mt-2 flex gap-2 overflow-x-hidden">
        {box.types.map((type) => (
          <span
            key={type}
            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${
              typeColors[type] ||
              "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}

export default BoxCard;
