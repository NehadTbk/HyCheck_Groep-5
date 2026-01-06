import React, { useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import AssistentNavBar from "../components/navbar/AssistentNavBar";
import VerantwoordelijkeNavBar from "../components/navbar/VerantwoordelijkeNavBar";
import AfdelingshoofdNavBar from "../components/navbar/AfdelingshoofdNavBar";
import { BookOpen, Edit2, Save, X, Image as ImageIcon } from "lucide-react";

const IMG_BASE = "/instructions"; // -> frontend/public/instructions

function Instructies() {
  const [isEditing, setIsEditing] = useState(false);

  const [instructions, setInstructions] = useState({
    title: "Instructies",
    tasks: [
      { nr: 1, group: "Ochtend", title: "Filters", lines: ["Reinig de voorfilters."], images: ["task-1.png"] },
      {
        nr: 2,
        group: "Ochtend",
        title: "Waterleidingen – Lange spoeling",
        lines: [
          "Plaats alle instrumenten die water gebruiken in de spoelhouder.",
          "Buig de handstukken in een hoek van minstens 90° en start de lange spoeling.",
        ],
        images: ["task-2.png"],
      },
      {
        nr: 3,
        group: "Einde van de dag",
        title: "Oppervlakken",
        lines: ["Reinig de bekleding met een desinfectiemiddel dat door Planmeca is goedgekeurd."],
        images: ["task-3.png"],
      },
      {
        nr: 4,
        group: "Einde van de dag",
        title: "Afzuigsysteem – Reiniging van de afzuigslangen",
        lines: [
          "Plaats de afzuigslangen in de houder.",
          "Start de reiniging van de afzuigslangen.",
          "Desinfecteer de afzuigonderdelen in een thermodesinfector.",
        ],
        images: ["task-4.png"],
      },
      {
        nr: 5,
        group: "Einde van de dag",
        title: "Speekselopvangbak (Crachot)",
        lines: [
          "Leeg en reinig het filter.",
          "Leeg het filter niet in de afvoer!",
          "Vul met water tot max. 65°C.",
        ],
        images: ["task-5.png"],
      },
      {
        nr: 6,
        group: "Elke week",
        title: "MD555 cleaner – Wekelijkse reiniging",
        lines: [
          "Gebruik MD 555 cleaner.",
          "1–2 liter oplossing via Orcosy.",
          "Laat 30 min–2 uur inwerken.",
          "Spoel met 2 liter water.",
        ],
        images: ["task-6-1.png", "task-6-2.png", "task-6-3.png", "task-6-4.png"],
      },
      {
        nr: 7,
        group: "Elke maand",
        title: "Afzuigsysteem en waterleidingen",
        lines: ["Reinig spoelhouder in thermodesinfector.", "Zo nodig steriliseren in autoclaaf."],
        images: ["task-7.png"],
      },
      {
        nr: 8,
        group: "Elke maand",
        title: "Filters",
        lines: ["Vervang de voorfilters.", "Leeg de VSA-fles.", "Leeg de oliecollector."],
        images: ["task-8.png"],
      },
    ],
  });

  const [editedInstructions, setEditedInstructions] = useState(instructions);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const canEdit = user?.role === "responsible" || user?.role === "admin";

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
    setInstructions(editedInstructions);
    setIsEditing(false);
    console.log("Saving instructions:", editedInstructions);
  };

  const handleTitleChange = (e) => {
    setEditedInstructions({ ...editedInstructions, title: e.target.value });
  };

  const handleTaskChange = (taskNr, field, value) => {
    setEditedInstructions({
      ...editedInstructions,
      tasks: editedInstructions.tasks.map((t) => (t.nr === taskNr ? { ...t, [field]: value } : t)),
    });
  };

  const displayInstructions = isEditing ? editedInstructions : instructions;

  const groups = ["Ochtend", "Einde van de dag", "Elke week", "Elke maand"];

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

        {/* Tasks grouped */}
        <div className="space-y-8">
          {groups.map((groupTitle) => {
            const groupTasks = displayInstructions.tasks.filter((t) => t.group === groupTitle);
            if (groupTasks.length === 0) return null;

            return (
              <div key={groupTitle} className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{groupTitle}</h2>

                <div className="space-y-4">
                  {groupTasks.map((task) => {
                    const imgs = task.images || [];
                    return (
                      <div key={task.nr} className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
                          {/* LEFT: text */}
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#5C2D5F] text-white flex items-center justify-center text-sm font-bold shrink-0">
                              {task.nr}
                            </div>

                            <div className="flex-1">
                              {isEditing ? (
                                <input
                                  value={task.title}
                                  onChange={(e) => handleTaskChange(task.nr, "title", e.target.value)}
                                  className="w-full font-bold text-gray-800 border-b border-gray-300 focus:outline-none"
                                />
                              ) : (
                                <div className="font-bold text-gray-800">{task.title}</div>
                              )}

                              {isEditing ? (
                                <textarea
                                  value={task.lines.join("\n")}
                                  onChange={(e) =>
                                    handleTaskChange(
                                      task.nr,
                                      "lines",
                                      e.target.value.split("\n").filter((x) => x.trim() !== "")
                                    )
                                  }
                                  className="mt-2 w-full text-sm p-2 border border-gray-300 rounded-lg focus:outline-none min-h-[90px]"
                                />
                              ) : (
                                <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
                                  {task.lines.map((line, idx) => (
                                    <li key={idx}>{line}</li>
                                  ))}
                                </ul>
                              )}

                              {/* Edit image filenames */}
                              {isEditing && (
                                <div className="mt-3 text-xs text-gray-600">
                                  <div className="flex items-center gap-2 mb-2">
                                    <ImageIcon size={16} />
                                    <span>Afbeeldingen (filenames in /public/instructions)</span>
                                  </div>
                                  <textarea
                                    value={imgs.join("\n")}
                                    onChange={(e) =>
                                      handleTaskChange(
                                        task.nr,
                                        "images",
                                        e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
                                      )
                                    }
                                    placeholder={"task-1.png\n(1 per lijn)"}
                                    className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:outline-none min-h-[70px]"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* RIGHT: images */}
                          <div className="rounded-lg border border-gray-200 bg-white p-3">
                            {imgs.length === 0 ? (
                              <div className="text-sm text-gray-500 p-4 text-center">
                                Geen afbeelding ingesteld
                              </div>
                            ) : (
                              <div
                                className={
                                  imgs.length === 1
                                    ? "grid grid-cols-1 gap-2"
                                    : "grid grid-cols-2 gap-2"
                                }
                              >
                                {imgs.map((file, idx) => {
                                  const src = `${IMG_BASE}/${file}`;
                                  return (
                                    <div
                                      key={`${task.nr}-${idx}`}
                                      className="h-[160px] rounded-md border border-gray-200 overflow-hidden flex items-center justify-center bg-white"
                                    >
                                      <img
                                        src={src}
                                        alt={`Task ${task.nr} - ${idx + 1}`}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none";
                                          e.currentTarget.parentElement.innerHTML =
                                            `<div class="text-xs text-gray-500 p-2 text-center">Niet gevonden:<br/>${src}</div>`;
                                        }}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

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
