import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AfdelingshoofdDashboard from "./pages/Afdelinghoofd/AfdelingshoofdDashboard";
import AfdelingshoofdPersoneel from "./pages/Afdelinghoofd/AfdelingshoofdPersoneel";
import AfdelingshoofdCreateAccount from "./pages/Afdelinghoofd/AfdelingshoofdCreateAccount";
import AfdelingshoofdMonthlyOverview from "./pages/Afdelinghoofd/AfdelingshoofdMonthlyOverview";
import VerantwoordelijkeDashboard from "./pages/Verantwoordelijke/VerantwoordelijkeDashboard";
import VerantwoordelijkePersoneel from "./pages/Verantwoordelijke/VerantwoordelijkePersoneel";

import "./index.css";
import Login from "./pages/Login";


function App() {
  return (
    <Router>
      <Routes>
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

        {/* default */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />
        <Route
          path="/verantwoordelijke/dashboard"
          element={<VerantwoordelijkeDashboard />}
        />

        {/* GECORRIGEERD: Zelfsluitende tag met attributen */}
        <Route
          path="/verantwoordelijke/personeel"
          element={<VerantwoordelijkePersoneel />}
        />

      </Routes>
    </Router>
  );
}

export default App;