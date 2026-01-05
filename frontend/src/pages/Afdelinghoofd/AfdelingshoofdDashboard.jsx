import React from "react";
import Topbar from "../../components/layout/Topbar";
import AfdelingshoofdNavBar from "../../components/navbar/AfdelingshoofdNavBar";
import ProgressCard from "../../components/cards/ProgressCard";
import PeriodicCard from "../../components/cards/PeriodicCard";
import CreateAccountCard from "../../components/cards/CreateAccountCard";
import { useLanguage } from "../../i18n/useLanguage";
import { useTranslation } from "../../i18n/useTranslation";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";



function AfdelingshoofdDashboard() {
  return (
    <div className="min-h-screen bg-[#C6B6C2] flex flex-col">
      <Topbar />

      <main className="flex-1 px-8 py-6">
        <AfdelingshoofdNavBar />
        <div className="bg-[#E5E5E5] rounded-xl min-h-[calc(100vh-7rem)] px-10 py-6">

          <section className="mt-8 flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <ProgressCard />
            </div>

            <div className="flex-1">
              <PeriodicCard />
            </div>

            <div className="flex-1">
              <CreateAccountCard />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AfdelingshoofdDashboard;
