import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.STMP_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.STMP_USER,
        pass: process.env.STMP_PASS,
    },
});