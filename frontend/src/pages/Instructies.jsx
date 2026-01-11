import React, { useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import AssistentNavBar from "../components/navbar/AssistentNavBar";
import VerantwoordelijkeNavBar from "../components/navbar/VerantwoordelijkeNavBar";
import AfdelingshoofdNavBar from "../components/navbar/AfdelingshoofdNavBar";
import { BookOpen, Edit2, Save, X, Image as ImageIcon } from "lucide-react";
import LanguageSwitcher from "../components/layout/LanguageSwitcher";
import { useTranslation } from "../i18n/useTranslation";
import { useLanguage } from "../i18n/useLanguage";

const IMG_BASE = "/instructions"; // files live in: frontend/public/instructions

const GROUP_MAP = {
  morning: "Ochtend",
  endOfDay: "Einde van de dag",
  weekly: "Elke week",
  monthly: "Elke maand",
};

function Instructies() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);

  const [instructions, setInstructions] = useState({
    title: "",
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
        lines: ["Leeg en reinig het filter.", "Leeg het filter niet in de afvoer!", "Vul met water tot max. 65°C."],
        images: ["task-5.png"],
      },
      {
        nr: 6,
        group: "Elke week",
        title: "MD555 cleaner – Wekelijkse reiniging",
        lines: ["Gebruik MD 555 cleaner.", "1–2 liter oplossing via Orcosy.", "Laat 30 min–2 uur inwerken.", "Spoel met 2 liter water."],
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

const groups = ["morning", "endOfDay", "weekly", "monthly"];

  return (
    <PageLayout>
      {getNavBar()}

      <div className="p-6 bg-white rounded-xl shadow-lg min-h-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-300 pb-3">
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
              <h1 className="text-3xl font-bold text-gray-800">{t("instructions.title")}</h1>
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
                    {t('instructions.cancel')}
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    <Save size={18} />
                    {t('instructions.save')}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 bg-[#5C2D5F] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#4A2144] transition-colors"
                >
                  <Edit2 size={18} />
                  {t('instructions.edit')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tasks grouped */}
        <div className="space-y-8">
          {groups.map((groupKey) => {
            const groupTasks = displayInstructions.tasks.filter((t) => t.group === GROUP_MAP[groupKey]);
            if (groupTasks.length === 0) return null;

            return (
              <div key={groupKey} className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-5">{t(`instructions.groups.${groupKey}`)}</h2>

                <div className="space-y-5">
                  {groupTasks.map((task) => {
                    const imgs = task.images || [];
                    const isWeeklyTask6 = task.nr === 6;

                    return (
                      <div key={task.nr} className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className={isWeeklyTask6 ? "space-y-5" : "grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5"}>
                          {/* LEFT: text */}
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#5C2D5F] text-white flex items-center justify-center text-base font-bold shrink-0">
                              {task.nr}
                            </div>

                            <div className="flex-1">
                              {isEditing ? (
                                <input
                                  value={task.title}
                                  onChange={(e) => handleTaskChange(task.nr, "title", e.target.value)}
                                  className="w-full text-lg font-bold text-gray-800 border-b border-gray-300 focus:outline-none"
                                />
                              ) : (
                                <div className="text-lg font-bold text-gray-800 mb-2">{task.title}</div>
                              )}

                              {isEditing ? (
                                <textarea
                                  value={(task.lines || []).join("\n")}
                                  onChange={(e) =>
                                    handleTaskChange(
                                      task.nr,
                                      "lines",
                                      e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
                                    )
                                  }
                                  className="mt-2 w-full text-base p-2 border border-gray-300 rounded-lg focus:outline-none min-h-[90px]"
                                />
                              ) : (
                                <ul className="mt-1 list-disc pl-5 text-base text-gray-700 space-y-2 leading-relaxed">
                                  {(task.lines || []).map((line, idx) => (
                                    <li key={idx}>{line}</li>
                                  ))}
                                </ul>
                              )}

                              {/* Edit image filenames */}
                              {isEditing && (
                                <div className="mt-3 text-xs text-gray-600">
                                  <div className="flex items-center gap-2 mb-2">
                                    <ImageIcon size={16} />
                                    <span>{t('instructions.imageFiles')}</span>
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
                              <div className="text-sm text-gray-500 p-4 text-center">{t('instructions.noImages')}</div>
                            ) : (
                              <div
                                className={
                                  isWeeklyTask6
                                    ? "grid grid-cols-2 gap-3" // ✅ TASK 6 horizontal grid, 2 columns
                                    : imgs.length === 1
                                    ? "grid grid-cols-1 gap-2"
                                    : "grid grid-cols-2 gap-2"
                                }
                              >
                                {imgs.map((file, idx) => {
                                  const src = `${IMG_BASE}/${file}`;
                                  const boxHeight = isWeeklyTask6 ? "h-[200px]" : "h-[160px]";

                                  return (
                                    <div
                                      key={`${task.nr}-${idx}`}
                                      className={`${boxHeight} rounded-md border border-gray-200 overflow-hidden flex items-center justify-center bg-white`}
                                    >
                                      <img
                                        src={src}
                                        alt={`Task ${task.nr} - ${idx + 1}`}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none";
                                          const parent = e.currentTarget.parentElement;
                                          if (parent) {
                                            parent.innerHTML = `<div style="font-size:12px;color:#6b7280;padding:8px;text-align:center">
                                              Niet gevonden:<br/>${src}
                                            </div>`;
                                          }
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
          <div className="bg-blue-50 border border-blue-200 p-5 rounded-lg mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t('instructions.moreInfo')}</h3>
            <p className="text-gray-700 text-base">
              {t('instructions.contactLeader')}
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default Instructies;
