import rateLimit from "express-rate-limit";

// Login: 5 attempts per 15 minutes
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Te veel pogingen. Probeer later opnieuw." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Forgot password: 3 attempts per hour
export const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { message: "Te veel verzoeken. Probeer over een uur opnieuw." },
    standardHeaders: true,
    legacyHeaders: false,
});

// General: 100 requests per minute
export const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { message: "Te veel verzoeken. Even wachten." },
    standardHeaders: true,
    legacyHeaders: false,
});