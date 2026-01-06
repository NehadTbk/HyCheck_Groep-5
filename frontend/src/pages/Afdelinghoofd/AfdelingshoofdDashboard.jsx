import React from "react";
import PageLayout from "../../components/layout/PageLayout";
import AfdelingshoofdNavBar from "../../components/navbar/AfdelingshoofdNavBar";
import ProgressCard from "../../components/cards/ProgressCard";
import PeriodicCard from "../../components/cards/PeriodicCard";
import CreateAccountCard from "../../components/cards/CreateAccountCard";
import { useLanguage } from "../../i18n/useLanguage";
import { useTranslation } from "../../i18n/useTranslation";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";



function AfdelingshoofdDashboard() {
  return (
    <PageLayout>
      <AfdelingshoofdNavBar />
        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[500px]">

          <section className="mb-6 flex flex-col lg:flex-row gap-6">
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
    </PageLayout>
  );
}

export default AfdelingshoofdDashboard;
