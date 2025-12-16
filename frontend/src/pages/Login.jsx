import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [lang, setLang] = useState(localStorage.getItem("lang") || "nl");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Hardcoded vertalingen - simpel
    const translations = {
        nl: {
            email: "E-mail",
            password: "Wachtwoord",
            loginButton: "Inloggen",
            forgotPassword: "Wachtwoord vergeten?",
            error: "Ongeldige inloggegevens"
        },
        fr: {
            email: "E-mail",
            password: "Mot de passe",
            loginButton: "Se connecter",
            forgotPassword: "Mot de passe oublié?",
            error: "Identifiants invalides"
        }
    };

    const t = translations[lang];

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || t.error);
            } else {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate("/dashboard");
            }

        } catch (err) {
            setError("Server error");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = () => {
        setEmail("test@example.com");
        setPassword("test123");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            {/* Header */}
            <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                    <img
                    src="./hycheck-logo.png"
                    alt="Logo"
                    className="w-12 h-12 object-contain"/>
                </div>
            </div>
            </header>
            {/* Language Switcher - Simpel bovenaan */}
            <div className="absolute top-4 right-4 flex gap-2">
                <button 
                    onClick={() => setLang("nl")}
                    className={`px-3 py-1 rounded ${lang === "nl" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                    NL
                </button>
                <button 
                    onClick={() => setLang("fr")}
                    className={`px-3 py-1 rounded ${lang === "fr" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                    FR
                </button>
            </div>

            {/* Login Form */}
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">HyCheck</h1>
                
                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.email}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="email@voorbeeld.com"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.password}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "..." : t.loginButton}
                    </button>
                </form>

                {/* Forgot Password */}
                <div className="mt-4 text-center">
                    <a href="#" className="text-sm text-blue-600 hover:underline">
                        {t.forgotPassword}
                    </a>
                </div>

                {/* Demo Login */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                        onClick={handleDemoLogin}
                        className="w-full text-sm text-gray-600 hover:text-gray-800"
                    >
                        Demo: test@example.com / test123
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;