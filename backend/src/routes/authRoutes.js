import express from "express";
import { register, login, logout, changePassword } from "../controllers/authController.js";
import { loginLimiter } from "../middleware/loginLimiter.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { forgotPassword, resetPassword } from "../controllers/authController.js";



const router = express.Router();

router.post("/register", authMiddleware, register);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.post("/change-password", changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;