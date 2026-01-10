import express from "express";
import { register, login, logout, changePassword } from "../controllers/authController.js";
import { loginLimiter, forgotPasswordLimiter } from "../middleware/loginLimiter.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { forgotPassword, resetPassword } from "../controllers/authController.js";



const router = express.Router();

router.post("/register", authMiddleware, register);
router.post("/login", loginLimiter, login);
router.post("/logout", authMiddleware, logout);
router.post("/change-password", authMiddleware, changePassword);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPassword);

export default router;