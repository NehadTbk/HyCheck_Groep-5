import express from "express";
import { register, login } from "../controllers/authController.js";
import { loginLimiter } from "../middleware/loginLimiter.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/logout, logout");

export default router;