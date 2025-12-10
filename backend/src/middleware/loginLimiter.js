import rateLimit from "express-rate-limit";
import fs from "fs";

const locales = {
    nl: JSON.parse(fs.readFileSync('.src/locales/nl.json', 'utf-8')),
    fr: JSON.parse(fs.readFileSync('.src/locales/fr.json', 'utf-8')),

}


export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuten
    max: 5, // aantal pogingen
    message: { message: "locales[lang].too_many_requests" },
    standardHeaders: true,
    legacyHeaders: false,
});