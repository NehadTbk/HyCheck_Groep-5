import React from "react";
import { useNavigate } from "react-router-dom";

function Topbar() {
  const navigate = useNavigate();

  //User ophalen
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const roleMap = {
    assistant: "Assistent",
    responsible: "Verantwoordelijke",
    admin: "Afdelingshoofd",
  };

  //Initialen vormen
  const getInitials = () => {
    if (!user) return "ME";

    const fullName =
      user.fullName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim();

    if (!fullName) return "ME";

    const parts = fullName.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  //(Home) navigatie per rol
  const goHome = () => {
    if (!user?.role) {
      navigate("/login");
      return;
    }

    switch (user.role) {
      case "assistant":
        navigate("/assistant/dashboard");
        break;
      case "responsible":
        navigate("/verantwoordelijke/dashboard");
        break;
      case "admin":
        navigate("/afdelingshoofd/dashboard");
        break;
      default:
        navigate("/login");
    }
  };

  //Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-[#4A2144] text-white px-12 py-3 flex items-center justify-between">

      {/* Links */}
      <div className="flex items-center gap-4">
        <button
          onClick={goHome}
          className="cursor-pointer bg-white rounded-md w-16 h-16 flex items-center justify-center shadow-sm hover:shadow-md transition"
        >
          <img
            src="/hycheck-logo.png"
            alt="HyCheck logo"
            className="w-14 h-14 object-contain"
          />
        </button>
        <span className="text-lg font-semibold">HyCheck</span>
      </div>

      {/* Rechts */}
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-gray-100 text-black rounded-full px-4 py-1">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-semibold">
            {getInitials()}
          </div>
          <div className="ml-2 leading-tight">
            <div className="font-semibold">
              {user?.fullName ||
                `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                "Gast"}
            </div>
            <div className="text-xs text-gray-600">
              {roleMap[user?.role] || ""}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="
            bg-white text-black font-semibold rounded-lg px-5 py-2 shadow-sm cursor-pointer transition hover:bg-gray-200 hover:shadow-md"
        >
          Uitloggen
        </button>
      </div>
    </header>
  );
}

export default Topbar;
