import React from "react";
import Topbar from "../../components/common/Topbar";
import { IoMdNotificationsOutline } from "react-icons/io";

function VerantwoordelijkeDashboard() {

  const dagen = [
    { dagNaam: "Maandag", datum: "17/11" },
    { dagNaam: "Dinsdag", datum: "18/11" },
    { dagNaam: "Woensdag", datum: "19/11" },
    { dagNaam: "Donderdag", datum: "20/11" },
    { dagNaam: "Vrijdag", datum: "21/11" }
  ];


  const boxen = [
    { nummer: 1, naam: "Box 1 / Sofia", status: "Groen" },
    { nummer: 2, naam: "Box 2 / Shima", status: "Rood" },
    { nummer: 3, naam: "Box 3", status: "Grijs" },
    { nummer: 4, naam: "Box 4", status: "Grijs" },
    { nummer: 5, naam: "Box 5", status: "Grijs" },
    { nummer: 6, naam: "Box 6", status: "Grijs" },
    { nummer: 7, naam: "Box 7", status: "Grijs" },
    { nummer: 8, naam: "Box 8", status: "Grijs" },
    { nummer: 9, naam: "Box 9", status: "Grijs" },
    { nummer: 10, naam: "Box 10", status: "Grijs" },
    { nummer: 11, naam: "Box 11", status: "Grijs" },
    { nummer: 12, naam: "Box 12", status: "Grijs" },
    { nummer: 13, naam: "Box 13", status: "Grijs" },
    { nummer: 14, naam: "Box 14", status: "Grijs" }
  ];


  const renderBoxenRijen = (boxData) => {
    // Haalt het nummer uit de boxData of gebruikt 2 als fallback (voor de zekerheid)
    // We gebruiken de nummer property voor de dagen, maar de volledige naam voor de eerste kolom.
    const boxNummerMatch = boxData.naam.match(/Box\s\d+/);
    const boxNummer = boxNummerMatch ? boxNummerMatch[0].split(' ')[1] : boxData.nummer || 2;

    const statusClasses = {
      Groen: "bg-[#4CAF50]",
      Rood: "bg-[#F44336]",
      Grijs: "bg-[#e0e0e0] text-[#555]"
    };

    return (
      <div className="col-span-full grid grid-cols-5 gap-3">
        
        <div className={`p-4 rounded-md font-bold flex items-center justify-center min-h-[50px] ${statusClasses[boxData.status]}`}>
          {boxData.naam}
        </div>

        
        {dagen.slice(1).map((_, index) => (
          <div key={index} className={`p-4 rounded-md font-bold flex items-center justify-center min-h-[50px] ${statusClasses.Grijs}`}>
            Box {boxNummer}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#E5DCE7] flex flex-col rounded-2xl overflow-hidden">
      <Topbar />

      <main className="flex-1 px-8 py-6">

        
        <nav className="bg-white py-3 shadow-sm rounded-3xl mt-4 mb-6">
          <div className="w-full mx-auto px-4 flex items-center justify-between">

            
            <div className="flex gap-4">
              <a href="/verantwoordelijke/dashboard" className="text-gray-800 font-semibold text-base py-1 px-2 hover:text-black">Dashboard</a>
              <a href="/verantwoordelijke/kalender" className="text-gray-500 text-base py-1 px-2 hover:text-black">Mijn Boxen</a>
              <a href="/verantwoordelijke/rapporten" className="text-gray-500 text-base py-1 px-2 hover:text-black">Rapporten</a>
              <a href="/verantwoordelijke/personeel" className="text-gray-500 text-base py-1 px-2 hover:text-black">Mijn Personeel</a>
              
            </div>

            
            <div className="flex items-center space-x-4">
              <span className="text-gray-500 cursor-pointer hover:text-gray-700">
                <IoMdNotificationsOutline size={24} />
              </span>
              <div className="flex border border-gray-300 rounded-full overflow-hidden text-sm font-semibold">
                <span className="bg-gray-200 px-2 py-1 text-gray-800">NL</span>
                <span className="px-2 py-1 text-gray-500 cursor-pointer hover:bg-gray-100">FR</span>
              </div>
            </div>

          </div>
        </nav>

       
        

        
        <div className="p-4 bg-white rounded-xl shadow-lg mt-4 overflow-x-auto">
          <h1 className="text-3xl font-bold text-gray-800 pb-3 mb-6 border-b border-gray-300">Agenda</h1>

          
          <div className="flex space-x-2 text-xl mb-4 ml-2">
            <span className="text-gray-600 cursor-pointer">&lt;</span>
            <span className="text-gray-600 cursor-pointer">&gt;</span>
          </div>

          
          <div className="grid grid-cols-5 gap-3">

            
            {dagen.map((dag, index) => (
              <div key={index} className="bg-gray-50 border border-gray-300 p-2 text-center rounded-lg flex flex-col justify-center items-center mb-1">
                <div className="text-sm font-medium text-gray-600 mb-0.5">{dag.dagNaam}</div>
                <div className="text-lg font-bold text-gray-900">{dag.datum}</div>
              </div>
            ))}

           
            {boxen.map((box, index) => (
              <React.Fragment key={index}>
                {renderBoxenRijen(box)}
              </React.Fragment>
            ))}

          </div>
        </div>
      </main>
    </div>
  );
}

export default VerantwoordelijkeDashboard;