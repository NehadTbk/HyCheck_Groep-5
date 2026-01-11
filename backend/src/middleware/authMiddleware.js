import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];

    // Check for invalid token values
    if (!token || token === "undefined" || token === "null" || token.length < 10) {
        return res.status(401).json({ message: "Invalid token format" });
    }

    try {
        // Check if token is blacklisted
        const [blacklisted] = await pool.query(
            "SELECT 1 FROM token_blacklist WHERE token = ? LIMIT 1",
            [token]
        );
        if (blacklisted.length > 0) {
            return res.status(401).json({ message: "Token is invalidated" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            assistant_id: decoded.assistant_id || null,
            permissions: decoded.permissions || []
        };
        next();
    } catch (err) {
        console.error("Auth error: ", err)
        res.status(401).json({ message: "Invalid token" })
    }
};