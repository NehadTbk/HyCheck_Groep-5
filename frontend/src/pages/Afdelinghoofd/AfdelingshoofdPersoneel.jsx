// pages/Afdelinghoofd/AfdelingshoofdPersoneel.jsx
import React, { useState } from "react";
import Topbar from "../../components/common/Topbar";
import { IoMdNotificationsOutline } from "react-icons/io";
import Personeelsregister from '../../components/personeel/Personeelsregister';
import PersoneelToevoegenModal from '../../components/personeel/PersoneelToevoegenModal';

function AfdelingshoofdPersoneel() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const userRole = "admin";

    return (
        <div className="min-h-screen bg-[#E5DCE7] flex flex-col rounded-2xl overflow-hidden">
            <Topbar />

                <div className="p-6 bg-white rounded-xl shadow-lg mt-4 min-h-[500px]">
                    <div className="flex justify-between items-center pb-3 mb-6 border-b border-gray-300">
                        <h1 className="text-3xl font-extrabold text-gray-800">Personeelsbeheer (Afdelingshoofd)</h1>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#4A2144] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#8B5CF6] transition-colors"
                        >
                            + Personeel toevoegen
                        </button>
                    </div>
                    
                    <Personeelsregister showAllUsers={true} /> {/* Toon ALLE gebruikers */}
                </div>

            <PersoneelToevoegenModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userRole={userRole}
            />
        </div>
    );
}

export default AfdelingshoofdPersoneel;