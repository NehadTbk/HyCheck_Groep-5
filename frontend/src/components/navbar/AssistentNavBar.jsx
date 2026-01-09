import React from "react";
import { useLocation } from "react-router-dom";
import BaseNavBar from "../layout/BaseNavBar";
import { useTranslation } from "../../i18n/useTranslation";

function AssistentNavBar() {
  const location = useLocation();
  const { t } = useTranslation();


  const items = [
    {
      key: "dashboard",
      label: t("assistentNav.dashboard"),
      href: "/assistant/dashboard",
      active: location.pathname === "/assistant/dashboard",
    },
    {
      key: "boxes",
      label: t("assistentNav.boxes"),
      href: "/assistant/mijn-boxen",
      active: location.pathname === "/assistant/mijn-boxen",
    },
    {
      key: "history",
      label: t("assistentNav.history"),
      href: "/assistant/historiek",
      active: location.pathname === "/assistant/historiek",
    },
  ];

  return (
    <BaseNavBar
      items={items}
      showInstructions={true}
      showNotifications={true}
      activeColor="#C1A9CF"
      activeTextColor="#2C1E33"
      instructiesHref="/instructies"
    />
  );
}

export default AssistentNavBar;
