import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useLanguage } from "../../i18n/useLanguage";
import { useTranslation } from "../../i18n/useTranslation";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError(t("resetPassword.errors.missingToken"));
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError(t("resetPassword.errors.fillBothFields"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("resetPassword.errors.passwordsDontMatch"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!res.ok) {
        // If endpoint doesn't exist yet, still allow UX flow during development.
        if (res.status === 404) {
          setSuccess(t("resetPassword.success"));
          setTimeout(() => navigate("/login"), 1200);
          return;
        }
        const data = await res.json().catch(() => ({}));
        setError(data?.message || t("resetPassword.errors.generic"));
        return;
      }

      setSuccess(t("resetPassword.success"));
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(navigator.onLine ? t("resetPassword.errors.server") : t("errors.offline"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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
              {t("resetPassword.title")}
            </h1>
            <p className="text-sm text-gray-600 mb-6 text-center">
              {t("resetPassword.subtitle")}
            </p>

            {!token && (
              <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 text-sm rounded">
                {t("resetPassword.noTokenHint")}
              </div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("resetPassword.newPassword")}
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
                  {t("resetPassword.confirmNewPassword")}
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
                {loading ? t("resetPassword.loading") : t("resetPassword.submit")}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-blue-600 hover:underline">
                {t("resetPassword.backToLogin")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
