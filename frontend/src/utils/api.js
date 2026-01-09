export const API_BASE_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");

export const apiFetch = (path, options = {}) => {
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};
