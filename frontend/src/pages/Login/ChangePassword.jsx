import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useLanguage } from "../../i18n/useLanguage";
import { useTranslation } from "../../i18n/useTranslation";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const { email, mustChangePassword } = location.state || {};

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    // This page is normally reached from Login (mustChangePassword flow).
    // If opened directly, redirect back to login.
    if (!email) navigate("/login");
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError(t("changePassword.errors.fillBothFields"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("changePassword.errors.passwordsDontMatch"));
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const body = { email, newPassword };
      if (!mustChangePassword) body.oldPassword = oldPassword;

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || t("changePassword.errors.generic"));
        return;
      }

      setSuccess(t("changePassword.success"));

      const nextUser = { ...user, mustChangePassword: false };
      localStorage.setItem("user", JSON.stringify(nextUser));

      setTimeout(() => {
        switch (nextUser.role) {
          case "admin":
            navigate("/afdelingshoofd/dashboard");
            break;
          case "responsible":
            navigate("/verantwoordelijke/dashboard");
            break;
          case "assistant":
            navigate("/assistant/dashboard");
            break;
          default:
            navigate("/login");
        }
      }, 1200);
    } catch (err) {
      console.error("Change password error:", err);
      setError(t("changePassword.errors.server"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header (same style as Login) */}
      <header className="bg-[#70A3CB] shadow-sm absolute top-0 left-0 right-0">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <img
            src="./hycheck-logo.png"
            alt="Logo"
            className="bg-white w-20 h-20 rounded"
          />
        </div>
      </header>

      {/* Language Switcher */}
      <div className="pt-28">
        <div className="flex justify-end px-4 py-3">
          <LanguageSwitcher
            language={language}
            onLanguageChange={setLanguage}
            variant="blue"
          />
        </div>

        {/* Card */}
        <div className="flex items-center justify-center min-h-[calc(100vh-300px)] p-4">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              {t("changePassword.title")}
            </h1>

            {mustChangePassword && (
              <p className="text-sm text-gray-600 mb-6 text-center">
                {t("changePassword.subtitleMustChange")}
              </p>
            )}

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-2 bg-green-100 text-green-700 text-sm rounded">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Old password only for normal password change */}
              {!mustChangePassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("changePassword.oldPassword")}
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="******"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("changePassword.newPassword")}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="******"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("changePassword.confirmNewPassword")}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="******"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#70A3CB] text-white py-2 px-4 rounded hover:bg-[#5e93bb] transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? t("changePassword.loading") : t("changePassword.submit")}
              </button>

              {!mustChangePassword && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {t("changePassword.back")}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
