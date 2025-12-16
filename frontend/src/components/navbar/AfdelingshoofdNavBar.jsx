import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMdNotificationsOutline } from "react-icons/io";


function AfdelingshoofdNavBar() {
  return (
    <nav className="bg-white py-3 shadow-sm rounded-3xl mt-4 mb-6">
      <div className="w-full mx-auto px-4 flex items-center justify-between">


        <div className="flex gap-4">
          <a href="/afdelingshoofd/dashboard" className="text-gray-800 font-semibold text-base py-1 px-2 hover:text-black">Dashboard</a>
          <a href="/afdelingshoofd/mijn-personeel" className="text-gray-500 text-base py-1 px-2 hover:text-black">Mijn Personeel</a>
          <a href="/afdelingshoofd/meldingen" className="text-gray-500 text-base py-1 px-2 hover:text-black">Meldingen</a>
        </div>


        <div className="flex items-center space-x-4">
          <span className="text-gray-500 cursor-pointer hover:text-gray-700">
            <IoMdNotificationsOutline size={24} />
          </span>
          <div className="flex border border-gray-300 rounded-full overflow-hidden text-sm font-semibold">
            <span className="bg-gray-200 px-2 py-1 text-gray-800">NL</span>
            <span className="px-2 py-1 text-gray-500 cursor-pointer hover:bg-gray-100">FR</span>
          </div>
        </div>


      </div>
    </nav>
  );
}

export default AfdelingshoofdNavBar;