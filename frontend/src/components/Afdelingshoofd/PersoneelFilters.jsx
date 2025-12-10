import React from "react";

const ROLE_OPTIONS = [
  { key: "verantwoordelijke", label: "Verantwoordelijke" },
  { key: "tandarts", label: "Tandarts" },
  { key: "tandartsassistent", label: "Tandartsassistent" },
];

function PersoneelFilters({ activeRole, onChange }) {
  return (
    <div className="flex gap-2">
      {ROLE_OPTIONS.map((role) => {
        const isActive = activeRole === role.key;
        return (
          <button
            key={role.key}
            onClick={() => onChange && onChange(role.key)}
            className={[
              "px-4 py-1 rounded-full text-xs transition-colors",
              isActive
                ? "bg-[#C6939F] text-white"
                : "bg-gray-200 text-gray-700",
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
export { ROLE_OPTIONS };
