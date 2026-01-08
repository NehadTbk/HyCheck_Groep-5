import pool from "../config/db.js";

export const findUserByEmail = async (email) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                user_id, 
                first_name, 
                last_name, 
                email, 
                password_hash,  
                role, 
                is_active, 
                badge_id,
                must_change_password
            FROM users 
            WHERE email = ?`,
            [email]
        );

        return rows[0] || null;
    } catch (error) {
        console.error("Error finding user by email:", error.message);
        throw error;
    }
};

export const createUser = async (userData) => {
    const {
        firstName,
        lastName,
        email,
        passwordHash,
        role,
        isActive = 1,
        badgeId = null
    } = userData;

    try {
        const [result] = await pool.query(
            `INSERT INTO users 
                (first_name, last_name, email, password_hash, role, is_active, badge_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [firstName, lastName, email, passwordHash, role, isActive, badgeId]
        );

        return result.insertId;
    } catch (error) {
        console.error("Error creating user:", error.message);
        throw error;
    }
};

export const getAllUsers = async () => {
    const [rows] = await pool.query(`
    SELECT user_id, first_name, last_name, email, role, is_active
    FROM users
  `);
    return rows;
};
export const deleteUserById = async (userId) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM users WHERE user_id = ?",
            [userId]
        );
        return result;
    } catch (err) {
        console.error("Error deleting user:", err);
        throw err;
    }
};
