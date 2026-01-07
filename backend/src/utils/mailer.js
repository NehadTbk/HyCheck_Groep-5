import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
export const sendWelcomeEmail = async (toEmail, tempPassword, fullName) => {
   const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject: "Bienvenue sur HyCheck",
        html: `
            <p>Bonjour ${fullName},</p>
            <p>Votre compte <strong>HyCheck</strong> a été créé.</p>
            <p><strong>Mot de passe temporaire :</strong> ${tempPassword}</p>
            <p>Veuillez vous connecter et changer votre mot de passe.</p>
            <br/>
            <p>— L’équipe HyCheck</p>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé :", info.messageId);
};