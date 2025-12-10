import React, { useState } from "react";

function CreateAccountForm() {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    role: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // later: send to backend
    console.log("Submitting account:", form);
    alert("Account aangemaakt (mock).");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow px-8 py-6 w-80 text-sm"
    >
      {/* Name */}
      <div className="mb-4">
        <label className="block mb-1 text-xs font-semibold text-gray-700">
          Name
        </label>
        <input
          type="text"
          name="name"
          placeholder="Value"
          value={form.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#7A4A77]"
        />
      </div>

      {/* Surname */}
      <div className="mb-4">
        <label className="block mb-1 text-xs font-semibold text-gray-700">
          Surname
        </label>
        <input
          type="text"
          name="surname"
          placeholder="Value"
          value={form.surname}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#7A4A77]"
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block mb-1 text-xs font-semibold text-gray-700">
          Email
        </label>
        <input
          type="email"
          name="email"
          placeholder="Value"
          value={form.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#7A4A77]"
        />
      </div>

      {/* Role */}
      <div className="mb-6">
        <label className="block mb-1 text-xs font-semibold text-gray-700">
          Role
        </label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#7A4A77] bg-white"
        >
          <option value="">Select</option>
          <option value="verantwoordelijke">Verantwoordelijke</option>
          <option value="tandarts">Tandarts</option>
          <option value="tandartsassistent">Tandartsassistent</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-black text-white rounded-md py-2 text-sm font-medium hover:bg-gray-900"
      >
        Submit
      </button>
    </form>
  );
}

export default CreateAccountForm;
