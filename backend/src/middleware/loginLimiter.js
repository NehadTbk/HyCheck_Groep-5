import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuten
    max: 5, // aantal pogingen
    message: function(req, res) {
        const lang = req.headers["accept-language"]?.startsWith("fr") ? "fr" : "nl";
        return {message: getMessage(lang, "too_many_requests")};
    },
    standardHeaders: true,
    legacyHeaders: false,
});