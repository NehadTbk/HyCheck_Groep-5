import React, { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import VerantwoordelijkeNavBar from "../../components/navbar/VerantwoordelijkeNavBar";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Format date as YYYY-MM-DD without timezone issues
function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateWeekDays(weekStart, language) {
  const locale = language === "nl" ? "nl-BE" : "fr-BE";

  return Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);

    const weekday = d.toLocaleDateString(locale, { weekday: "long" });

    return {
      datumISO: formatDateLocal(d),
      dagNaam: weekday.charAt(0).toUpperCase() + weekday.slice(1),
      datumLabel: d.toLocaleDateString(locale, {
        day: "2-digit",
        month: "2-digit",
      }),
    };
  });
}

const typeColors = {
  Ochtend: "bg-blue-100 text-blue-700 border-blue-300",
  Avond: "bg-purple-100 text-purple-700 border-purple-300",
  Wekelijks: "bg-orange-100 text-orange-700 border-orange-300",
  Maandelijks: "bg-yellow-100 text-yellow-700 border-yellow-300",
  ochtend: "bg-blue-100 text-blue-700 border-blue-300",
  avond: "bg-purple-100 text-purple-700 border-purple-300",
  wekelijks: "bg-orange-100 text-orange-700 border-orange-300",
  maandelijks: "bg-yellow-100 text-yellow-700 border-yellow-300",
};

