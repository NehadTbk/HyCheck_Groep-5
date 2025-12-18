import React, { useState } from 'react';
import { CiSearch } from "react-icons/ci";
import { IoTrashOutline } from "react-icons/io5";

const personeelData = [
    { id: 'c489', naam: 'Otto', voornaam: 'Alex', functie: 'Tandartsassistent', email: 'alex@chubrugmann.be' },
    { id: 'c450', naam: 'Van Langenhove', voornaam: 'Léa', functie: 'Verantwoordelijke', email: 'lea@chubrugmann.be' },
    { id: 'c434', naam: 'Van Tandt', voornaam: 'Ashley', functie: 'Tandarts', email: 'ashley@chubrugmann.be' },
    { id: 'c399', naam: 'Deschamps', voornaam: 'Amandine', functie: 'Tandartsassistent', email: 'amandine@chubrugmann.be' },
];

const functies = ['Tandarts', 'Tandartsassistent', 'Verantwoordelijke'];

function Personeelsregister() {
    
    
    const [actieveFilter, setActieveFilter] = useState(null); 
    
    
    return (
        
        <div className="p-6 bg-white rounded-xl mt-4">

            
            <div className="flex justify-between items-center mb-6">
                
                
                <div className="flex space-x-2">
                    {functies.map(functie => (
                        <button 
                            key={functie}
                            onClick={() => setActieveFilter(functie)}
                            className={`py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                                actieveFilter === functie 
                                ? 'bg-[#E5DCE7] text-gray-800' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {functie}
                        </button>
                    ))}
                </div>

                
                <div className="relative w-64">
                    <input 
                        type="text" 
                        placeholder="Zoeken..." 
                        className="w-full border border-gray-300 p-2 pl-10 rounded-full focus:ring-[#A78BFA] focus:border-[#A78BFA]"
                    />
                    <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>

            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#F8F9FA]">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700 rounded-l-xl">ID</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Naam</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Voornaam</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Functie</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">E-mail</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-700 rounded-r-xl text-right">Verwijder</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {personeelData.map((persoon) => (
                            <tr key={persoon.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{persoon.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{persoon.naam}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{persoon.voornaam}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{persoon.functie}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{persoon.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                    
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        title="Personeelslid verwijderen"
                                    >
                                        <IoTrashOutline size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Personeelsregister;