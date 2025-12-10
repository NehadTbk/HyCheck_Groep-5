import { useState } from "react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [lang, setLang] = useState(localStorage.getItem("lang") || "fr");
    const [error, setError] = useState("");



const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
}



const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
        const response await fetch("/api/auth/login", {
            method: POST,
            headers: {
                "Content-Type": "application/json",
                "Accept-Language": lang,
            },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (!response.ok) {
            setError(data.message);
        } else {
            console.log("Login succesvol:", data);
        }
    } catch (err) {
        setError(lang === 'fr'
            ? "Erreur de connexion, réesayez plus tard."
            : "Login fout, probeer later opnieuw."
        );

    }
};

const texts = {
    nl: {
        email: "E-mail",
        password: "Wachtwoord",
        login: "Inloggen",
    },
    fr: {
        email: "Adresse mail", password: "Mot de passe", login: "Se connecter"
    },
};
return(); //hier komt de code voor de pagina


};
export default Login;
