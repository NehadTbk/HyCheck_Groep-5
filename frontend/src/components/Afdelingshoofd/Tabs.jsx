import React from "react";

function Tabs() {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* Tabs */}
      <div className="bg-white rounded-full p-1 inline-flex">
        <button className="px-7 py-2 rounded-full text-sm font-medium bg-[#7A4A77] text-white">
          Dashboard
        </button>
        <button className="px-7 py-2 rounded-full text-sm font-medium text-gray-700">
          Mijn Personeel
        </button>
      </div>

      {/* Language toggle */}
      <div className="bg-white rounded-full p-1 inline-flex text-[11px]">
        <button className="px-3 py-1 rounded-full font-semibold">NL</button>
        <button className="px-3 py-1 rounded-full text-gray-500">FR</button>
      </div>
    </div>
  );
}

export default Tabs;
