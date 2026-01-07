import React from "react";
import { useNavigate } from "react-router-dom";
import { FiDownload } from "react-icons/fi";

function ProgressCard({
  month = "December",
  percentage = 67,
  status = "warning", // ok | warning | danger
  clickable = true,
  downloadTitle = "Download rapport",
  onDownload, // optional callback
}) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (!clickable) return;
    navigate("/afdelingshoofd/overzicht-maanden");
  };

  const statusClasses = [
    "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs",
    status === "ok"
      ? "border-green-500 bg-green-50"
      : status === "danger"
      ? "border-red-500 bg-red-50"
      : "border-[#E0B76F] bg-[#F8F3E8]",
  ].join(" ");

  return (
    <article
      onClick={handleCardClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : -1}
      className={[
        "relative bg-white rounded-xl shadow-lg px-8 py-6 min-h-[260px]",
        "transition-all duration-150",
        clickable
          ? "cursor-pointer select-none hover:shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7A4A77]"
          : "",
      ].join(" ")}
      onKeyDown={(e) => {
        if (!clickable) return;
        if (e.key === "Enter" || e.key === " ") handleCardClick();
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm underline text-black">
          Boxen voltooid in {month} voor
        </span>

        <div className={statusClasses}>✔</div>
      </div>

      <div className="mt-5">
        <span className="text-4xl font-semibold">{percentage} %</span>
      </div>

      <div className="mt-1 text-sm">schoongemaakt</div>

      {/* ✅ Download button (does NOT trigger navigation) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // ✅ prevents card click
          onDownload?.();
        }}
        className="absolute bottom-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
        title={downloadTitle}
        aria-label={downloadTitle}
      >
        <FiDownload size={20} />
      </button>
    </article>
  );
}

export default ProgressCard;
