import React from "react";
import PageLayout from "../../components/layout/PageLayout";
import VerantwoordelijkeNavBar from "../../components/navbar/VerantwoordelijkeNavBar";

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
    <PageLayout>
      <VerantwoordelijkeNavBar />


        
        <div className="p-6 bg-white rounded-xl shadow-lg min-h-[500px] overflow-x-auto">
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
    </PageLayout>
  );
}

export default VerantwoordelijkeDashboard;