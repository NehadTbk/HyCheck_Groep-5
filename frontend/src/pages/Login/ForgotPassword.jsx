import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.message || "Er is iets misgegaan");
                return;
            }
            setSuccess(true);

        } catch (err) {
            console.error(err);
            setError("Serverfout. Probeer later opnieuw.")
        }

    };
    return (
        <div className="max-w-md mx-auto mt-20 bg-white p-6 shadow rounded">
            <h2 className="text-xl font-bold mb-4">
                Wachtwoord vergeten
            </h2>
            {success ? (
                <>
                    <p>Als dit e-mailadres bestaat, is er een mail verstuurd.</p>
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="mt-4 text-blue-600 underline"
                    >
                        Terug naar login
                    </button>
                </>
            ) : (
                <form onSubmit={submit}>
                    {error && (
                        <p className="text-red-600 mb-2">{error}</p>
                    )}
                    <input
                        type="email"
                        required
                        placeholder="E-mail"
                        className="w-full border p-2 mb-4"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <button className="w-full bg-blue-600 text-white p-2 rounded">
                        Verstuur reset link
                    </button>

                </form>
            )}
        </div>
    );
}