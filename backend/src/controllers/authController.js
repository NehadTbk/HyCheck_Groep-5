import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "../models/User.js";
import { sendWelcomeEmail } from "../utils/mailer.js";
import pool from "../config/db.js";

const rolePermissions = {
    admin: ["USER_CREATE", "USER_DELETE", "USER_VIEW"],
    responsible: ["USER_CREATE", "USER_DELETE", "USER_VIEW"],
    assistant: ["USER_VIEW"]
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Haal gebruiker op
        const user = await findUserByEmail(email);

        if (!user || !user.password_hash) {
            return res.status(400).json({
                success: false,
                message: "Ongeldige email of wachtwoord"
            });
        }
       

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {

            return res.status(400).json({
                success: false,
                message: "Ongeldige email of wachtwoord"
            });
        }

        if (user.must_change_password) {
            return res.status(200).json({
                success: true,
                mustChangePassword: true,
                user: {
                    id: user.user_id,
                    email: user.email,
                    role: user.role,
                    fullName: `${user.first_name} ${user.last_name}`
                }
            });
        }
        const permissions = rolePermissions[user.role] || [];

        // 4. JWT token genereren
        const token = jwt.sign(
            {
                id: user.user_id,
                email: user.email,
                role: user.role,
                name: `${user.first_name} ${user.last_name}`,
                permissions
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );



        // 5. Response sturen
        res.json({
            success: true,
            token,
            mustChangePassword: false,
            user: {
                id: user.user_id,
                    firstName: user.first_name,
                lastName: user.last_name,
                fullName: `${user.first_name} ${user.last_name}`,
                email: user.email,
                role: user.role,
                permissions
            }
        });

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
    const { firstName, lastName, email, role, sendEmail = true } = req.body;

    try {

        if (!req.user.permissions.includes("USER_CREATE")) {
            return res.status(403).json({ success: false, message: "Permission error" });
        }

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
            badgeId: null,
            mustChangePassword: 1
        });

        if (sendEmail) {
            try {
                await sendWelcomeEmail(email, tempPassword, `${firstName} ${lastName}`);
                console.log("Mail success verzonden naar: ", email);
            } catch (err) {
                console.error("Fout bij het verzenden van de welkom-mail: ", err);
            }
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
        res.json({ success: true, message: "Uitgelogd" });


    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const changePassword = async (req, res) => {
    const { oldPassword, newPassword, email } = req.body;

    try {
    const userEmail = email;
        const userToUpdate = await findUserByEmail(userEmail);
        if (!userToUpdate) {
            return res.status(404).json({ success: false, message: "Gebruiker niet gevonden" });
        }

        // Controleer het oude wachtwoord
        if (oldPassword) {
            const match = await bcrypt.compare(oldPassword, userToUpdate.password_hash);
            if (!match) {
                return res.status(400).json({ success: false, message: "Oud wachtwoord klopt niet" });
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            `UPDATE users 
             SET password_hash = ?, must_change_password = 0
             WHERE email = ?`,
            [hashedPassword, userToUpdate.email]
        );

        res.json({
            success: true,
            message: "Wachtwoord succesvol gewijzigd",
            email: userToUpdate.email
        });

    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({
            success: false,
            message: "Server error: " + err.message
        });
    }
};