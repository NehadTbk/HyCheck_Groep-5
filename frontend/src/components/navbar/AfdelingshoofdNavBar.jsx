// src/components/navbar/AfdelingshoofdNavBar.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

function AfdelingshoofdNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { key: "dashboard", label: "Dashboard" },
    { key: "staff", label: "Mijn Personeel" },
    // { key: "settings", label: "Instellingen" },
  ];

  const path = location.pathname;
  let activeKey = "dashboard";
  if (path.includes("mijn-personeel")) activeKey = "staff";

  const handleChange = (key) => {
    if (key === "dashboard") navigate("/afdelingshoofd/dashboard");
    if (key === "staff") navigate("/afdelingshoofd/mijn-personeel");
  };

  return (
    <div className="w-full bg-white rounded-xl px-10 py-4 shadow-sm">
      <NavBar
        items={items}
        activeKey={activeKey}
        onChange={handleChange}
        showInstructions={false}
      />
    </div>
  );
}

export default AfdelingshoofdNavBar;
