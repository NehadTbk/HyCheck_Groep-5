import axios from "axios";

const API_BASE = "http://localhost:5001/api/history";

export async function fetchHistory({ token, from, to, q, boxId }) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  if (q) params.q = q;
  if (boxId) params.boxId = boxId;

  const res = await axios.get(API_BASE, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}

export async function fetchHistoryDetails({ token, sessionId }) {
  const res = await axios.get(`${API_BASE}/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}
