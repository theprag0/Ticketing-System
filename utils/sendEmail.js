require('dotenv').config();
var nodemailer = require('nodemailer');
var moment = require('moment');
require('moment/min/locales.min');
moment.locale('en');

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
            'Thank You For Using Ticket Cloud.\n' +
            'This is a confirmation email to notify you that your ticket with ref. no:' +
            complaint.ticketId +
            ' has been initiated by our support team successfully.\n' +
            'Stay tuned for further updates\n\n.' +
            'With Regards,\n' +
            'Admin,\nSupport Team', // plain text body
    });
};

module.exports.sendSupportEmail = async (complaint) => {
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'pragwebdev@gmail.com', // generated ethereal user
            pass: process.env.GMAILPW, // generated ethereal password
        },
    });
    await transporter.sendMail({
        from: 'pragwebdev@gmail.com', // sender address
        to: complaint.to, // list of receivers
        subject: complaint.subject, // Subject line
        text: complaint.text,
    });
};

module.exports.sendNotificationEmail = async (complaint) => {
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'pragwebdev@gmail.com', // generated ethereal user
            pass: process.env.GMAILPW, // generated ethereal password
        },
    });
    await transporter.sendMail({
        from: 'pragwebdev@gmail.com', // sender address
        to: complaint.assignedTo.email, // list of receivers
        subject: 'Ticket Notification:' + complaint.priority, // Subject line
        text:
            'Hi ' +
            complaint.assignedTo.firstName +
            ',\n' +
            'Notification Generated: ' +
            moment(Date.now()).format(
                'dddd, MMMM Do YYYY, h:mm:ss a',
            )  +
            '\n This is a remainder for ticket with ref no. : ' +
            complaint.type +
            '-' +
            complaint.ticketId +
            ' with priority' +
            complaint.priority +
            '.\n' +
            'The ticket was created on ' +
            moment(complaint.createdAt).format(
                'dddd, MMMM Do YYYY, h:mm:ss a',
            ) +
            '.\n\n' +
            'Regards,\n' +
            'Admin\n\n\n' +
            'Note: This is a system generated Email. Please contact the admin in case of errors. Please ignore the email if the above ticket is closed.',
    });
};

module.exports.sendClosedEmail= async (complaint) => {
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
        subject: 'Ticket Resolved:' + complaint.ticketId, // Subject line
        text:
            'Hi ' +
            complaint.author.id.firstName +
            ',\n' +
            "Thank You for using Ticket Cloud.\n"+
            "This is to notify you that your ticket with ref no. "+complaint.type+"-"+complaint.ticketId+
            " was closed by our support executive on "+ moment(complaint.reviewClosedAt).format(
                'dddd, MMMM Do YYYY, h:mm:ss a',
            )+
            "\n Please contact our support team for further queries"+
            '.\n\n' +
            'Regards,\n' +
            'Admin\n\n\n' +
            'Note: This is a system generated Email. Please contact the admin in case of errors. Please ignore the email if the above ticket is closed.',
    });
};

