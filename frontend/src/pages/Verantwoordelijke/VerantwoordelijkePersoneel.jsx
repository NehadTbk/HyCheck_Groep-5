import React, { useState } from "react";
import Topbar from "../../components/layout/Topbar";
import { IoMdNotificationsOutline, IoMdClose } from "react-icons/io";
import { FaRegTrashAlt } from "react-icons/fa";
import Personeelsregister from '../../components/personeel/Personeelsregister';


function VerantwoordelijkePersoneel() {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        voornaam: "",
        achternaam: "",
        email: "",
        functie: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");



    const functieOpties = [
        "Tandarts",
        "Tandartsassistent",
    ];

    const functieToRoleMap = {
        "Tandartsassistent": "assistant",
        "Tandarts": "dentist",
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ voornaam: "", achternaam: "", email: "", functie: "" });
        setError("");
        setSuccess("");
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        if (!formData.voornaam || !formData.achternaam || !formData.email || !formData.functie) {
            setError("Alle velden zijn verplicht");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Je bent niet ingelogd");
                setLoading(false);
                return;
            }

            const role = functieToRoleMap[formData.functie] || "assistant";

            const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName: formData.voornaam,
                    lastName: formData.achternaam,
                    email: formData.email,
                    role: role,
                    sendEmail: false
                })
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.message || "Fout bij toevoegen personeelslid");
                setLoading(false);
                return;
            }

            setSuccess(`Personeelslid  ${formData.voornaam} ${formData.achternaam} toegevoegd!`);

            setFormData({
                voornaam: "",
                achternaam: "",
                email: "",
                functie: "",
            });

            setTimeout(() => {
                closeModal();
                window.location.reload();
            }, 3000);
        } catch (err) {
            console.error("Add staff error:", err);
            setError("Kan geen verbinding maken met de server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#E5DCE7] flex flex-col rounded-2xl overflow-hidden">
            <Topbar />

            <main className="flex-1 px-8 py-6">

                <nav className="bg-white py-3 shadow-sm rounded-3xl mt-4 mb-6">
                    <div className="w-full mx-auto px-4 flex items-center justify-between">
                        <div className="flex gap-4">
                            <a href="/verantwoordelijke/dashboard" className="text-gray-500 text-base py-1 px-2 hover:text-black">Dashboard</a>
                            <a href="/verantwoordelijke/boxen" className="text-gray-500 text-base py-1 px-2 hover:text-black">Mijn Boxen</a>
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




                <div className="p-6 bg-white rounded-xl shadow-lg mt-4 min-h-[500px]">
                    <div className="flex justify-between items-center pb-3 mb-6 border-b border-gray-300">

                        <h1 className="text-3xl font-bold text-gray-800">Mijn Personeel</h1>

                        <button
                            onClick={openModal}
                            className="bg-[#4A2144] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#8B5CF6] transition-colors flex items-center space-x-2"
                        >
                            <span className="hidden sm:inline">Personeel toevoegen</span>
                        </button>
                    </div>
                    <Personeelsregister />
                </div>

            </main>


            {isModalOpen && (
                <div className="fixed inset-0  bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">

                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h2 className="text-2xl font-bold">Nieuw Personeelslid</h2>
                            <button onClick={closeModal} className="text-gray-600 hover:text-gray-900" disabled={loading}>
                                <IoMdClose size={24} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm rounded-lg">
                                {success}
                            </div>
                        )}


                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <label htmlFor="voornaam" className="block text-sm font-medium text-gray-700 mb-1">Voornaam: </label>
                                    <input
                                        type="text"
                                        id="voornaam"
                                        name="voornaam"
                                        value={formData.voornaam}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 p-2 rounded-lg focus:ring-[#A78BFA] focus:border-[#A78BFA]"
                                        placeholder="bv. Van Langenhove"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="achternaam" className="block text-sm font-medium text-gray-700 mb-1">Achternaam:</label>
                                    <input
                                        type="text"
                                        id="achternaam"
                                        name="achternaam"
                                        value={formData.achternaam}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 p-2 rounded-lg focus:ring-[#A78BFA] focus:border-[#A78BFA]"
                                        placeholder="bv. Léa"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mailadres:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring-[#A78BFA] focus:border-[#A78BFA]"
                                    placeholder="bv. lea@chubrugmann.be"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="functie" className="block text-sm font-medium text-gray-700 mb-1">Functie:</label>
                                <select
                                    id="functie"
                                    name="functie"
                                    value={formData.functie}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring-[#A78BFA] focus:border-[#A78BFA] bg-white"
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Functie:</option>
                                    {functieOpties.map(optie => (
                                        <option key={optie} value={optie}>{optie}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="text-xs text-gray-500 mt-2">
                                Een tijdelijk wachtwoord wordt automatisch gegenereerd.
                            </div>


                            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={loading}
                                    className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400"
                                >
                                    Annuleren
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#4A2144] text-white py-2 px-4 rounded-lg hover:bg-[#8B5CF6]"
                                >
                                    {loading ? "Bezig met toevoegen..." : "Toevoegen"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VerantwoordelijkePersoneel;