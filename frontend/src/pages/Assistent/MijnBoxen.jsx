import React from "react";
import Topbar from "../../components/common/Topbar";
import AssistentNavBar from "../../components/Assistent/AssistentNavBar";
import BoxList from "../../components/Assistent/BoxList";

function MijnBoxen() {
  const boxes = [
    { id: 1, name: "Box 1", dentist: "Saige Fuentes", tasksCount: 2, status: "voltooid", types: ["Ochtend"] },
    { id: 2, name: "Box 2", dentist: "Saige Fuentes", tasksCount: 6, status: "voltooid", types: ["Avond", "Wekelijks", "Maandelijks"] },
    { id: 3, name: "Box 3", dentist: "Saige Fuentes", tasksCount: 4, status: "openstaand", types: ["Avond", "Wekelijks"] },
    { id: 4, name: "Box 4", dentist: "Saige Fuentes", tasksCount: 8, status: "openstaand", types: ["Ochtend", "Wekelijks", "Maandelijks"] },
    { id: 5, name: "Box 1", dentist: "Saige Fuentes", tasksCount: 2, status: "voltooid", types: ["Avond"] },
    { id: 6, name: "Box 2", dentist: "Saige Fuentes", tasksCount: 6, status: "voltooid", types: ["Ochtend", "Maandelijks"] },
    { id: 7, name: "Box 3", dentist: "Saige Fuentes", tasksCount: 4, status: "openstaand", types: ["Wekelijks", "Maandelijks"] },
    { id: 8, name: "Box 4", dentist: "Saige Fuentes", tasksCount: 8, status: "openstaand", types: ["Ochtend", "Wekelijks"] },
    { id: 9, name: "Box 2", dentist: "Saige Fuentes", tasksCount: 6, status: "voltooid", types: ["Avond", "Wekelijks"] },
    { id: 10, name: "Box 3", dentist: "Saige Fuentes", tasksCount: 4, status: "openstaand", types: ["Ochtend", "Maandelijks"] },
    { id: 11, name: "Box 2", dentist: "Saige Fuentes", tasksCount: 6, status: "voltooid", types: ["Ochtend", "Wekelijks"] },
    { id: 12, name: "Box 4", dentist: "Saige Fuentes", tasksCount: 8, status: "openstaand", types: ["Ochtend", "Wekelijks", "Maandelijks"] },
  ];

  return (
    <div className="min-h-screen bg-[#E5DCE7]">
      <Topbar />

      <main className="max-w-6xl mx-auto py-8 px-6 space-y-6">
        {/* Zelfde navbar design als dashboard */}
        <AssistentNavBar />

        {/* Titel “Alle Boxen” zoals in prototype */}
        <section className="bg-white rounded-3xl p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900 mb-4">
            Alle Boxen
          </h1>

          {/* Boxen + filters sectie (hergebruikt BoxList design) */}
          <BoxList boxes={boxes} />
        </section>
      </main>
    </div>
  );
}

export default MijnBoxen;