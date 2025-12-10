import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {createUser, findUserByEmail} from "../models/User";

const messages = {
    nl: {
        user_exists: "Gebruiker bestaat al",
        invalid_credentials: "Ongeldige inloggegevens",
        server_error: "Er is iets misgegaan, probeer later opnieuw...",
        user_created: "Gebruiker aangemaakt!",
    },
    fr: {
        user_exists: "L'utilisateur existe déjà",
        invalid_credentials: "Identifients invalides",
        server_error: "Une erreur est survenue, veuillez réesayer plus tard", 
        user_created: "Utilisateur crée",
    },
};

export const register = async (req, res) => {
    const lang = req.headers["accept-language"]?.startsWith("fr") ? "fr" : "nl";
    const {fname, lname, email, password, role = "assistent", badge_id = null} = req.body;

    try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) return res.status(400).json({message: messages[lang].user_exists});
        const hashedPassword = await bcrypt.hash(password, 10);
    await createUser({fname, lname, email, password: hashedPassword, role, is_active: 1, badge_id});
    res.status(201).json({message: messages[lang].user_created});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: messages[lang].server_error});
    }
};

export const login = async (req, res) => {
    const lang = req.headers["accept-language"]?.startsWith("fr") ? "fr" : "nl";

    try {
        const user = await findUserByEmail(email);
        if (!user) return res.status(400).json({message: messages[lang].invalid_credentials});

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({message: messages[lang].invalid_credentials});
        
        const token = jwt.sign(
            {id: user.user_id, email: user.email, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: "1d"}
        );

        res.json({token, user:  {user_id: user.user_id, fname: user.fname, lname: user.lname, role: user.role}});

    } catch (err) {
        console.error(err);
        res.status(500).json({message: messages[lang].server_error});
    }
};