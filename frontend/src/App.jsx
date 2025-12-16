import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AfdelingshoofdDashboard from "./pages/Afdelinghoofd/AfdelingshoofdDashboard";
import AfdelingshoofdPersoneel from "./pages/Afdelinghoofd/AfdelingshoofdPersoneel";
import AfdelingshoofdCreateAccount from "./pages/Afdelinghoofd/AfdelingshoofdCreateAccount";
import AfdelingshoofdMonthlyOverview from "./pages/Afdelinghoofd/AfdelingshoofdMonthlyOverview";
import "./index.css";
import Login from "./pages/Login";


function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route
        path="/login" element={<Login />}
        />
        {/* Afdelingshoofd */}
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
        {/* Verantwoordelijke */}

        {/* Assistente */}

        {/* default */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
