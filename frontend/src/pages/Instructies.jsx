import React, { useState, useEffect } from "react";
import PageLayout from "../components/layout/PageLayout";
import AssistentNavBar from "../components/navbar/AssistentNavBar";
import VerantwoordelijkeNavBar from "../components/navbar/VerantwoordelijkeNavBar";
import AfdelingshoofdNavBar from "../components/navbar/AfdelingshoofdNavBar";
import { BookOpen, Edit2, Save, X } from "lucide-react";

function Instructies() {
  const [isEditing, setIsEditing] = useState(false);
  const [instructions, setInstructions] = useState({
    title: "Instructies",
    sections: [
      {
        id: 1,
        title: "Sectie titel",
        content: "Voeg hier uw instructie tekst toe..."
      }
    ]
  });

  const [editedInstructions, setEditedInstructions] = useState(instructions);

  // Get user from localStorage
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  // Check if user can edit (responsible or admin)
  const canEdit = user?.role === "responsible" || user?.role === "admin";

  // Get appropriate navbar based on role
  const getNavBar = () => {
    switch (user?.role) {
      case "assistant":
        return <AssistentNavBar />;
      case "responsible":
        return <VerantwoordelijkeNavBar />;
      case "admin":
        return <AfdelingshoofdNavBar />;
      default:
        return null;
    }
  };

  const handleEdit = () => {
    setEditedInstructions(instructions);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedInstructions(instructions);
    setIsEditing(false);
  };

  const handleSave = () => {
    // TODO: Save to backend/database
    setInstructions(editedInstructions);
    setIsEditing(false);
    // Here you would typically make an API call to save the instructions
    console.log("Saving instructions:", editedInstructions);
  };

  const handleTitleChange = (e) => {
    setEditedInstructions({
      ...editedInstructions,
      title: e.target.value
    });
  };

  const handleSectionChange = (sectionId, field, value) => {
    setEditedInstructions({
      ...editedInstructions,
      sections: editedInstructions.sections.map(section =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    });
  };

  const addSection = () => {
    const newSection = {
      id: Date.now(),
      title: "Nieuwe sectie",
      content: "Voeg hier de instructies toe..."
    };
    setEditedInstructions({
      ...editedInstructions,
      sections: [...editedInstructions.sections, newSection]
    });
  };

  const removeSection = (sectionId) => {
    setEditedInstructions({
      ...editedInstructions,
      sections: editedInstructions.sections.filter(section => section.id !== sectionId)
    });
  };

  const displayInstructions = isEditing ? editedInstructions : instructions;

  return (
    <PageLayout>
      {getNavBar()}

      <div className="p-6 bg-white rounded-xl shadow-lg mt-4 min-h-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-300 pb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="text-[#5C2D5F]" size={32} />
            {isEditing ? (
              <input
                type="text"
                value={displayInstructions.title}
                onChange={handleTitleChange}
                className="text-3xl font-bold text-gray-800 border-b-2 border-[#5C2D5F] focus:outline-none"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-800">{displayInstructions.title}</h1>
            )}
          </div>

          {/* Edit/Save buttons - only for responsible and admin */}
          {canEdit && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    <X size={18} />
                    Annuleren
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    <Save size={18} />
                    Opslaan
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 bg-[#5C2D5F] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#4A2144] transition-colors"
                >
                  <Edit2 size={18} />
                  Aanpassen
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {displayInstructions.sections.map((section) => (
            <div key={section.id} className="bg-gray-50 p-6 rounded-xl relative">
              {isEditing && (
                <button
                  onClick={() => removeSection(section.id)}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                  title="Verwijder sectie"
                >
                  <X size={20} />
                </button>
              )}

              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionChange(section.id, "title", e.target.value)}
                    className="text-xl font-bold text-gray-800 w-full border-b-2 border-[#5C2D5F] focus:outline-none bg-transparent"
                    placeholder="Sectie titel"
                  />
                  <textarea
                    value={section.content}
                    onChange={(e) => handleSectionChange(section.id, "content", e.target.value)}
                    className="text-gray-700 text-sm w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5C2D5F] min-h-[100px]"
                    placeholder="Sectie inhoud"
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{section.title}</h3>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{section.content}</p>
                </>
              )}
            </div>
          ))}

          {/* Add section button - only in edit mode */}
          {isEditing && (
            <button
              onClick={addSection}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-500 hover:border-[#5C2D5F] hover:text-[#5C2D5F] transition-colors"
            >
              + Nieuwe sectie toevoegen
            </button>
          )}
        </div>

        {/* Info section */}
        {!isEditing && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-8">
            <h3 className="font-bold text-gray-800 mb-2">Meer informatie nodig?</h3>
            <p className="text-gray-700 text-sm">
              Neem contact op met uw leidinggevende als u vragen heeft of hulp nodig heeft bij het uitvoeren van uw taken.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default Instructies;
