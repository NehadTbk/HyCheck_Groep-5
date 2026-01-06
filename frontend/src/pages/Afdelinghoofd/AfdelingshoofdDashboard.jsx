import React from "react";
import PageLayout from "../../components/layout/PageLayout";
import AfdelingshoofdNavBar from "../../components/navbar/AfdelingshoofdNavBar";
import ProgressCard from "../../components/cards/ProgressCard";
import PeriodicCard from "../../components/cards/PeriodicCard";
import CreateAccountCard from "../../components/cards/CreateAccountCard";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";



function AfdelingshoofdDashboard() {
  return (
    <PageLayout>
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
    </PageLayout>
  );
}

export default AfdelingshoofdDashboard;
