import React, { useState } from "react";
import Topbar from "../../components/layout/Topbar";
import VerantwoordelijkeNavBar from "../../components/navbar/VerantwoordelijkeNavBar";
import { IoMdClose } from "react-icons/io";
import { FaRegTrashAlt } from "react-icons/fa";
import Personeelsregister from '../../components/personeel/Personeelsregister';
import PersoneelToevoegenModal from "../../components/personeel/PersoneelToevoegenModal";

function VerantwoordelijkePersoneel() {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const userRole = "responsible";

    return (
        <div className="min-h-screen bg-[#E5DCE7] flex flex-col rounded-2xl overflow-hidden">
            <Topbar />

            <main className="flex-1 px-8 py-6">
                <VerantwoordelijkeNavBar />

                <div className="p-6 bg-white rounded-xl shadow-lg mt-4 min-h-[500px]">
                    <div className="flex justify-between items-center pb-3 mb-6 border-b border-gray-300">

                        <h1 className="text-3xl font-extrabold text-gray-800">Mijn Personeel</h1>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#4A2144] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#8B5CF6] transition-colors flex items-center space-x-2"
                        >
                            <span className="hidden sm:inline">Personeel toevoegen</span>
                        </button>
                    </div>
                    <Personeelsregister />
                </div>
            </main>
            <PersoneelToevoegenModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userRole={userRole}
            />
        </div>
    );
}

export default VerantwoordelijkePersoneel;
