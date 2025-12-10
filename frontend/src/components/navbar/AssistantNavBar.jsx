import React, { useState } from "react";
import NavBar from "./NavBar";

function AssistantNavBar() {
  const [active, setActive] = useState("dashboard");

  const items = [
    { key: "dashboard", label: "Dashboard" },
    { key: "boxes", label: "Mijn Boxen" },
    { key: "reports", label: "Rapporten" },
    { key: "settings", label: "Instellingen" },
  ];

  return (
    <NavBar
      items={items}
      activeKey={active}
      onChange={setActive}
      showInstructions={true}
    />
  );
}

export default AssistantNavBar;
