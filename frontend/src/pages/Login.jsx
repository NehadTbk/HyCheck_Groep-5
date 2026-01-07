import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "../components/layout/LanguageSwitcher";
import { useTranslation } from "../i18n/useTranslation";
import { useLanguage } from "../i18n/useLanguage";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();


    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),

            });

            let data = null;

            try{
            data = await response.json();
            } catch {
                console.log('Empty json');
            }

            if (!response.ok) {
                setError(
                    data?.message ||
                    t("errors.loginFailed")
                );
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            let redirectPath = "/login";

            switch (data.user.role) {
                case 'admin':
                    redirectPath = "/afdelingshoofd/dashboard";
                    break;
                case 'responsible':
                    redirectPath = "/verantwoordelijke/dashboard";
                    break;
                case 'assistant':
                    redirectPath = "/assistant/dashboard";
                    break;
                default:
                    redirectPath = "/login";

            }

            navigate(redirectPath);
        } catch (err) {
            setError(
                navigator.onLine ? t("errors.serverUnavailable") : t("errors.offline")
            );
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-[#70A3CB] shadow-sm absolute top-0 left-0 right-0">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <img src="./hycheck-logo.png" alt="Logo" className="bg-white w-20 h-20 rounded" />
                </div>
            </header>
            {/* Language Switcher */}
            <div className="pt-28">
                <div className="flex justify-end px-4 py-3">
                    <LanguageSwitcher language={language} onLanguageChange={setLanguage} variant="blue" />
                </div>

                {/* Login Form */}
                <div className="flex items-center justify-center min-h-[calc(100vh-300px)] p-4">
                    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">


                        <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">{t("login.title")}</h1>

                        {error && (
                            <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("login.email")}
                                </label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@doe.com" />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("login.password")}
                                </label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="******" />
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#70A3CB] text-white py-2 px-4 rounded hover:bg-[#5e93bb] transition-colors duration-200 disabled:opacity-50">
                                {loading ? t("login.loading") : t("login.loginButton")}
                            </button>
                        </form>

                        {/* Forgot Password */}
                        <div className="mt-4 text-center">
                            <a href="#" className="text-sm text-blue-600 hover:underline">
                                {t("login.forgotPassword")}
                            </a>
                        </div>

                    </div>
                </div >
            </div >
        </div>
    );
}

export default Login;