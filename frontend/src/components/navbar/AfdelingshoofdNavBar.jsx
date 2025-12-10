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
    // INSTELLING FOR LATER 
    // { key: "settings", label: "Instellingen" },
  ];

  // determine which tab is active from the current URL
  const path = location.pathname;
  let activeKey = "dashboard";
  if (path.includes("mijn-personeel")) activeKey = "staff";
  // INSTELLING FOR LATER 
  // if (path.includes("instellingen")) activeKey = "settings";

  const handleChange = (key) => {
    if (key === "dashboard") navigate("/afdelingshoofd/dashboard");
    if (key === "staff") navigate("/afdelingshoofd/mijn-personeel");
    // INSTELLING FOR LATER 
   // if (key === "settings") navigate("/afdelingshoofd/instellingen"); // future page
  };

  return (
    <NavBar
      items={items}
      activeKey={activeKey}
      onChange={handleChange}
      showInstructions={false}
    />
  );
}

export default AfdelingshoofdNavBar;
