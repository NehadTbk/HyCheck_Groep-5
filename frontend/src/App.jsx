import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AfdelingshoofdDashboard from "./pages/Afdelinghoofd/AfdelingshoofdDashboard";
import AfdelingshoofdPersoneel from "./pages/Afdelinghoofd/AfdelingshoofdPersoneel";
import AfdelingshoofdMonthlyOverview from "./pages/Afdelinghoofd/AfdelingshoofdMonthlyOverview";
import VerantwoordelijkeDashboard from "./pages/Verantwoordelijke/VerantwoordelijkeDashboard";
import VerantwoordelijkePersoneel from "./pages/Verantwoordelijke/VerantwoordelijkePersoneel";
import VerantwoordelijkeRapport from "./pages/Verantwoordelijke/VerantwoordelijkeRapport";
import VerantwoordelijkeBoxen from "./pages/Verantwoordelijke/VerantwoordelijkeBoxen";
import ProtectedRoute from "./components/ProtectedRoute";
import AssistentDashboard from "./pages/Assistent/AssistentDashboard";
import MijnBoxen from "./pages/Assistent/MijnBoxen";
import Historiek from "./pages/Assistent/Historiek";
import Instructies from "./pages/Instructies";
import "./index.css";
import Login from "./pages/Login/Login";
import ChangePassword from "./pages/Login/ChangePassword";
import ForgotPassword from "./pages/Login/ForgotPassword";
import ResetPassword from "./pages/Login/ResetPassword";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Change password route voor users met een temp wachtwoord */}
        <Route path="/change-password" element={<ChangePassword />} />

        {/* Afdelingshoofd */}
        <Route
          path="/afdelingshoofd/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AfdelingshoofdDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/afdelingshoofd/mijn-personeel"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AfdelingshoofdPersoneel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/afdelingshoofd/overzicht-maanden"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AfdelingshoofdMonthlyOverview />
            </ProtectedRoute>
          }
        />

        {/* Verantwoordelijke */}
        <Route
          path="/verantwoordelijke/dashboard"
          element={
            <ProtectedRoute allowedRoles={["responsible"]}>
              <VerantwoordelijkeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verantwoordelijke/boxen"
          element={
            <ProtectedRoute allowedRoles={["responsible"]}>
              <VerantwoordelijkeBoxen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verantwoordelijke/personeel"
          element={
            <ProtectedRoute allowedRoles={["responsible"]}>
              <VerantwoordelijkePersoneel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verantwoordelijke/rapporten"
          element={
            <ProtectedRoute allowedRoles={["responsible"]}>
              <VerantwoordelijkeRapport />
            </ProtectedRoute>
          }
        />

        {/* Assistent */}
        <Route
          path="/assistant/dashboard"
          element={
            <ProtectedRoute allowedRoles={["assistant"]}>
              <AssistentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistant/mijn-boxen"
          element={
            <ProtectedRoute allowedRoles={["assistant"]}>
              <MijnBoxen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistant/historiek"
          element={
            <ProtectedRoute allowedRoles={["assistant"]}>
              <Historiek />
            </ProtectedRoute>
          }
        />

        {/* Shared */}
        <Route
          path="/instructies"
          element={
            <ProtectedRoute allowedRoles={["assistant", "responsible", "admin"]}>
              <Instructies />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
