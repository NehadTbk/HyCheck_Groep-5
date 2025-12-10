import React from "react";

function PersoneelTable({ rows }) {
  return (
    <div className="mt-6">

      {/* HEADER */}
      <div className="grid grid-cols-[1fr_2fr_2fr_2fr_2fr_40px] px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-300">
        <span>ID</span>
        <span>Naam</span>
        <span>Voornaam</span>
        <span>Functie</span>
        <span>E-mail</span>
        <span></span>
      </div>

      {/* ROWS */}
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-[1fr_2fr_2fr_2fr_2fr_40px] px-4 py-3 text-sm items-center border-b border-gray-200"
        >
          <span>{row.code}</span>
          <span>{row.lastName}</span>
          <span>{row.firstName}</span>
          <span>{row.roleLabel}</span>
          <span>{row.email}</span>

          <button
            className="text-lg text-gray-700 hover:text-red-500"
            title="Verwijderen"
          >
            🗑
          </button>
        </div>
      ))}
    </div>
  );
}

export default PersoneelTable;
