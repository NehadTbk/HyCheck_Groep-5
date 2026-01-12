import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import PersoneelFilters from "./PersoneelFilters";
import PersoneelSearch from "./PersoneelSearch";
import PersoneelTable from "./PersoneelTable";
import { ROLE_OPTIONS } from "../Afdelingshoofd/constants";
import { useTranslation } from "../../i18n/useTranslation";
import { Check, X, Trash2, AlertTriangle } from "lucide-react";

// DB role → UI
const roleToKey = (role) => {
  switch (role) {
    case "responsible": return "verantwoordelijke";
    case "assistant": return "tandartsassistent";
    case "dentist": return "tandarts";
    case "admin": return "admin";
    default: return role;
  }
};

const getLocalUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

function PersoneelRegister({ refreshKey = 0, showAllUsers = false }) {
  const [rows, setRows] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [notification, setNotification] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const notificationTimeoutRef = useRef(null);

  const { t } = useTranslation();
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const showNotification = (type, key, duration = 4000) => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    setNotification({ type, key });
    notificationTimeoutRef.current = setTimeout(() => setNotification(null), duration);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      let mapped = list
        .filter((u) => u.is_active === 1 || u.is_active === "1" || u.is_active === true)
        .map((u) => ({
          id: u.user_id,
          code: `u${u.user_id}`,
          lastName: u.last_name,
          firstName: u.first_name,
          roleKey: roleToKey(u.role),
          email: u.email,
        }));

      if (!showAllUsers) {
        const currentUser = getLocalUser();
        if (currentUser?.role === "responsible") {
          mapped = mapped.filter(r => r.roleKey === "tandarts" || r.roleKey === "tandartsassistent");
        }
      }
      setRows(mapped);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, showAllUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshKey]);

  const handleDeleteClick = (userId) => {
    setConfirmDeleteId(userId);
  };

  const executeDelete = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${confirmDeleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      setConfirmDeleteId(null);
      showNotification('success', 'personeelsRegister.deleteSuccess');
      fetchUsers();
    } catch (err) {
      setConfirmDeleteId(null);
      showNotification('error', 'personeelsRegister.errorDelete');
    }
  };

  const filteredRows = useMemo(() => {
    const currentUser = getLocalUser();
    return rows.filter((row) => {
      if (currentUser?.role === "responsible" && (row.roleKey === "verantwoordelijke" || row.roleKey === "admin")) return false;
      const usingRoleFilter = selectedRoles.length > 0 && selectedRoles.length < ROLE_OPTIONS.length;
      if (usingRoleFilter && !selectedRoles.includes(row.roleKey)) return false;
      if (!search) return true;
      const haystack = `${row.code} ${row.lastName} ${row.firstName} ${row.email}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [rows, selectedRoles, search]);

  return (
    <div className="bg-white rounded-xl shadow-md px-10 py-8 relative">
      {notification && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border animate-in fade-in slide-in-from-top-4 bg-white border-gray-100">
          {notification.type === 'success' ? <Check className="text-green-500" /> : <X className="text-red-500" />}
          <span className="font-bold text-gray-800">{t(notification.key)}</span>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t("personeelsRegister.confirmTitle") || "Bent u zeker?"}
            </h3>
            <p className="text-gray-500 mb-8">
              {t("personeelsRegister.confirmDelete")}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={executeDelete}
                className="w-full bg-red-500 text-white py-3 rounded-2xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
              >
                {t("personeelsRegister.confirmBtn")}
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="w-full bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
              >
                {t("common.cancel") || "Annuleren"}
              </button>
            </div>
          </div>
        </div>
      )}

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
        <PersoneelTable rows={filteredRows} onDelete={handleDeleteClick} />
      )}
    </div>
  );
}

export default PersoneelRegister;