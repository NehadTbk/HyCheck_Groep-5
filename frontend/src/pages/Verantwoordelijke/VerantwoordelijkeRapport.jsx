import React, { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { FaFilePdf } from "react-icons/fa6";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import RapportFilter from "../../components/Verantwoordelijke/RapportFilter";
import Rapporten from "../../components/Verantwoordelijke/Rapporten";
import VerantwoordelijkeNavBar from "../../components/navbar/VerantwoordelijkeNavBar";

/*const STATISCHE_DATA = [
    { id: 1, datum: "2025-11-18", box: "Box 1", tandarts: "Dr. Van Damme", assistent: "Saige Fuentes", aantal: 2, soort: "Ochtend", status: "Openstaand" },
    { id: 2, datum: "2025-11-19", box: "Box 2", tandarts: "Dr. Smith", assistent: "Alex Otto", aantal: 5, soort: "Middag", status: "Voltooid" },
    { id: 3, datum: "2025-12-01", box: "Box 1", tandarts: "Dr. Van Damme", assistent: "Léa Van Langenhove", aantal: 3, soort: "Ochtend", status: "Openstaand" },
];*/

function VerantwoordelijkeRapport() {
    const [rapporten, setRapporten] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    const [filters, setFilters] = useState({
        periode: "Aangepast",
        vanDatum: "",
        totDatum: "",
        assistentZoek: ""
    });

    useEffect(() => {
    const fetchRapporten = async () => {
        try {
            const response = await fetch("http://localhost:5001/api/reports");
            const data = await response.json();

            const geformatteerdeData = data.map(item => ({
                ...item,
                datum: item.datum ? item.datum.split('T')[0] : "Geen datum"
            }));

            setRapporten(geformatteerdeData);
            setLoading(false);
        } catch (error) {
            console.error("Fout bij ophalen:", error);
            setLoading(false);
        }
    };

    
    fetchRapporten(); 

}, []);

    
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    
    const gefilterdeData = rapporten.filter(item => {
        const matchAssistent = item.assistent?.toLowerCase().includes(filters.assistentZoek.toLowerCase()) || false;
        const matchVan = filters.vanDatum === "" || item.datum >= filters.vanDatum;
        const matchTot = filters.totDatum === "" || item.datum <= filters.totDatum;
        
        return matchAssistent && matchVan && matchTot;
    });
    return (
        <PageLayout>
            <VerantwoordelijkeNavBar />

                <div className="p-6 bg-white rounded-xl shadow-lg min-h-[500px]">
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
        </PageLayout>
    );
}

export default VerantwoordelijkeRapport;