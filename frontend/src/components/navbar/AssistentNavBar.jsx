import React from "react";

function AssistentNavBar() {
  return (
    <div className="bg-white rounded-xl px-6 py-3 flex gap-6 text-sm font-medium">
      <button className="text-purple-900 border-b-2 border-purple-900 pb-1">
        Dashboard
      </button>
      <button className="text-gray-500 pb-1">Mijn Boxen</button>
      <button className="text-gray-500 pb-1">Rapporten</button>
      <div className="ml-auto flex items-center gap-4 text-gray-500">
        <button>Instructies</button>
        <button className="border rounded-full px-3 py-1 text-xs">NL</button>
        <button className="border rounded-full px-3 py-1 text-xs">FR</button>
      </div>
    </div>
  );
}

export default AssistentNavBar;
