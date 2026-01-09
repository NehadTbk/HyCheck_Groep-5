import React, { useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import AssistentNavBar from "../../components/navbar/AssistentNavBar";
import BoxList from "../../components/Assistent/BoxList";
import TaskModal from "../../components/Assistent/TaskModal";

function MijnBoxen() {
  const [boxes, setBoxes] = useState([
    { id: 1, name: "Box 1", dentist: "Saige Fuentes", tasksCount: 2, status: "voltooid", types: ["Ochtend"] },
    { id: 2, name: "Box 2", dentist: "Saige Fuentes", tasksCount: 6, status: "voltooid", types: ["Avond", "Wekelijks", "Maandelijks"] },
    { id: 3, name: "Box 3", dentist: "Saige Fuentes", tasksCount: 4, status: "openstaand", types: ["Avond", "Wekelijks"] },
    { id: 4, name: "Box 4", dentist: "Saige Fuentes", tasksCount: 8, status: "openstaand", types: ["Ochtend", "Wekelijks", "Maandelijks"] },
    { id: 5, name: "Box 5", dentist: "Saige Fuentes", tasksCount: 2, status: "voltooid", types: ["Avond"] },
    { id: 6, name: "Box 6", dentist: "Saige Fuentes", tasksCount: 6, status: "voltooid", types: ["Ochtend", "Maandelijks"] },
    { id: 7, name: "Box 7", dentist: "Saige Fuentes", tasksCount: 4, status: "openstaand", types: ["Wekelijks", "Maandelijks"] },
    { id: 8, name: "Box 8", dentist: "Saige Fuentes", tasksCount: 8, status: "openstaand", types: ["Ochtend", "Wekelijks"] },
  ]);

  const [selectedBox, setSelectedBox] = useState(null);
  const [tasksState, setTasksState] = useState({});

  const handleToggleTask = (boxId, taskId) => {
    setTasksState(prev => ({
      ...prev,
      [boxId]: { ...prev[boxId], [taskId]: !prev[boxId]?.[taskId] }
    }));
  };

  const handleSaveTasks = async (boxId, selectedOptionId, customText) => {
    // We bouwen de payload op voor de backend
    const payload = {
      session_id: boxId,
      task_type_id: 999, // Jouw nieuwe Algemene Schoonmaak taak ID
      selected_option_id: selectedOptionId || null, 
      custom_text: customText && customText.trim() !== "" ? customText : null,
      completed: 0 
    };

    try {
      const response = await apiFetch(":5001/api/tasks/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSelectedBox(null);
        // Zet status lokaal op openstaand in de lijst
        setBoxes(prev => prev.map(b => b.id === boxId ? { ...b, status: "openstaand" } : b));
      }
    } catch (error) {
      console.error("Opslaan mislukt:", error);
    }
  };

  return (
    <PageLayout mainClassName="max-w-6xl mx-auto py-8 px-6 space-y-6">
      <AssistentNavBar />
      <section className="bg-white rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 pb-3 mb-6 border-b border-gray-300">Alle Boxen</h1>
        <BoxList 
          boxes={boxes} 
          onBoxCheck={(id) => setBoxes(prev => prev.map(box => box.id === id ? { ...box, status: box.status === "voltooid" ? "openstaand" : "voltooid" } : box))} 
          onBoxClick={(box) => setSelectedBox(box)} 
        />
      </section>

      {selectedBox && (
        <TaskModal
          box={selectedBox}
          tasksState={tasksState}
          onToggleTask={handleToggleTask}
          onSave={handleSaveTasks} // Hier worden boxId, optionId en text doorgegeven
          onClose={() => setSelectedBox(null)}
        />
      )}
    </PageLayout>
  );
}

export default MijnBoxen;