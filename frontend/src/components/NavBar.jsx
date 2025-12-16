// components/NavBar.jsx (bijgewerkte globale navbar)
import React from "react";
import { IoMdNotificationsOutline } from "react-icons/io";

function NavBar({ showInstructions = true }) {
  return (
    <div className="flex items-center gap-6">
      {showInstructions && (
        <button className="text-base text-gray-900 font-medium hover:opacity-80 transition">
          Instructies
        </button>
      )}
      <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
        <IoMdNotificationsOutline className="text-xl text-gray-900" />
      </button>
      <div className="bg-gray-200 rounded-full px-1 py-0.5 flex items-center text-xs">
        <button className="px-3 py-1 rounded-full bg-white text-gray-900 font-semibold">
          NL
        </button>
        <button className="px-3 py-1 rounded-full text-gray-700">
          FR
        </button>
      </div>
    </div>
  );
}

export default NavBar;
