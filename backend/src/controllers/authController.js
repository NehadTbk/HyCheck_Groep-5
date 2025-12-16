import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "../models/User.js";

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Haal gebruiker op
        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Ongeldige email of wachtwoord"
            });
        }
        if (!user.password_hash) {
            return res.status(400).json({
                success: false,
                message: "Account heeft geen wachtwoord ingesteld"
            });
        }

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {

            return res.status(400).json({
                success: false,
                message: "Ongeldige email of wachtwoord"
            });
        }

        // 4. JWT token genereren
        const token = jwt.sign(
            {
                id: user.user_id,
                email: user.email,
                role: user.role,
                name: `${user.first_name} ${user.last_name}`
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );


        // 5. Response sturen
        const responseData = {
            success: true,
            token,
            user: {
                id: user.user_id,
                firstName: user.first_name,
                lastName: user.last_name,
                fullName: `${user.first_name} ${user.last_name}`,
                email: user.email,
                role: user.role
            },
            message: "Login succesvol"
        };

        res.json(responseData);

    } catch (err) {
        console.error("\n LOGIN ERROR:", err);
        console.error("Error stack:", err.stack);
        console.log("=".repeat(60));
        res.status(500).json({
            success: false,
            message: "Server error: " + err.message
        });
    }
};

export const register = async (req, res) => {
    const { fname, lname, email, password, role, badge_id = null } = req.body;

    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) return res.status(400).json({
            success: false,
            message: "Gebruiker bestaat al"
        });

        const hashedPassword = await bcrypt.hash(password, 10);

        res.status(201).json({
            success: true,
            message: "Gebruiker aangemaakt"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
