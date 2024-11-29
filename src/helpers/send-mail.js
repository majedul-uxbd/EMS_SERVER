/**
 * @author Md. Majedul Islam <https://github.com/majedul-uxbd> 
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Ultra-X Asia Pacific
 * 
 * @description 
 * 
 */


const nodemailer = require('nodemailer');
const { emailAccount } = require('../config');

/**
 * Creates a transport object using nodemailer for sending emails via Gmail's SMTP service.
 * 
 * This function configures a nodemailer transporter to send emails using Gmail's SMTP server. 
 * It uses the following settings:
 * - `service`: Specifies the email service provider ('gmail').
 * - `secure`: Indicates whether to use a secure connection (true for using SSL).
 * - `host`: The SMTP server host URL for Gmail ('smtp.gmail.com').
 * - `port`: The port number for secure email transmission (465).
 * - `auth`: Authentication credentials for the email account, where:
 *    - `user`: The email account address (e.g., 'your-email@gmail.com').
 *    - `pass`: The password for the email account.
 * 
 * The `transporter` object is used to send emails through the configured Gmail account.
 * 
 * @type {Object}
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: emailAccount.email,
        pass: emailAccount.pass
    }
})

/**
 * Sends an email using a configured transporter.
 * 
 * This function uses the configured `transporter` object to send an email. 
 * It accepts the following parameters:
 * - `to`: The recipient's email address.
 * - `sub`: The subject line of the email.
 * - `msg`: The HTML content of the email body.
 * 
 * The function calls the `sendMail` method of the `transporter` object, 
 * which sends the email with the provided recipient address, subject, and message.
 *
 * @param {string} to - The email address of the recipient.
 * @param {string} sub - The subject line of the email.
 * @param {string} msg - The HTML content of the email.
 */
const sendMail = (to, sub, msg) => {
    transporter.sendMail({
        to: to,
        subject: sub,
        html: msg
    })
}

module.exports = {
    sendMail
}