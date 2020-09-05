require('dotenv').config();
var nodemailer = require('nodemailer');

module.exports.sendVerificartionEmail = async (complaint) => {
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'pragwebdev@gmail.com', // generated ethereal user
            pass: process.env.GMAILPW, // generated ethereal password
        },
    });
    await transporter.sendMail({
        from: 'pragwebdev@gmail.com', // sender address
        to: complaint.author.id.email, // list of receivers
        subject: 'Your Ticket Has Been Initiated', // Subject line
        text:
            'Hi ' +
            complaint.author.id.username +
            ',\n\n' +
            'Thank You For Using Our Ticketing System.\n' +
            'This is a confirmation email to notify you that your ticket with ref. no:' +
            complaint.ticketId +
            ' has been initiated by our support team successfully.\n' +
            'Stay tuned for further updates\n\n.' +
            'With Regards,\n' +
            'Admin,\nSupport Team', // plain text body
    });
};
