import React from "react";

function NavBar({ items, activeKey, onChange, showInstructions = true }) {
  return (
    <nav className="flex items-center justify-between w-full">
      {/* Left: Navigation Tabs */}
      <div className="flex gap-4">
        {items.map((item) => {
          const isActive = item.key === activeKey;

          return (
            <button
              key={item.key}
              onClick={() => onChange && onChange(item.key)}
              className={[
                "px-4 py-2 rounded-full text-sm transition-colors",
                isActive
                  ? "bg-[#7A4A77] text-white"
                  : "bg-transparent text-gray-800 hover:bg-gray-200",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Right: Instructions, Bell, Language toggle */}
      <div className="flex items-center gap-4">
        {showInstructions && (
          <button className="text-sm text-gray-800">Instructies</button>
        )}

        <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg">
          🔔
        </button>

        <div className="bg-gray-100 rounded-full px-1 py-0.5 flex items-center text-[11px] shadow-sm">
          <button className="px-2 font-semibold">NL</button>
          <button className="px-2 text-gray-500">FR</button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
