import React from "react";
import { FaRegTrashAlt } from "react-icons/fa";

function PersoneelTable({ rows, onDelete }) {
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    currentUser = null;
  }

  const canDelete = !!currentUser?.permissions?.includes("USER_DELETE");

  return (
    <div className="mt-4">
      {/* Header row */}
      <div className="grid grid-cols-[120px_2fr_2fr_2fr_3fr_80px] bg-gray-50 rounded-xl px-6 py-3 text-sm font-semibold text-gray-600">
        <span>ID</span>
        <span>Naam</span>
        <span>Voornaam</span>
        <span>Functie</span>
        <span>E-mail</span>
        <span className="text-right">Acties</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[120px_2fr_2fr_2fr_3fr_80px] items-center px-6 py-4 text-sm hover:bg-gray-50 transition"
          >
            <span className="font-medium text-gray-900">{row.code}</span>
            <span>{row.lastName}</span>
            <span>{row.firstName}</span>

            <span>
              <span className="inline-block bg-[#E5DCE7] text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                {row.roleLabel}
              </span>
            </span>

            <span>{row.email}</span>

            {canDelete &&
            !(
              currentUser?.role === "responsible" &&
              (row.roleKey === "verantwoordelijke" || row.roleKey === "admin")
            ) ? (
              <button
                onClick={() => onDelete(row.id)}
                className="ml-auto text-gray-400 hover:text-red-500 transition"
                title="Verwijderen"
              >
                <FaRegTrashAlt />
              </button>
            ) : (
              <span className="ml-auto" />
            )}
          </div>
        ))}

        {rows.length === 0 && (
          <div className="px-6 py-6 text-sm text-gray-500">
            Geen personeelsleden gevonden.
          </div>
        )}
      </div>
    </div>
  );
}

export default PersoneelTable;
