import React, { useEffect, useMemo, useState, useCallback } from "react";
import PersoneelFilters from "./PersoneelFilters";
import PersoneelSearch from "./PersoneelSearch";
import PersoneelTable from "./PersoneelTable";
import { ROLE_OPTIONS } from "../Afdelingshoofd/constants";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

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

// robust local user read (optional filtering)
const getLocalUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

function PersoneelRegisterCard({ refreshKey = 0, showAllUsers = false }) {
  const [rows, setRows] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  // ✅ fallback + remove trailing slash
  const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(
    /\/$/,
    ""
  );

  // 🔄 Centrale fetch (herbruikbaar)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`GET /api/users failed (${res.status}): ${txt?.slice(0, 200)}`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      // ✅ accept is_active as 1 / "1" / true
      let mapped = list
        .filter((u) => u.is_active === 1 || u.is_active === "1" || u.is_active === true)
        .map((u) => ({
          id: u.user_id,
          code: `u${u.user_id}`,
          lastName: u.last_name,
          firstName: u.first_name,
          roleKey: roleToKey(u.role),
          roleLabel: roleToLabel(u.role),
          email: u.email,
        }));

      // Optional: if NOT showAllUsers, a responsible user only sees dentist + assistant
      if (!showAllUsers) {
        const currentUser = getLocalUser();
        if (currentUser?.role === "responsible") {
          mapped = mapped.filter(
            (r) => r.roleKey === "tandarts" || r.roleKey === "tandartsassistent"
          );
        }
      }

      setRows(mapped);
    } catch (err) {
      console.error("Fetch users error:", err);
      setRows([]); // keep UI consistent
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, showAllUsers]);

  // init + refetch when modal created (refreshKey changes)
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshKey]);

  // 🗑 verwijderen
  const handleDelete = async (userId) => {
    const confirm = window.confirm("Ben je zeker dat je dit personeelslid wil verwijderen?");
    if (!confirm) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Delete failed");
      }

      fetchUsers();
    } catch (err) {
      console.error("Delete user error:", err);
      alert(err.message);
    }
  };

  // filters + search
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const usingRoleFilter =
        selectedRoles.length > 0 && selectedRoles.length < ROLE_OPTIONS.length;

      if (usingRoleFilter && !selectedRoles.includes(row.roleKey)) {
        return false;
      }

      if (!search) return true;
      const haystack = `${row.code} ${row.lastName} ${row.firstName} ${row.email}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [rows, selectedRoles, search]);

  return (
    <div className="bg-white rounded-xl shadow-md px-10 py-8">
      <div className="flex items-start justify-between">
        <h1 className="text-3xl font-semibold">{t("personeelsRegister.title")}</h1>

        <div className="flex items-center gap-4">
          <PersoneelFilters selectedRoles={selectedRoles} onChange={setSelectedRoles} />
          <PersoneelSearch value={search} onChange={setSearch} />
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-500">{t("personeelsRegister.loading")}</p>
      ) : (
        <PersoneelTable rows={filteredRows} onDelete={handleDelete} />
      )}
    </div>
  );
}

export default PersoneelRegisterCard;
