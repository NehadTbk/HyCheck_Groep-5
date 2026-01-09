import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    requireTLS: true,
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

export const sendResetPasswordEmail = async (toEmail, resetLink, fullName) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject: "Reconfigurer votre mot de passe HyCheck",
        html: `
        <p>Bonjour, ${fullName}, </p>
        <p>Vous avez fait une demande pour changer le mot de passe pour le compte de <strong>Hycheck</strong>. </p>
        <p>Cliquez sur le lien en dessous pour configurer un nouveau mot de passe: </p>
        <p>
        <a href="${resetLink}" target="_blank">
        Reconfigurer le mot de passe
        </a>
        </p>
        <p>Ce lien est valable pendant <strong> 1 heure </strong> à partir de l'envoi du mail </p>
        <br/>
        <p>Si vous n'avez pas demandé ce mot de passe, vous pouvez ignorer ce mail.</p>
        <p>- L'equipe HyCheck </p>
        `, 
    };
    const info = await transporter.sendMail(mailOptions);
}