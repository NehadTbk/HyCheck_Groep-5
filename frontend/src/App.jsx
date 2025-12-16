import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import AfdelingshoofdDashboard from "./pages/Afdelinghoofd/AfdelingshoofdDashboard";
import AfdelingshoofdPersoneel from "./pages/Afdelinghoofd/AfdelingshoofdPersoneel";
import AfdelingshoofdCreateAccount from "./pages/Afdelinghoofd/AfdelingshoofdCreateAccount";
import AfdelingshoofdMonthlyOverview from "./pages/Afdelinghoofd/AfdelingshoofdMonthlyOverview";

// NIEUW: import voor assistent
import AssistentDashboard from "./pages/Assistent/AssistentDashboard";

import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Afdelingshoofd routes */}
        <Route
          path="/afdelingshoofd/dashboard"
          element={<AfdelingshoofdDashboard />}
        />
        <Route
          path="/afdelingshoofd/mijn-personeel"
          element={<AfdelingshoofdPersoneel />}
        />
        <Route
          path="/afdelingshoofd/account-aanmaken"
          element={<AfdelingshoofdCreateAccount />}
        />
        <Route
          path="/afdelingshoofd/overzicht-maanden"
          element={<AfdelingshoofdMonthlyOverview />}
        />

        {/* Assistent routes */}
        <Route
          path="/assistent/dashboard"
          element={<AssistentDashboard />}
        />

        {/* default: kies zelf welke user je eerst wil tonen */}
        <Route
          path="/"
          element={<Navigate to="/assistent/dashboard" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
