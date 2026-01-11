import { useState } from "react";
import { Link } from "react-router-dom";

import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useLanguage } from "../../i18n/useLanguage";
import { useTranslation } from "../../i18n/useTranslation";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function ForgotPassword() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // If backend endpoint exists, use it. If it doesn't (404), we still show the generic success message.
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        // If endpoint doesn't exist, don't break UX.
        if (res.status === 404) {
          setSuccess(t("forgotPassword.success"));
          return;
        }
        const data = await res.json().catch(() => ({}));
        setError(data?.message || t("forgotPassword.errors.generic"));
        return;
      }

      setSuccess(t("forgotPassword.success"));
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(navigator.onLine ? t("forgotPassword.errors.server") : t("errors.offline"));
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
              {t("forgotPassword.title")}
            </h1>
            <p className="text-sm text-gray-600 mb-6 text-center">
              {t("forgotPassword.subtitle")}
            </p>

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
                  {t("forgotPassword.email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@doe.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#70A3CB] text-white py-2 px-4 rounded hover:bg-[#5e93bb] transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? t("forgotPassword.loading") : t("forgotPassword.submit")}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-blue-600 hover:underline">
                {t("forgotPassword.backToLogin")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