function VerantwoordelijkeDashboard() {
  const { language, letLanguage } = useLanguage();
  const { t } = useTranslation();

  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [dagen, setDagen] = useState([]);
  const [planning, setPlanning] = useState({});
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  useEffect(() => {
    setDagen(generateWeekDays(weekStart, language));
  }, [weekStart, language]);

  async function fetchWeekData() {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/calendar?weekStart=${formatDateLocal(weekStart)}`
      );
      if (!res.ok) {
        console.error("GET /api/calendar failed", await res.text());
        return;
      }
      const data = await res.json();

      const newPlanning = {};
      const rawPlanning = data.planning || {};
      for (const [dateKey, boxesMap] of Object.entries(rawPlanning)) {
        newPlanning[dateKey] = [];
        for (const [boxId, assignment] of Object.entries(boxesMap || {})) {
          // normalize fields for frontend
          const rawAssistant = assignment.assistant_name || assignment.assistant || "";
          const assistantFirst = rawAssistant ? String(rawAssistant).split(" ")[0] : null;

          const normalized = {
            ...assignment,
            box_id: Number(boxId),
            shift_date: assignment.shift_date || dateKey,
            assistant_name: assignment.assistant_name || assignment.assistant || null,
            assistant_first: assistantFirst,
            dentist_name: assignment.dentist_name || assignment.dentist || null,
            box_color: assignment.box_color || assignment.color_code || null,
            task_groups: assignment.task_groups || [],
          };

          newPlanning[dateKey].push(normalized);
        }
        // sort by box_id
        newPlanning[dateKey].sort((a, b) => (a.box_id || 0) - (b.box_id || 0));
      }

      setPlanning(newPlanning);
    } catch (err) {
      console.error("Fout bij laden agenda:", err);
    }
  }

  useEffect(() => {
    fetchWeekData();
    const handler = () => fetchWeekData();
    window.addEventListener("calendarUpdated", handler);
    return () => window.removeEventListener("calendarUpdated", handler);
  }, [weekStart]);

  const changeWeek = (direction) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + direction * 7);
    setWeekStart(d);
  };

  const handleDeleteAssignment = async () => {
    if (!selectedAssignment?.assignment_id) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/assignments/${selectedAssignment.assignment_id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete");
      }

      setSelectedAssignment(null);
      fetchWeekData();
      window.dispatchEvent(new Event("calendarUpdated"));
    } catch (err) {
      console.error("Delete error:", err);
      setInfoMsg(`${t("errors.generic") || "Fout bij verwijderen"}: ${err.message}`);
      setTimeout(() => setInfoMsg(""), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "";
    return time.substring(0, 5);
  };

  return (
    <PageLayout>
      <VerantwoordelijkeNavBar />
      <div className="p-6 bg-white rounded-xl shadow-lg min-h-[500px] overflow-x-auto">
      {infoMsg && (
        <div className="fixed top-[240px] left-1/2 transform -translate-x-1/2 z-[9999]">
          <div className="bg-[#FEE2E2] text-[#B91C1C] px-6 py-2 rounded-lg shadow-sm border border-[#FCA5A5] flex items-center gap-3 font-medium text-sm">
            <div className="w-5 h-5 rounded-full border-2 border-[#EF4444] flex items-center justify-center text-[#EF4444] bg-white text-[10px] font-black">
              !
            </div>
            {infoMsg}
          </div>
        </div>
      )}
        <h1 className="text-3xl font-bold text-gray-800 pb-3 mb-6 border-b border-gray-300">{t("verantwoordelijkeDashboard.title")}</h1>

        <div className="flex space-x-6 text-2xl mb-4">
          <button onClick={() => changeWeek(-1)} className="text-gray-600 hover:text-[#582F5B]">&lt;</button>
          <button onClick={() => changeWeek(1)} className="text-gray-600 hover:text-[#582F5B]">&gt;</button>
        </div>

        <div className="grid grid-cols-5 gap-3 min-w-[900px]">
          {dagen.map((dag) => {
            const dayAssignments = planning[dag.datumISO] || [];

            // Sorteer assignments op box_id numeriek
            dayAssignments.sort((a, b) => a.box_id - b.box_id);

            return (
              <div key={dag.datumISO} className="flex flex-col space-y-2">
                <div className="bg-gray-50 border border-gray-300 p-2 text-center rounded-lg">
                  <div className="text-sm font-medium text-gray-600">{dag.dagNaam}</div>
                  <div className="text-lg font-bold text-gray-900">{dag.datumLabel}</div>
                </div>

                {dayAssignments.length > 0 ? (
                  dayAssignments.map((assignment) => {
                    const label = (() => {
                      const raw = assignment.task_groups;
                      const groups = Array.isArray(raw)
                        ? raw
                        : raw
                          ? String(raw).split(",")
                          : [];

                      if (groups.length === 0) return "O";

                      return groups
                        .map((g) => {
                          const key = String(g).trim();
                          switch (key) {
                            case "ochtend":
                              return "O";
                            case "avond":
                              return "A";
                            case "wekelijks":
                              return "W";
                            case "maandelijks":
                              return "M";
                            default:
                              return key.charAt(0).toUpperCase() || "?";
                          }
                        })
                        .join("+");
                    })();

                    const taskGroups = Array.isArray(assignment.task_groups)
                      ? assignment.task_groups
                      : assignment.task_groups
                        ? String(assignment.task_groups).split(",")
                        : [];

                    // Check task types to determine how to display time/period
                    const hasTimeTasks = taskGroups.some(g => g.trim() === "ochtend" || g.trim() === "avond");
                    const hasWekelijks = taskGroups.some(g => g.trim() === "wekelijks");
                    const hasMaandelijks = taskGroups.some(g => g.trim() === "maandelijks");
                    const hasDateTasks = hasWekelijks || hasMaandelijks;

                    const calculateDeadline = () => {
                      const baseDate = new Date(dag.datumISO);
                      if (hasMaandelijks) {
                        baseDate.setDate(baseDate.getDate() + 7); // 1 week
                      } else if (hasWekelijks) {
                        baseDate.setDate(baseDate.getDate() + 3); // 3 days
                      }
                      return baseDate.toLocaleDateString("nl-BE", { day: "2-digit", month: "2-digit" });
                    };

                    return (
                      <div
                        key={`${dag.datumISO}-${assignment.box_id}-${assignment.start_time}`}
                        onClick={() => setSelectedAssignment({ ...assignment, date: dag.datumISO, dagNaam: dag.dagNaam })}
                        className="p-3 rounded-md border border-gray-300 bg-gray-100 flex flex-col justify-between min-h-[85px] cursor-pointer hover:shadow-md hover:bg-gray-200 transition-all"
                      >
                        <div>
                          <div className="font-bold text-sm text-gray-800">{t("verantwoordelijkeDashboard.secondTitle")} {assignment.box_id}</div>
                          {hasTimeTasks && (
                            <div className="text-xs text-gray-600">{formatTime(assignment.start_time)}</div>
                          )}
                          {hasDateTasks && !hasTimeTasks && (
                            <div className="text-xs text-gray-600">{t("verantwoordelijkeDashboard.deadline")} {calculateDeadline()}</div>
                          )}
                          <div className="text-xs text-gray-700 mt-0.5">{assignment.assistant_name}</div>
                        </div>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {taskGroups.map((group) => {
                            const key = group.trim();
                            const groupLabel = t(`taskTypes.${key}`);
                            const groupColor = typeColors[group.trim()] || "bg-gray-100 text-gray-700 border-gray-300";
                            return (
                              <span
                                key={group}
                                className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${groupColor}`}
                              >
                                {groupLabel}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 border rounded-md text-gray-500 text-center">
                    {t("verantwoordelijkeDashboard.noAssignments")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-200">
            {/* Header */}
            <div className="p-4 rounded-t-lg bg-[#582F5B] text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {t("verantwoordelijkeDashboard.detailTitle")} {selectedAssignment.box_id}
              </h2>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="hover:bg-white/20 p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {(() => {
                const groups = selectedAssignment.task_groups || [];
                const hasOchtend = groups.some(g => g.trim() === "ochtend");
                const hasAvond = groups.some(g => g.trim() === "avond");
                const hasWekelijks = groups.some(g => g.trim() === "wekelijks");
                const hasMaandelijks = groups.some(g => g.trim() === "maandelijks");

                const calculateDeadline = (days) => {
                  const baseDate = new Date(selectedAssignment.date);
                  baseDate.setDate(baseDate.getDate() + days);
                  return baseDate.toLocaleDateString("nl-BE", { day: "2-digit", month: "2-digit", year: "numeric" });
                };

                return (
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 text-sm">{t("verantwoordelijkeDashboard.date")}</span>
                      <p className="font-medium">
                        {selectedAssignment.dagNaam}, {new Date(selectedAssignment.date).toLocaleDateString("nl-BE")}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500 text-sm">{t("verantwoordelijkeDashboard.taskTypes")}</span>
                      <div className="space-y-2 mt-2">
                        {hasOchtend && (
                          <div className="flex justify-between items-center">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border font-bold ${typeColors.ochtend}`}>
                              {t("taskTypes.ochtend")}
                            </span>
                            <span className="font-medium text-sm">08:00 - 12:00</span>
                          </div>
                        )}
                        {hasAvond && (
                          <div className="flex justify-between items-center">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border font-bold ${typeColors.avond}`}>
                              {t("taskTypes.avond")}
                            </span>
                            <span className="font-medium text-sm">13:00 - 17:00</span>
                          </div>
                        )}
                        {hasWekelijks && (
                          <div className="flex justify-between items-center">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border font-bold ${typeColors.wekelijks}`}>
                              {t("taskTypes.wekelijks")}
                            </span>
                            <span className="font-medium text-sm">{calculateDeadline(3)}</span>
                          </div>
                        )}
                        {hasMaandelijks && (
                          <div className="flex justify-between items-center">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border font-bold ${typeColors.maandelijks}`}>
                              {t("taskTypes.maandelijks")}
                            </span>
                            <span className="font-medium text-sm">{calculateDeadline(7)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {selectedAssignment.assistant_name && (
                <div>
                  <span className="text-gray-500 text-sm">{t("verantwoordelijkeDashboard.assistant")}</span>
                  <p className="font-medium">{selectedAssignment.assistant_name}</p>
                </div>
              )}

              {selectedAssignment.dentist_name && (
                <div>
                  <span className="text-gray-500 text-sm">{t("verantwoordelijkeDashboard.dentist")}</span>
                  <p className="font-medium">{selectedAssignment.dentist_name}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex justify-between">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                {t("verantwoordelijkeDashboard.close")}
              </button>
              <button
                onClick={handleDeleteAssignment}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 size={16} />
                {isDeleting ? t("verantwoordelijkeDashboard.deleting") : t("verantwoordelijkeDashboard.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default VerantwoordelijkeDashboard;
