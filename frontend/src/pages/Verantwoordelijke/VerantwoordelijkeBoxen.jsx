import React from "react";
import Topbar from "../../components/layout/Topbar";
import VerantwoordelijkeNavBar from "../../components/navbar/VerantwoordelijkeNavBar";

function VerantwoordelijkeBoxen() {
  return (
    <div className="min-h-screen bg-[#E5DCE7] flex flex-col rounded-2xl overflow-hidden">
      <Topbar />

      <main className="flex-1 px-8 py-6">
        <VerantwoordelijkeNavBar />

        <div className="p-6 bg-white rounded-xl shadow-lg mt-4 min-h-[500px]">
          <div className="flex justify-between items-center pb-3 mb-6 border-b border-gray-300">
            <h1 className="text-3xl font-extrabold text-gray-800">Mijn Boxen</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add your box content here */}
          </div>
        </div>
      </main>
    </div>
  );
}

export default VerantwoordelijkeBoxen;
