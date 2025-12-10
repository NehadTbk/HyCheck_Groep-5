import React, { useState } from "react";
import NavBar from "./NavBar";

function AfdelingshoofdNavBar() {
  const [active, setActive] = useState("dashboard");

  const items = [
    { key: "dashboard", label: "Dashboard" },
    { key: "staff", label: "Mijn Personeel" },
    { key: "settings", label: "Instellingen" },
  ];

  return (
    <NavBar
      items={items}
      activeKey={active}
      onChange={setActive}
      showInstructions={false}
    />
  );
}

export default AfdelingshoofdNavBar;
