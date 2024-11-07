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