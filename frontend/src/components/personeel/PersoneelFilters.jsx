// src/components/Afdelingshoofd/PersoneelFilters.jsx
import React from "react";
import { ROLE_OPTIONS } from "../Afdelingshoofd/constants";

function PersoneelFilters({ selectedRoles, onChange }) {
  const handleClick = (key) => {
    let next;

    if (selectedRoles.includes(key)) {
      // remove if already selected
      next = selectedRoles.filter((k) => k !== key);
    } else {
      // add if not selected yet
      next = [...selectedRoles, key];
    }

    onChange(next);
  };

  return (
    <div className="flex gap-2">
      {ROLE_OPTIONS.map((role) => {
        const isActive = selectedRoles.includes(role.key);
        return (
          <button
            key={role.key}
            onClick={() => handleClick(role.key)}
            className={[
              "px-4 py-1 rounded-full text-xs transition-colors",
              isActive
                ? "bg-[#C6939F] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300",
            ].join(" ")}
          >
            {role.label}
          </button>
        );
      })}
    </div>
  );
}

export default PersoneelFilters;
