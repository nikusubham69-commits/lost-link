const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Lost-Link GIET" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("❌ Nodemailer Error:", error.message);
    }
};

module.exports = sendEmail;