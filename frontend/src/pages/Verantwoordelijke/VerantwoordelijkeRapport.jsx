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
import { useTranslation } from "../../i18n/useTranslation"; 

function VerantwoordelijkeRapport() {
    const { t } = useTranslation(); 
    const [rapporten, setRapporten] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    const [filters, setFilters] = useState({
        periode: "Dagelijks",
        vanDatum: new Date().toISOString().split('T')[0], 
        totDatum: new Date().toISOString().split('T')[0],
        assistentZoek: ""
    });

    useEffect(() => {
        const fetchRapporten = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:5001/api/reports", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                if (Array.isArray(data)) {
                    setRapporten(data);
                } else {
                    setRapporten([]);
                }
                setLoading(false);
            } catch (error) {
                console.error("Fout bij ophalen:", error);
                setLoading(false);
            }
        };
        fetchRapporten(); 
    }, []);

    const handleFilterChange = (name, value) => {
        let newFilters = { ...filters, [name]: value };
        if (name === "periode") {
            const vandaag = new Date().toISOString().split('T')[0];
            let vanDatum = "";
            if (value === "Dagelijks") vanDatum = vandaag;
            else if (value === "Wekelijks") {
                const weekGeleden = new Date();
                weekGeleden.setDate(weekGeleden.getDate() - 7);
                vanDatum = weekGeleden.toISOString().split('T')[0];
            } else if (value === "Maandelijks") {
                const maandGeleden = new Date();
                maandGeleden.setMonth(maandGeleden.getMonth() - 1);
                vanDatum = maandGeleden.toISOString().split('T')[0];
            }
            if (value !== "Aangepast") {
                newFilters.vanDatum = vanDatum;
                newFilters.totDatum = vandaag;
            }
        }
        setFilters(newFilters);
    };

    const gefilterdeData = rapporten.filter(item => {
        const matchAssistent = item.assistent?.toLowerCase().includes(filters.assistentZoek.toLowerCase()) || false;
        const matchVan = filters.vanDatum === "" || item.datum >= filters.vanDatum;
        const matchTot = filters.totDatum === "" || item.datum <= filters.totDatum;
        return matchAssistent && matchVan && matchTot;
    });
    
    
    const exportToExcel = () => {
        const exportData = gefilterdeData.map(item => ({
            [t("reports.date")]: item.datum.split('T')[0],
            [t("reports.box")]: item.box,
            [t("reports.assistant")]: item.assistent,
            [t("rapporten.amountTasks")]: item.aantal,
            [t("rapporten.sortTasks")]: item.soort,
            [t("reports.status")]: item.status === "Voltooid" ? t("boxCard.completed") : t("boxCard.notCompleted"),
            [t("reports.reason")]: item.reden || "-"
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const wscols = [{ wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 40 }];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Rapport");
        const filename = `Export_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, filename);
    };

    
    const exportToPDF = () => {
        const doc = new jsPDF();
        const img = new Image();
        img.src = '/hycheck-logo.png';

        img.onload = () => {
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 14;

            doc.addImage(img, 'PNG', pageWidth - 20 - margin, 10, 20, 20);
            
            doc.setFontSize(16);
            doc.text(t("navbar.rapporten"), margin, 20);

            const tableColumn = [
                t("reports.date"),
                t("reports.box"),
                t("reports.assistant"),
                t("rapporten.amountTasks"),
                t("reports.status"),
                t("reports.reason")
            ];

            const tableRows = gefilterdeData.map(item => [
                item.datum.split('T')[0],
                item.box,
                item.assistent,
                item.aantal,
                item.status === "Voltooid" ? t("boxCard.completed") : t("boxCard.notCompleted"),
                item.reden || "-"
            ]);

            autoTable(doc, {
                startY: 35,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 3 },
                headStyles: { fillColor: [74, 33, 68], textColor: 255 },
                margin: { left: 15, right: 15 }
            });

            doc.save(`Rapport_HyCheck_${new Date().toISOString().split('T')[0]}.pdf`);
        };
    };

    return (
        <PageLayout>
            <VerantwoordelijkeNavBar />
            <div className="p-6 bg-white rounded-xl shadow-lg min-h-[500px]">
                <div className="flex justify-between items-center pb-3 mb-6 border-b border-gray-300">
                    <h1 className="text-3xl font-bold text-gray-800">{t("navbar.rapporten")}</h1>
                </div>
                <RapportFilter filters={filters} onFilterChange={handleFilterChange} />
                <div className="flex gap-4 mb-6 mt-4">
                    <button onClick={exportToExcel} className="bg-[#2D7D46] hover:bg-[#1e532e] text-white px-6 py-2 rounded-md font-medium transition-all flex items-center gap-3">
                        <PiMicrosoftExcelLogoFill size={20} />
                        <span>Excel</span>
                    </button>
                    <button onClick={exportToPDF} className="bg-[#FF7F50] hover:bg-[#e65c2b] text-white px-6 py-2 rounded-md font-medium transition-all flex items-center gap-3">
                        <FaFilePdf size={18} />
                        <span>PDF</span>
                    </button>
                </div>
                <Rapporten data={gefilterdeData}/>
            </div>
        </PageLayout>
    );
}

export default VerantwoordelijkeRapport;