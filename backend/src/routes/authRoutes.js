import express from "express";
import { register, login, logout, changePassword } from "../controllers/authController.js";
import { loginLimiter } from "../middleware/loginLimiter.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", authMiddleware, register);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.post("/changepassword", authMiddleware, changePassword);

export default router;