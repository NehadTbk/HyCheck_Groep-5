// pages/Afdelinghoofd/AfdelingshoofdPersoneel.jsx
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Topbar from "../../components/layout/Topbar";
import PageLayout from "../../components/layout/PageLayout";
import AfdelingshoofdNavBar from "../../components/navbar/AfdelingshoofdNavBar";
import Personeelsregister from '../../components/personeel/Personeelsregister';
import PersoneelToevoegenModal from '../../components/personeel/PersoneelToevoegenModal';

function AfdelingshoofdPersoneel() {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(location.state?.openAddPersonnel === true);
  const [refreshKey, setRefreshKey] = useState(0);


  const handleCreated = () => {
    setIsModalOpen(false);
    setRefreshKey((k) => k + 1); // triggers refetch in register
  };

  return (
    <PageLayout>
      <AfdelingshoofdNavBar />

        <div className="p-6 bg-white rounded-xl shadow-lg mt-4 min-h-[500px]">
        <div className="flex justify-between items-center pb-3 mb-6 border-b border-gray-300">
          <h1 className="text-3xl font-extrabold text-gray-800">
            Personeelsbeheer (Afdelingshoofd)
          </h1>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#4A2144] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#8B5CF6] transition-colors"
          >
            + Personeel toevoegen
          </button>
        </div>

        <Personeelsregister showAllUsers={true} refreshKey={refreshKey} />
      </div>

      <PersoneelToevoegenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreated}
      />
    </PageLayout>
  );
}

export default AfdelingshoofdPersoneel;