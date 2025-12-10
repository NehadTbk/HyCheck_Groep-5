import React from "react";

function PeriodicCard() {
  return (
    <article className="bg-white rounded-xl shadow-md px-8 py-6 max-w-xl">
      <h3 className="text-base font-medium mb-4">Periodieke reinigingen</h3>

      <div className="flex gap-2 text-sm mb-1">
        <span className="text-gray-600 w-20">Wekelijks:</span>
        <span className="font-semibold">
          Dinsdag 4/11, Vrijdag 15/11, Woensdag 20/11, Donderdag 27/11
        </span>
      </div>

      <div className="flex gap-2 text-sm">
        <span className="text-gray-600 w-20">Maandelijks:</span>
        <span className="font-semibold">Maandag 17/11</span>
      </div>
    </article>
  );
}

export default PeriodicCard;
