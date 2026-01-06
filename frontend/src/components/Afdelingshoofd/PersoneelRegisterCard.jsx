import React, { useEffect, useMemo, useState, useCallback } from "react";
import PersoneelFilters from "../personeel/PersoneelFilters";
import PersoneelSearch from "./PersoneelSearch";
import PersoneelTable from "./PersoneelTable";
import { ROLE_OPTIONS } from "./constants";

// DB role → UI
const roleToKey = (role) => {
  switch (role) {
    case "responsible":
      return "verantwoordelijke";
    case "assistant":
      return "tandartsassistent";
    case "dentist":
      return "tandarts";
    case "admin":
      return "admin";
    default:
      return role;
  }
};

const roleToLabel = (role) => {
  switch (role) {
    case "responsible":
      return "Verantwoordelijke";
    case "assistant":
      return "Tandartsassistent";
    case "dentist":
      return "Tandarts";
    case "admin":
      return "Admin";
    default:
      return role;
  }
};

function PersoneelRegisterCard() {
  const [rows, setRows] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // 🔄 Centrale fetch (herbruikbaar)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = fetch(`${API_BASE_URL}/api/users`);
      const data = await res.json();
      const mapped = data
        .filter((u) => u.is_active === 1)
        .map((u) => ({
          id: u.user_id,
          code: `u${u.user_id}`,
          lastName: u.last_name,
          firstName: u.first_name,
          roleKey: roleToKey(u.role),
          roleLabel: roleToLabel(u.role),
          email: u.email,
        }));

      setRows(mapped);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // init
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 🗑 verwijderen
  const handleDelete = async (userId) => {
    const confirm = window.confirm(
      "Ben je zeker dat je dit personeelslid wil verwijderen?"
    );
    if (!confirm) return;

    try {
      await fetch(`${API_BASE_URL}/api/users/${userId}`, { method: "DELETE" });
      
      // 🔄 refresh lijst
      fetchUsers();
    } catch (err) {
      console.error("Delete user error:", err);
    }
  };

  // filters + search
  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      if (selectedRoles.length > 0 && !selectedRoles.includes(row.roleKey)) return false;
      if (!search) return true;

      const haystack = `${row.code} ${row.lastName} ${row.firstName} ${row.email}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [rows, selectedRoles, search]);

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

      {loading ? (
        <p className="mt-6 text-sm text-gray-500">Personeel laden…</p>
      ) : (
        <PersoneelTable
          rows={filteredRows}
          onDelete={handleDelete}   // 👈 doorgeven
        />
      )}
    </div>
  );
}

export default PersoneelRegisterCard;
