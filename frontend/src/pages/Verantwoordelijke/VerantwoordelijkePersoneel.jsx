import React from "react";
import Topbar from "../../components/common/Topbar";
import { IoMdNotificationsOutline } from "react-icons/io";

function VerantwoordelijkePersoneel() {
  return (
    <div className="min-h-screen bg-[#E5DCE7] flex flex-col rounded-2xl overflow-hidden">
      <Topbar />

      <main className="flex-1 px-8 py-6">
        
        <nav className="bg-white py-3 shadow-sm rounded-3xl mt-4 mb-6">
          <div className="w-full mx-auto px-4 flex items-center justify-between">

            
            <div className="flex gap-4">
            
              <a href="/verantwoordelijke/dashboard" className="text-gray-500 text-base py-1 px-2 hover:text-black">Dashboard</a>
              <a href="/verantwoordelijke/kalender" className="text-gray-500 text-base py-1 px-2 hover:text-black">Mijn Boxen</a>
              <a href="/verantwoordelijke/rapporten" className="text-gray-500 text-base py-1 px-2 hover:text-black">Rapporten</a>
              
              <a href="/verantwoordelijke/personeel" className="text-gray-800 font-semibold text-base py-1 px-2 hover:text-black">Mijn Personeel</a> 
              
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

       
        
        
        
        <div className="p-4 bg-white rounded-xl shadow-lg mt-4 min-h-[500px]">
            <h1 className="text-3xl font-extrabold text-gray-800 pb-3 mb-6 border-b border-gray-300">Mijn Personeel</h1>
             
        </div>

      </main>
    </div>
  );
}

export default VerantwoordelijkePersoneel;