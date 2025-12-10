import React from "react";
import { useNavigate } from "react-router-dom";

function CreateAccountCard() {
  const navigate = useNavigate();

  const handleClick = () => {
    // go to the account creation page
    navigate("/afdelingshoofd/account-aanmaken");
  };

  return (
    <article className="bg-white rounded-xl shadow-md px-8 py-10 max-w-xl flex items-center justify-center">
      <button
        type="button"
        onClick={handleClick}
        className="text-base font-medium"
      >
        Account aanmaken
      </button>
    </article>
  );
}

export default CreateAccountCard;
