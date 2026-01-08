import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirm) {
            setError("Wachtwoorden komen niet overeen");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Reset mislukt");
                return;
            }

            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);

        } catch (err) {
            setError("Serverfout", err);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 bg-white p-6 shadow rounded">
            <h2 className="text-xl font-bold mb-4">Nieuw wachtwoord instellen</h2>

            {error && <p className="text-red-600 mb-2">{error}</p>}

            {success ? (
                <p className="text-green-600">
                    Wachtwoord gewijzigd! Je wordt doorgestuurd…
                </p>
            ) : (
                <form onSubmit={submit}>
                    <input
                        type="password"
                        placeholder="Nieuw wachtwoord"
                        className="w-full border p-2 mb-3"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Bevestig wachtwoord"
                        className="w-full border p-2 mb-4"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                    />
                    <button className="w-full bg-blue-600 text-white p-2 rounded">
                        Opslaan
                    </button>
                </form>
            )}
        </div>
    );
}
