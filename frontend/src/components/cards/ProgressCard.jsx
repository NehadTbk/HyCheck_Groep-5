import React from "react";

function ProgressCard() {
  return (
    <article className="bg-white rounded-xl shadow-md px-8 py-6 max-w-xl">
      <div className="flex items-center justify-between">
        <a href="#" className="text-sm underline text-black">
          Boxen voltooid in December voor
        </a>
        <div className="w-8 h-8 rounded-full border-2 border-[#E0B76F] bg-[#F8F3E8] flex items-center justify-center text-xs">
          ✔
        </div>
      </div>

      <div className="mt-5">
        <span className="text-4xl font-semibold">67 %</span>
      </div>

      <div className="mt-1 text-sm">schoongemaakt</div>
    </article>
  );
}

export default ProgressCard;
