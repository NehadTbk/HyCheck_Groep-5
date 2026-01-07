import React, { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { FaFilePdf } from "react-icons/fa6";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import RapportFilter from "../../components/Verantwoordelijke/RapportFilter";
import Rapporten from "../../components/Verantwoordelijke/Rapporten";
import VerantwoordelijkeNavBar from "../../components/navbar/VerantwoordelijkeNavBar";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';



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

            if (Array.isArray(data)) {
                const geformatteerdeData = data.map(item => ({
                    ...item,
                    datum: item.datum ? item.datum.split('T')[0] : "Geen datum"
                }));
                setRapporten(geformatteerdeData);
            } else {
                console.error("Ontvangen data is geen array:", data);
                setRapporten([]);
            }

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
    const exportToExcel = () => {
    
    const exportData = gefilterdeData.map(item => ({
        Datum: item.datum,
        Box: item.box,
        Tandarts: item.tandarts,
        Assistent: item.assistent,
        Taken: item.aantal,
        Soort: item.soort,
        Status: item.status,
        Reden: item.reden || "-"
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rapport");
    const filename = `Rapport_${filters.assistentZoek || 'HyCheck'}_${new Date().toLocaleDateString()}.xlsx`;
    XLSX.writeFile(workbook, filename);
    };
    const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.text("Rapport Overzicht", 14, 15);
    
    const tableColumn = ["Datum", "Box", "Tandarts", "Assistent", "Aantal", "Status", "Reden"];
    const tableRows = gefilterdeData.map(item => [
        item.datum,
        item.box,
        item.tandarts,
        item.assistent,
        item.aantal,
        item.status,
        item.reden || "-"
    ]);
const img = new Image();
img.src = '/hycheck-logo.png';

img.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const imgWidth = 20;
    const imgHeight = 20;
    const margin = 14;

    
    doc.addImage(
        img,
        'PNG',
        pageWidth - imgWidth - margin,
        10,
        imgWidth,
        imgHeight
    );
    doc.setFontSize(16);
    

    autoTable(doc, {
        startY: 35,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',

        styles: {
            fontSize: 9,
            cellPadding: 5,
            overflow: 'linebreak'
        },

        headStyles: {
            fillColor: [74, 33, 68],
            textColor: 255
        },

        columnStyles: {
            4: { cellWidth: 40 },
            5: { cellWidth: 28 }
        }
    });

    doc.save(`Rapport_${filters.assistentZoek || 'HyCheck'}.pdf`);
};
    };
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
                            <button onClick={exportToExcel} className="bg-[#2D7D46] hover:bg-[#1e532e] text-white px-6 py-2 rounded-md font-medium hover:bg-opacity-90 transition-all flex items-center gap-3">
                            <PiMicrosoftExcelLogoFill size={20} />
                            <span>Excel</span>
                            
                            </button>
                            <button onClick={exportToPDF}className="bg-[#FF7F50] hover:bg-[#e65c2b] text-white px-6 py-2 rounded-md font-medium hover:bg-opacity-90 transition-all flex items-center gap-3">
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