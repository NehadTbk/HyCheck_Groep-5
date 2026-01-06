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

  const handleDirectCheck = (id) => {
    setBoxes(prev => prev.map(box => 
      box.id === id ? { ...box, status: box.status === "voltooid" ? "openstaand" : "voltooid" } : box
    ));
  };

  const handleToggleTask = (boxId, taskId) => {
    setTasksState(prev => ({
      ...prev,
      [boxId]: { ...prev[boxId], [taskId]: !prev[boxId]?.[taskId] }
    }));
  };

  const handleSaveTasks = (boxId) => {
    const currentBox = boxes.find(b => b.id === boxId);
    const boxTasks = tasksState[boxId] || {};
    const completedCount = Object.values(boxTasks).filter(v => v === true).length;
    
    let newStatus = "openstaand";
    if (completedCount >= currentBox.tasksCount) {
      newStatus = "voltooid";
    } else if (completedCount > 0) {
      newStatus = "gedeeltelijk";
    }

    setBoxes(prev => prev.map(b => b.id === boxId ? { ...b, status: newStatus } : b));
    setSelectedBox(null);
  };

  return (
    <PageLayout mainClassName="max-w-6xl mx-auto py-8 px-6 space-y-6">
      <AssistentNavBar />
        <section className="bg-white rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 pb-3 mb-6 border-b border-gray-300">Alle Boxen</h1>
          <BoxList 
            boxes={boxes} 
            onBoxCheck={handleDirectCheck} 
            onBoxClick={(box) => setSelectedBox(box)} 
          />
        </section>

      {selectedBox && (
        <TaskModal
          box={selectedBox}
          tasksState={tasksState}
          onToggleTask={handleToggleTask}
          onSave={handleSaveTasks}
          onClose={() => setSelectedBox(null)}
        />
      )}
    </PageLayout>
  );
}

export default MijnBoxen;