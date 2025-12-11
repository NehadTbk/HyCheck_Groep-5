import React from "react";
import Topbar from "../../components/common/Topbar";
import AfdelingshoofdNavBar from "../../components/navbar/AfdelingshoofdNavBar";
import PersoneelRegisterCard from "../../components/Afdelingshoofd/PersoneelRegisterCard";

function AfdelingshoofdPersoneel() {
  return (
    <div className="min-h-screen bg-[#C6B6C2] flex flex-col">
      <Topbar />

      <main className="flex-1 px-8 py-6">
        <div className="bg-[#E5E5E5] rounded-xl min-h-[calc(100vh-7rem)] px-10 py-6 flex flex-col">
          <AfdelingshoofdNavBar />

          <div className="mt-8 flex-1">
            <PersoneelRegisterCard />
          </div>

          <div className="mt-4 flex justify-end">
            <button className="bg-white rounded-full px-6 py-2 text-sm shadow">
              Personeel toevoegen
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AfdelingshoofdPersoneel;
