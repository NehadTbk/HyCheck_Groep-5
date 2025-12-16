import React, { useMemo, useState } from "react";
import PersoneelFilters, { ROLE_OPTIONS } from "./PersoneelFilters";
import PersoneelSearch from "./PersoneelSearch";
import PersoneelTable from "./PersoneelTable";

const PERSONEEL_ROWS = [
  {
    id: 1,
    code: "c450",
    lastName: "Vanlangen...",
    firstName: "Léa",
    roleKey: "verantwoordelijke",
    roleLabel: "Verantwoordelijke",
    email: "lea.v@example.com",
  },
  {
    id: 2,
    code: "c489",
    lastName: "Otto",
    firstName: "Alex",
    roleKey: "tandartsassistent",
    roleLabel: "Tandartsassistent",
    email: "otto.alex@example.com",
  },
  {
    id: 3,
    code: "c399",
    lastName: "Deschamps",
    firstName: "Amandine",
    roleKey: "tandartsassistent",
    roleLabel: "Tandartsassistente",
    email: "amandine.d@example.com",
  },
  {
    id: 4,
    code: "c434",
    lastName: "Van Tandt",
    firstName: "Ashley",
    roleKey: "tandarts",
    roleLabel: "Tandarts",
    email: "ashley.vt@example.com",
  },
];

function PersoneelRegisterCard() {
  const [selectedRoles, setSelectedRoles] = useState([]); // array of roleKeys
  const [search, setSearch] = useState("");

  const filteredRows = useMemo(() => {
    return PERSONEEL_ROWS.filter((row) => {
      // --- ROLE FILTER ---
      const usingRoleFilter =
        selectedRoles.length > 0 &&
        selectedRoles.length < ROLE_OPTIONS.length;

      if (usingRoleFilter && !selectedRoles.includes(row.roleKey)) {
        return false;
      }

      // --- SEARCH FILTER ---
      if (!search) return true;
      const haystack = `${row.code} ${row.lastName} ${row.firstName} ${row.email}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [selectedRoles, search]);

  return (
    <div className="bg-white rounded-xl shadow-md px-10 py-8">
      <div className="flex items-start justify-between">
        <h1 className="text-3xl font-semibold">Personeelsregister</h1>

        <div className="flex items-center gap-4">
          <PersoneelFilters
            selectedRoles={selectedRoles}
            onChange={setSelectedRoles}
          />
          <PersoneelSearch value={search} onChange={setSearch} />
        </div>
      </div>

      <PersoneelTable rows={filteredRows} />
    </div>
  );
}

export default PersoneelRegisterCard;
