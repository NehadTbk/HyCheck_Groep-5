// src/components/cards/CreateAccountCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function CreateAccountCard() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/afdelingshoofd/account-aanmaken");
  };

  return (
    <article
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className="
        bg-white rounded-xl shadow-md px-8 py-10 max-w-xl
        flex items-center justify-center
        cursor-pointer select-none
        transition-all
        hover:shadow-lg hover:bg-gray-50
        focus:outline-none focus:ring-2 focus:ring-[#7A4A77]
      "
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
    >
      <span className="text-base font-medium">
        Account aanmaken
      </span>
    </article>
  );
}

export default CreateAccountCard;
