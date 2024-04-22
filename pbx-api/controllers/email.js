let EmailTemplate = require('email-templates').EmailTemplate;
let path = require('path');
const fs = require('fs');
let nodemailer = require("nodemailer");
const config = require('../config/app');

let smtpTransport = require('nodemailer-smtp-transport');

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    service: 'gmail',
    // port: 587,
    // secure: false,
    auth: {
        user: config.username,
        pass: config.password
    }
});

function sendmail(req) {
    let templateDir = path.join(__dirname, "../", 'emailTemplate', 'testMailTemplate')

    let testMailTemplate = new EmailTemplate(templateDir);

    let locals = {
        mailList: req.body.param.mailList + req.body.param.action + "&email=" + req.body.param.to,
        action: req.body.param.action ? req.body.param.action : '',
        title: req.body.param.subject,
        content: req.body.param.text ? req.body.param.text : '',
        url: req.body.param.url ? req.body.param.url : '',
        category_id: req.body.param.category_id ? req.body.param.category_id : '',
        ticket_number: req.body.param.ticket_number ? req.body.param.ticket_number : '',
        ticket_type: req.body.param.ticket_type ? req.body.param.ticket_type : '',
        product: req.body.param.product ? req.body.param.product : '',
        ticketMessage: req.body.param.ticketMessage ? req.body.param.ticketMessage : '',
        reply: req.body.param.reply ? req.body.param.reply : '',
        username: req.body.param.username ? req.body.param.username : '',
        password: req.body.param.password ? req.body.param.password : '',
        features: req.body.param.features ? req.body.param.features : '',
        customer: req.body.param.customer ? req.body.param.customer : '',
        extension_name: req.body.param.ext_name ? req.body.param.ext_name : '',
    };

    return testMailTemplate.render(locals, function (err, temp) {
        if (err) { console.log("error", err) }
        else {
            transporter.sendMail({
                from: 'help@cloud-connect.in',
                to: req.body.param.to,
                subject: req.body.param.subject,
                text: req.body.param.text,
                html: temp.html,
            }, function (error, info) {
                if (error) {
                    console.log(error);
                    return ({ success: false, msg: 'Mail not sent!', sendStatus: 500 });
                } else {
                    console.log('Message sent: ' + info.response);
                    return ({ success: true, msg: 'Mail sent', sendStatus: 200 });
                }

            })
        }
    })
}

module.exports = { sendmail };
