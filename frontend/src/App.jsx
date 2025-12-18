import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AfdelingshoofdDashboard from "./pages/Afdelinghoofd/AfdelingshoofdDashboard";
import AfdelingshoofdPersoneel from "./pages/Afdelinghoofd/AfdelingshoofdPersoneel";
import AfdelingshoofdMonthlyOverview from "./pages/Afdelinghoofd/AfdelingshoofdMonthlyOverview";
import VerantwoordelijkeDashboard from "./pages/Verantwoordelijke/VerantwoordelijkeDashboard";
import VerantwoordelijkePersoneel from "./pages/Verantwoordelijke/VerantwoordelijkePersoneel";
import VerantwoordelijkeRapport from "./pages/Verantwoordelijke/VerantwoordelijkeRapport";
import ProtectedRoute from "./components/ProtectedRoute";
import AssistentDashboard from "./pages/Assistent/AssistentDashboard";
import MijnBoxen from "./pages/Assistent/MijnBoxen";
import Historiek from "./pages/Assistent/Historiek";

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
        <Route
          path="/" element={<Login />}
        />
        {/* Afdelingshoofd */}
        <Route
          path="/afdelingshoofd/dashboard"
          element={<ProtectedRoute allowedRoles={['admin']}>
            <AfdelingshoofdDashboard />
          </ProtectedRoute>
          }
        />
        <Route
          path="/afdelingshoofd/mijn-personeel"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AfdelingshoofdPersoneel />
            </ProtectedRoute>}
        />
        <Route
          path="/afdelingshoofd/overzicht-maanden"
          element={<ProtectedRoute allowedRoles={['admin']}>
            <AfdelingshoofdMonthlyOverview />
          </ProtectedRoute>
          }
        />
        {/* Verantwoordelijke */}
        <Route
          path="/verantwoordelijke/dashboard"
          element={<ProtectedRoute allowedRoles={['responsible']}>
            <VerantwoordelijkeDashboard />
          </ProtectedRoute>
          }
        />

        {/* Assistent routes */}
        <Route
          path="/assistant/dashboard"
          element={<ProtectedRoute allowedRoles={['assistant']} >
            <AssistentDashboard />
          </ProtectedRoute>
          }
        />
        <Route
          path="/assistant/mijn-boxen"
          element={<ProtectedRoute allowedRoles={['assistant']} >
            <MijnBoxen />
          </ProtectedRoute>
          }
        />

        {/* GECORRIGEERD: Zelfsluitende tag met attributen */}
        <Route
          path="/verantwoordelijke/personeel"
          element={<ProtectedRoute allowedRoles={['responsible']}>
            <VerantwoordelijkePersoneel />
          </ProtectedRoute>}
        />
        <Route
          path="/verantwoordelijke/rapporten"
          element={<ProtectedRoute allowedRoles={['responsible']}>
            <VerantwoordelijkeRapport />
          </ProtectedRoute>
          }
        />
        
        {/* Route aangepast naar de Historiek component */}
        <Route
          path="/assistant/historiek"
          element={
            <ProtectedRoute allowedRoles={['assistant']}>
              <Historiek />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;