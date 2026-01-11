import React, { useEffect, useMemo } from "react";
import { ROLE_OPTIONS } from "../Afdelingshoofd/constants";
import { useTranslation } from "../../i18n/useTranslation";

const getLocalUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

function PersoneelFilters({ selectedRoles, onChange }) {
  const { t } = useTranslation();

  const currentUser = useMemo(() => getLocalUser(), []);

  // ✅ Keys die we NIET willen tonen/kunnen selecteren voor responsible users
  const hiddenKeysForResponsible = useMemo(
    () => new Set(["verantwoordelijke", "responsible"]),
    []
  );

  // ✅ Hide "verantwoordelijke" button for responsible users
  const visibleRoleOptions = useMemo(() => {
    if (currentUser?.role === "responsible") {
      return ROLE_OPTIONS.filter((r) => !hiddenKeysForResponsible.has(r.key));
    }
    return ROLE_OPTIONS;
  }, [currentUser?.role, hiddenKeysForResponsible]);

  // ✅ Safety: als verantwoordelijke toch "verantwoordelijke/responsible" geselecteerd heeft → remove
  useEffect(() => {
    if (currentUser?.role !== "responsible") return;

    const hasHiddenSelected = selectedRoles.some((k) =>
      hiddenKeysForResponsible.has(k)
    );

    if (hasHiddenSelected) {
      onChange(selectedRoles.filter((k) => !hiddenKeysForResponsible.has(k)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.role]);

  const handleClick = (roleKey) => {
    if (selectedRoles.includes(roleKey)) {
      onChange(selectedRoles.filter((r) => r !== roleKey));
    } else {
      onChange([...selectedRoles, roleKey]);
    }
  };

  return (
    <div className="flex gap-2">
      {visibleRoleOptions.map((role) => {
        const isActive = selectedRoles.includes(role.key);

        return (
          <button
            key={role.key}
            type="button"
            onClick={() => handleClick(role.key)}
            className={[
              "px-4 py-1 rounded-full text-xs transition-colors",
              isActive
                ? "bg-[#C1A9CF] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300",
            ].join(" ")}
          >
            {t(role.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

export default PersoneelFilters;
