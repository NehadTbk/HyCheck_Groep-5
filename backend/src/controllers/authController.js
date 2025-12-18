import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "../models/User.js";


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
    const { firstName, lastName, email, role, sendEmail = false } = req.body;

    try {

        if (!firstName || !lastName || !email || !role) {
            return res.status(400).json({
                success: false,
                message: "Alle velden zijn verplicht"
            });
        }
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Gebruiker bestaat al"
            });
        }
        const tempPassword = Math.random().toString(36).slice(-8) + "A1!";

        console.log(`Tijdelijk wachtwoord voor ${email} is: ${tempPassword}`);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);


        const userId = await createUser({
            firstName: firstName,
            lastName: lastName,
            email: email,
            passwordHash: hashedPassword,
            role: role,
            isActive: 1,
            badgeId: null
        });

        if(sendEmail) {
            console.log(`E-mail zou gestuurd worden naar ${email}`);
        }

        res.status(201).json({
            success: true,
            message: "Gebruiker aangemaakt",
            userId: userId,
            email: email,
            role: role
        });
    } catch (err) {
        console.error("Register error", err.message);
        console.error("Stack error", err.stack);
        res.status(500).json({
            success: false,
            message: "Server error " + err.message
        });
    }
};


export const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (token) {
            console.log('User logged out');
        }
        res.json({
            success: true,
            message: "Uitgelogd"
        });

    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
