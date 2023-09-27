const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
const mg = require("nodemailer-mailgun-transport")

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Abdelrahaman Hassan <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        const mailgunAuth = {
            auth: {
                api_key: `${process.env.SGRID_API}`,
                domain: `${process.env.SGRID_EMAIL}`
            }
        }
        return nodemailer.createTransport(mg(mailgunAuth));
        // return nodemailer.createTransport({
        //     host: "smtp.mailtrap.io",
        //     port: 587,
        //     auth: {
        //         user: "dd696be465c5ed",
        //         pass: "a6924040714ccd"
        //     }
        // });
    }

    // async..await is not allowed in global scope, must use a wrapper
    // Send the actual email
    async send(template, subject) {
        // 1) Render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        // 2) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText(html)
        };

        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send(
            'passwordReset',
            'Your password reset token (valid for only 10 minutes)'
        );
    }
};