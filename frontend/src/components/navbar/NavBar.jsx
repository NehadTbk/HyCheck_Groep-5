import React, { useState } from "react";

function NavBar({ items, activeKey, onChange, showInstructions = true }) {
  // NEW: simple local language state (UI only)
  const [lang, setLang] = useState("NL");

  return (
    <nav className="flex items-center justify-between w-full">
      {/* LEFT SIDE NAV BUTTONS */}
      <div className="flex gap-4">
        {items.map((item) => {
          const isActive = item.key === activeKey;

          return (
            <button
              key={item.key}
              onClick={() => onChange && onChange(item.key)}
              className={[
                "px-4 py-2 rounded-full text-sm font-medium cursor-pointer select-none transition-all duration-150",
                isActive
                  ? "bg-[#7A4A77] text-white shadow-md"
                  : "bg-transparent text-gray-800 hover:bg-gray-200 hover:text-black",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* RIGHT SIDE ICONS */}
      <div className="flex items-center gap-4">
        {showInstructions && (
          <button className="text-sm text-gray-800">Instructies</button>
        )}

        <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg">
          🔔
        </button>

        {/* LANGUAGE SWITCHER */}
        <div className="bg-gray-100 rounded-full px-1 py-0.5 flex items-center text-[11px] shadow-sm">
          <button
            className={[
              "px-2 font-semibold transition-all",
              lang === "NL" ? "text-black" : "text-gray-500",
            ].join(" ")}
            onClick={() => setLang("NL")}
          >
            NL
          </button>

          <button
            className={[
              "px-2 transition-all",
              lang === "FR" ? "text-black" : "text-gray-500",
            ].join(" ")}
            onClick={() => setLang("FR")}
          >
            FR
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
