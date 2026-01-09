import React, { useEffect } from "react";
import { ROLE_OPTIONS } from "../Afdelingshoofd/constants";

const getLocalUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

function PersoneelFilters({ selectedRoles, onChange }) {
  const currentUser = getLocalUser();

  // ✅ Hide "verantwoordelijke" for responsible users
  const visibleRoleOptions =
    currentUser?.role === "responsible"
      ? ROLE_OPTIONS.filter((r) => r.key !== "verantwoordelijke")
      : ROLE_OPTIONS;

  // ✅ Safety: if responsible already has verantwoordelijke selected somehow, remove it
  useEffect(() => {
    if (currentUser?.role === "responsible" && selectedRoles.includes("verantwoordelijke")) {
      onChange(selectedRoles.filter((k) => k !== "verantwoordelijke"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.role]);

  const handleClick = (key) => {
    let next;

    if (selectedRoles.includes(key)) {
      next = selectedRoles.filter((k) => k !== key);
    } else {
      next = [...selectedRoles, key];
    }

    onChange(next);
  };

  return (
    <div className="flex gap-2">
      {visibleRoleOptions.map((role) => {
        const isActive = selectedRoles.includes(role.key);
        return (
          <button
            key={role.key}
            onClick={() => handleClick(role.key)}
            className={[
              "px-4 py-1 rounded-full text-xs transition-colors",
              isActive
                ? "bg-[#C1A9CF] text-white"
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
