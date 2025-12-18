// src/components/Assistent/AssistentNavBar.jsx
import React, { useState } from "react";
import NavBar from "../NavBar";

function AssistentNavBar() {
  const [activeKey, setActiveKey] = useState("dashboard");
  const items = [
    { key: "dashboard", label: "Dashboard" },
    { key: "boxes", label: "Mijn Boxen" },
    { key: "history", label: "Historiek" },
  ];

  const handleChange = (key) => setActiveKey(key);

  return (
    <div className="w-full">
      <div className="w-full bg-white rounded-[26px] px-8 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          {/* tabs links met genoeg ruimte zodat 'Mijn Boxen' op één lijn blijft */}
          <div className="flex gap-12">
            {items.map((item) => {
              const isActive = item.key === activeKey;
              return (
                <button
                  key={item.key}
                  onClick={() => handleChange(item.key)}
                  className={`px-4 py-2 rounded-full text-base font-medium transition-all ${
                    isActive
                      ? "bg-[#C1A9CF] text-[#2C1E33]"
                      : "text-gray-900 hover:text-gray-700"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* rechterzijde (Instructies + bel + taal) */}
          <NavBar showInstructions />
        </div>
      </div>
    </div>
  );
}

export default AssistentNavBar;