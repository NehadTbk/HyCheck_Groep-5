import React, { useEffect, useState } from "react";
import { fetchHistory, fetchHistoryDetails } from "../services/historyService";

function HistoryAll() {
  const token = localStorage.getItem("token");

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [selectedSession, setSelectedSession] = useState(null);
  const [details, setDetails] = useState([]);

  useEffect(() => {
    if (!token) return;

    fetchHistory({ token, from, to, q })
      .then(setRows)
      .catch((e) => console.error("history fetch error:", e));
  }, [token, from, to, q]);

  const openDetails = async (sessionId) => {
    setSelectedSession(sessionId);
    const d = await fetchHistoryDetails({ token, sessionId });
    setDetails(d);
  };

  const closeDetails = () => {
    setSelectedSession(null);
    setDetails([]);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Historiek</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="border rounded-md p-2"
          placeholder="Zoek box/naam..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <input
          className="border rounded-md p-2"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />

        <input
          className="border rounded-md p-2"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-auto border rounded-lg">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Datum</th>
              <th className="text-left p-3">Box</th>
              <th className="text-left p-3">Assistent</th>
              <th className="text-left p-3">Tandarts</th>
              <th className="text-left p-3">Taken</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Acties</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.session_id} className="border-t">
                <td className="p-3">{r.date}</td>
                <td className="p-3">{r.box_name}</td>
                <td className="p-3">{r.assistant_name || "-"}</td>
                <td className="p-3">{r.dentist_name || "-"}</td>
                <td className="p-3">
                  {r.done_tasks}/{r.total_tasks}
                </td>
                <td className="p-3">{r.session_status}</td>
                <td className="p-3">
                  <button
                    className="px-3 py-1 rounded-md bg-purple-600 text-white"
                    onClick={() => openDetails(r.session_id)}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={7}>
                  Geen historiek gevonden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal (simple) */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Sessiedetails #{selectedSession}</h2>
              <button className="text-gray-600" onClick={closeDetails}>
                Sluiten
              </button>
            </div>

            <div className="space-y-2">
              {details.map((d) => (
                <div key={d.status_id} className="border rounded-md p-3">
                  <div><b>task_type_id:</b> {d.task_type_id}</div>
                  <div><b>completed:</b> {d.completed ? "ja" : "nee"}</div>
                  <div><b>comment:</b> {d.common_comment || d.custom_comment || "-"}</div>
                </div>
              ))}

              {details.length === 0 && (
                <div className="text-gray-500">Geen taken gevonden voor deze sessie.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryAll;
