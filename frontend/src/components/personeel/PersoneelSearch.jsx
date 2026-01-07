import React from "react";

function PersoneelSearch({ value, onChange }) {
  return (
    <div className="flex items-center bg-[#C1A9CF] rounded-full px-4 py-1 w-56">
      <input
        type="text"
        placeholder="Zoek Personeel"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="bg-transparent flex-1 text-xs outline-none placeholder:text-gray-600"
      />
      <span className="text-sm">🔍</span>
    </div>
  );
}

export default PersoneelSearch;
