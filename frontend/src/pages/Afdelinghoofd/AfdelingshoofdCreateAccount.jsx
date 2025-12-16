import React from "react";
import Topbar from "../../components/common/Topbar";
import AfdelingshoofdNavBar from "../../components/navbar/AfdelingshoofdNavBar";
import CreateAccountForm from "../../components/Afdelingshoofd/CreateAccountForm";

function AfdelingshoofdCreateAccount() {
  return (
    <div className="min-h-screen bg-[#C6B6C2] flex flex-col">
      <Topbar />

      <main className="flex-1 px-8 py-6">
        <AfdelingshoofdNavBar />
        <div className="bg-[#E5E5E5] rounded-xl min-h-[calc(100vh-7rem)] px-10 py-6 flex flex-col">

          {/* Centered grey panel with form */}
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-[#E5E5E5] w-full max-w-4xl h-104 flex flex-col items-center justify-center">
              <h1 className="text-4xl font-semibold mb-10">
                Account aanmaken
              </h1>

              <CreateAccountForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AfdelingshoofdCreateAccount;
