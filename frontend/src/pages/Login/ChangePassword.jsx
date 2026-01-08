import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL;


const ChangePassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { email, mustChangePassword } = location.state || {};
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(()=> {
        if(!email) {
            navigate("/login");
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!newPassword || !confirmPassword) {
            setError("Vul beide velden in");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Wachtwoorden komen niet overeen");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            const body = {
                newPassword,
                email
            };
            if (!mustChangePassword) {
                body.oldPassword = oldPassword;
            }
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
                setError(data.message || "Fout bij wijzigen wachtwoord");
                return;
            }
                setSuccess("Wachtwoord succesvol gewijzigd!");
            let user = JSON.parse(localStorage.getItem("user")) || {};
            user.mustChangePassword = false;
            localStorage.setItem("user", JSON.stringify(user));
            setTimeout(() => {
                switch(user.role) {
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
            }, 1500);
        } catch (err) {
            console.error("Change password error:", err);
            setError("Serverfout");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Wijzig je wachtwoord</h2>
            {error && <div className="mb-2 text-red-600">{error}</div>}
            {success && <div className="mb-2 text-green-600">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Oud wachtwoord alleen tonen bij normale password change */}
                {!mustChangePassword && (
                    <input
                        type="password"
                        placeholder="Oud wachtwoord"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                    />
                )}

                <input
                    type="password"
                    placeholder="Nieuw wachtwoord"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                />

                <input
                    type="password"
                    placeholder="Bevestig nieuw wachtwoord"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-700 text-white p-2 rounded hover:bg-purple-900"
                >
                    {loading ? "Bezig..." : "Wijzig wachtwoord"}
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;
