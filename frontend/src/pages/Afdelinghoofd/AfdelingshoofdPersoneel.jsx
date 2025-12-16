import React from "react";
import { useNavigate } from "react-router-dom";          // 👈 NEW
import Topbar from "../../components/common/Topbar";
import AfdelingshoofdNavBar from "../../components/navbar/AfdelingshoofdNavBar";
import PersoneelRegisterCard from "../../components/Afdelingshoofd/PersoneelRegisterCard";

function AfdelingshoofdPersoneel() {
  const navigate = useNavigate();                       // 👈 NEW

  const handleAddPersonnel = () => {
    // change path here if your route is named differently
    navigate("/afdelingshoofd/account-aanmaken");
  };

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
            <button
              onClick={handleAddPersonnel}               // 👈 CLICK HANDLER
              className="
                bg-white rounded-full px-6 py-2 text-sm shadow
                hover:bg-gray-100 hover:shadow-md
                transition-colors
              "
            >
              Account Aanmaken
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AfdelingshoofdPersoneel;
