import React from "react";
import PageLayout from "../../components/layout/PageLayout";
import VerantwoordelijkeNavBar from "../../components/navbar/VerantwoordelijkeNavBar";
import SchedulingOverlay from "../../components/Verantwoordelijke/SchedulingOverlay";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

function VerantwoordelijkeBoxen() {
  const { language, letLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <PageLayout>
      <VerantwoordelijkeNavBar />

      <div className="p-6 bg-white rounded-xl shadow-lg min-h-[500px]">
        <div className="flex justify-between items-center pb-3 mb-6 border-b border-gray-300">
          <h1 className="text-3xl font-bold text-gray-800">{t("verantwoordelijkeBoxen.title")}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-full">
            <SchedulingOverlay />
          </div>
        </div>
      </div>

    </PageLayout>
  );
}

export default VerantwoordelijkeBoxen;
