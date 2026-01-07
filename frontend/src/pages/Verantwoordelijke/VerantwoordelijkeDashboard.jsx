import React, { useEffect, useState} from "react";
import PageLayout from "../../components/layout/PageLayout";
import VerantwoordelijkeNavBar from "../../components/navbar/VerantwoordelijkeNavBar";

function VerantwoordelijkeDashboard() {
const [weekStart, setWeekStart] = useState(getMonday(new Date()));
const [dagen, setDagen] = useState([]);
const [boxen, setBoxen] = useState([]);

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

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