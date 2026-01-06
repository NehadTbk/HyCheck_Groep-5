import React, { useState, useEffect } from "react";
import Topbar from "../../components/layout/Topbar";
import { FaFilePdf } from "react-icons/fa6";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import RapportFilter from "../../components/Verantwoordelijke/RapportFilter";
import Rapporten from "../../components/Verantwoordelijke/Rapporten";
import VerantwoordelijkeNavBar from "../../components/navbar/VerantwoordelijkeNavBar";

const STATISCHE_DATA = [
    { id: 1, datum: "2025-11-18", box: "Box 1", tandarts: "Dr. Van Damme", assistent: "Saige Fuentes", aantal: 2, soort: "Ochtend", status: "Openstaand" },
    { id: 2, datum: "2025-11-19", box: "Box 2", tandarts: "Dr. Smith", assistent: "Alex Otto", aantal: 5, soort: "Middag", status: "Voltooid" },
    { id: 3, datum: "2025-12-01", box: "Box 1", tandarts: "Dr. Van Damme", assistent: "Léa Van Langenhove", aantal: 3, soort: "Ochtend", status: "Openstaand" },
];

function VerantwoordelijkeRapport() {
    
    const [filters, setFilters] = useState({
        periode: "Aangepast",
        vanDatum: "",
        totDatum: "",
        assistentZoek: ""
    });

    
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    
    const gefilterdeData = STATISCHE_DATA.filter(item => {
        const matchAssistent = item.assistent.toLowerCase().includes(filters.assistentZoek.toLowerCase());
        const matchVan = filters.vanDatum === "" || item.datum >= filters.vanDatum;
        const matchTot = filters.totDatum === "" || item.datum <= filters.totDatum;
        
        return matchAssistent && matchVan && matchTot;
    });
    return (
        <div className="min-h-screen bg-[#E5DCE7] flex flex-col rounded-2xl overflow-hidden">
            <Topbar />

            <main className="flex-1 px-8 py-6">

                <VerantwoordelijkeNavBar />

                <div className="p-6 bg-white rounded-xl shadow-lg mt-4 min-h-[500px]">
                    <div className="flex justify-between items-center pb-3 mb-6 border-b border-gray-300">
                        <h1 className="text-3xl font-bold text-gray-800">Rapporten</h1>
                        
                    </div>
                    <RapportFilter filters={filters} onFilterChange={handleFilterChange} />

                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex gap-4 mb-6">
                            <button className="bg-[#2D7D46] text-white px-6 py-2 rounded-md font-medium hover:bg-opacity-90 transition-all flex items-center gap-3">
                            <PiMicrosoftExcelLogoFill size={20} />
                            <span>Excel</span>
                            
                            </button>
                            <button className="bg-[#FF7F50] text-white px-6 py-2 rounded-md font-medium hover:bg-opacity-90 transition-all flex items-center gap-3">
                            <FaFilePdf size={18} />
                            <span>PDF</span>
                           
                            </button>
                        </div>
                    </div>
                    <Rapporten data={gefilterdeData}/>
                </div>

            </main>
        </div>
    );
}

export default VerantwoordelijkeRapport;