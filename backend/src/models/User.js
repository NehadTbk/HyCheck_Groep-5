import pool from "../config/db";

export const createUser = async (email, hashedPassword) => {
    const [result] = await pool.query(
        "INSERT INTO users (email, password) VALUES (?,?)", [email, hashedPassword]
    );
    return result;
};

export const findUserByEmail = async (email) => {
    const [rows] = await pool.query(
        "SELECT * FROM users WHERE email = ?", [email]
    );
    return rows[0];
}