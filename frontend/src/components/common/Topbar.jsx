import React from "react";
import { useNavigate } from "react-router-dom";

function Topbar() {
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/afdelingshoofd/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }
  return (
    <header className="bg-[#4A2144] text-white px-12 py-3 flex items-center justify-between">
      
      {/* Left: logo + name */}
      <div className="flex items-center gap-4">
        {/* Clickable Logo */}
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

      {/* Right: user card + logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-gray-100 text-black rounded-full px-4 py-1">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-semibold">
            ME
          </div>
          <div className="ml-2 leading-tight">
            <div className="font-semibold">Steve Jabs</div>
            <div className="text-xs text-gray-600">Afdelingshoofd</div>
          </div>
        </div>

        <button
        onClick={handleLogout}
         className="bg-white text-black font-semibold rounded-lg px-5 py-2 shadow-sm">
          Uitloggen
        </button>
      </div>
    </header>
  );
}

export default Topbar;
