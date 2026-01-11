import React, { useEffect, useMemo, useState } from "react";
import { X, CheckCircle2, Clock, Circle } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

const API_BASE = "http://localhost:5001/api/history";

const getToken = () => localStorage.getItem("token");

function HistoryModal({ data, onClose }) {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const token = useMemo(() => getToken(), []);

  const sessionId = data?.meta?.sessionId ?? data?.sessionId ?? data?.id;

  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!data) return;
    if (!sessionId) {
      setErrorMsg("Geen sessionId gevonden.");
      return;
    }

    const loadDetails = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await fetch(`${API_BASE}/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Details fetch failed (${res.status}): ${txt}`);
        }

        const details = await res.json();

        // Map DB rows -> jouw UI task model
        const mapped = (Array.isArray(details) ? details : []).map((d) => ({
          id: d.status_id,
          title: `Task ${d.task_type_id}`, // later kan je hier task_type.name joinen
          status: d.completed ? "voltooid" : "niet voltooid",
          time: d.completed_at
            ? new Date(d.completed_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          comment: d.common_comment || d.custom_comment || "",
        }));

        setTasks(mapped);
      } catch (e) {
        console.error(e);
        setErrorMsg("Kon details niet laden.");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [data, sessionId, token]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t("historyModal.title")} {data.boxNr}
            </h2>
            <p className="text-sm text-gray-500">{data.date}</p>

            {/* Extra info (optioneel) */}
            {data?.meta?.assistant && (
              <p className="text-xs text-gray-500 mt-1">
                {data.meta.assistant} {data.meta.dentist ? `• ${data.meta.dentist}` : ""}
              </p>
            )}
          </div>

          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest">
            {t("historyModal.tasks")}
          </h3>

          {loading && <div className="text-sm text-gray-500">Details laden…</div>}
          {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}

          {!loading && !errorMsg && (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-white shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    {task.status === "voltooid" ? (
                      <CheckCircle2 className="text-green-500" size={20} />
                    ) : (
                      <Circle className="text-gray-300" size={20} />
                    )}

                    <div>
                      <span
                        className={`font-medium ${
                          task.status === "niet voltooid" ? "text-gray-400" : "text-gray-700"
                        }`}
                      >
                        {task.title}
                      </span>

                      {task.comment ? (
                        <div className="text-xs text-gray-400 mt-1">{task.comment}</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                    <Clock size={14} />
                    <span>{task.time}</span>
                  </div>
                </div>
              ))}

              {tasks.length === 0 && (
                <div className="text-sm text-gray-500">Geen taken gevonden.</div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end">
          <button className="bg-[#5C2D5F] text-white px-8 py-2.5 rounded-xl font-bold" onClick={onClose}>
            {t("historyModal.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HistoryModal;
