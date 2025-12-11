import React from "react";
import Topbar from "../../components/common/Topbar";
import "./nav.css";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";


function VerantwoordelijkeDashboard() {
  return (
    <div className="min-h-screen bg-[#C6B6C2] flex flex-col rounded-2xl overflow-hidden">
      <Topbar />

      <main className="flex-1 px-8 py-6">
        <nav className="custom-navbar">
          <div className="nav-container">

            <div className="nav-links">
              <a href="/verantwoordelijke/dashboard">Dashboard</a>
              <a href="/verantwoordelijke/kalender">Kalender</a>
              <a href="/verantwoordelijke/personeel">Mijn Personeel</a>
              <a href="/verantwoordelijke/rapporten">Rapporten</a>
            </div>
          </div>
        </nav>

        <h1 className="text-2xl font-bold p-6">Verantwoordelijke Dashboard</h1>
      </main>
    </div>
  );
}

export default VerantwoordelijkeDashboard;