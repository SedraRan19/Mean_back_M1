const nodemailer = require('nodemailer');

module.exports.sendAppointmentConfirmationEmail = async function (clientEmail,subject,text) {
    const monEmail = "tianaranaiavoarisoa@gmail.com";
    const pass = 'exik xvpq fpnm lynh';
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: monEmail,
            pass: pass
        }
    });

    const mailOptions = {
        from: monEmail,
        to: clientEmail,
        subject: subject,
        text: text
    };

    // Envoyer l'e-mail
    await transporter.sendMail(mailOptions);
}

