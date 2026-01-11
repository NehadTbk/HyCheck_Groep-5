import React, { useContext, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { UserContext } from "../../context/UserContextOnly";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

const roleOptionsMap = {
  admin: ["admin", "responsible", "dentist", "assistant"],
  responsible: ["dentist", "assistant"],
};

const functieToRoleMap = {
  admin: "admin",
  responsible: "responsible",
  dentist: "dentist",
  assistant: "assistant",
};

const PersoneelToevoegenModal = ({ isOpen, onClose, onCreated }) => {
  const { user } = useContext(UserContext);
  const userRole = user?.role || "none";
  const getFunctieOpties = () => roleOptionsMap[userRole] || [];

  const [formData, setFormData] = useState({
    voornaam: "",
    achternaam: "",
    email: "",
    functie: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const closeModal = () => {
    onClose();
    setFormData({ voornaam: "", achternaam: "", email: "", functie: "" });
    setError("");
    setSuccess("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!formData.voornaam || !formData.achternaam || !formData.email || !formData.functie) {
      setError("Alle velden zijn verplicht");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Je bent niet ingelogd!");
        setLoading(false);
        return;
      }

      const role = functieToRoleMap[formData.functie];

      const API_BASE_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.voornaam,
          lastName: formData.achternaam,
          email: formData.email,
          role: role,
          sendEmail: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Fout bij toevoegen personeelslid");
        setLoading(false);
        return;
      }

      setSuccess(
        t("personeelToevoegenModal.success", {firstName: formData.voornaam,lastName: formData.achternaam,role: t(`personeelToevoegenModal.roles.${formData.functie}`)
        })
      );
      setFormData({
        voornaam: "",
        achternaam: "",
        email: "",
        functie: "",
      });

      setTimeout(() => {
        closeModal();
        if (onCreated) onCreated();
      }, 3000);
    } catch (err) {
      console.error("Add staff error:", err);
      setError("Kan geen verbinding maken met de server");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const functieOpties = getFunctieOpties();

  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold">{t("personeelToevoegenModal.title")}</h2>
          <button onClick={closeModal} className="text-gray-600 hover:text-gray-900" disabled={loading}>
            <IoMdClose size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="voornaam" className="block text-sm font-medium text-gray-700 mb-1">{t("personeelToevoegenModal.firstName")} </label>
              <input
                type="text"
                id="voornaam"
                name="voornaam"
                value={formData.voornaam}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-[#A78BFA] focus:border-[#A78BFA]"
                placeholder={t("personeelToevoegenModal.firstNamePlaceholder")}
                required
                disabled={loading}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="achternaam" className="block text-sm font-medium text-gray-700 mb-1">{t("personeelToevoegenModal.lastName")} </label>
              <input
                type="text"
                id="achternaam"
                name="achternaam"
                value={formData.achternaam}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-[#A78BFA] focus:border-[#A78BFA]"
                placeholder={t("personeelToevoegenModal.lastNamePlaceholder")}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t("personeelToevoegenModal.email")} </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-[#A78BFA] focus:border-[#A78BFA]"
              placeholder={t("personeelToevoegenModal.emailPlaceholder")}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="functie" className="block text-sm font-medium text-gray-700 mb-1">{t("personeelToevoegenModal.function")} </label>
            <select
              id="functie"
              name="functie"
              value={formData.functie}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-[#A78BFA] focus:border-[#A78BFA] bg-white"
              required
              disabled={loading}
            >
              <option value="">{t("personeelToevoegenModal.selectFunction")}</option>
              {functieOpties.map((functieKey) => (
                <option key={functieKey} value={functieKey}>
                  {t(`personeelToevoegenModal.roles.${functieKey}`)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {t(`personeelToevoegenModal.roleDescriptions.${userRole}`)}
            </p>
          </div>

          <div className="text-xs text-gray-500 mt-2">
            {t("personeelToevoegenModal.note")}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 disabled:opacity-50"
            >
              {t("personeelToevoegenModal.cancel")}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#4A2144] text-white py-2 px-4 rounded-lg hover:bg-[#8B5CF6] disabled:opacity-50"
            >
              {loading ? t("personeelToevoegenModal.loading") : t("personeelToevoegenModal.add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersoneelToevoegenModal;
