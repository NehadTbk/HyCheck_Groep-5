import React from "react";
import { useNavigate } from "react-router-dom";

function ProgressCard() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/afdelingshoofd/overzicht-maanden");
  };

  return (
    <article
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className="
        bg-white rounded-xl shadow-md px-8 py-6 max-w-xl
        cursor-pointer select-none
        transition-all duration-150
        hover:shadow-lg hover:bg-gray-50
        focus:outline-none focus:ring-2 focus:ring-[#7A4A77]
      "
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
    >
      <div className="flex items-center justify-between">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-sm underline text-black"
        >
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
