const { knex } = require('../config/knex.db');
const table = require('../config/table.macros');

let EmailTemplate = require('email-templates').EmailTemplate;
let path = require('path');
let nodemailer = require("nodemailer");
const config = require('../config/app');

// const fs = require('fs');
// let smtpTransport = require('nodemailer-smtp-transport');

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    service: 'gmail',
    // port: 587,
    // secure: false,
    pool: false,
    auth: {
        user: config.username,
        pass: config.password
    } 
});

function getCustomerNameandEmail(req) {
    return knex.raw("select CONCAT(first_name, \' \',last_name) as name,company_name,email \
     from " + table.tbl_Customer + "\
    where id in (" + req + ")").then((response) => {
        if (response) {
            return ({ userName: response[0][0].name, email: response[0][0].email, company_name: response[0][0].company_name });
        }
    })
}

function getExtensionName(req) {
    return knex(table.tbl_Extension_master).where('email', '=', "" + req + "").select('username as name')
        .then((response) => {
            if (response) {
                return ({ userName: response[0].name, email: req });
            }
        })
}

function getEmailContentUsingCategory(req) {
    return knex.select('e.id', 'e.name', 'e.title', 'e.image', 'e.content', 'e.email_category_id',
        'c.category_name as category_name')
        .from(table.tbl_Email_template + ' as e')
        .leftOuterJoin(table.tbl_Email_Category + ' as c', 'e.email_category_id', 'c.id')
        .where('c.category_name', '=', "" + req + "")
        .andWhere('e.status', '=', '1')
        .then((response) => {
            return response[0];
        })
}

function getCustomerName(req) {
    return knex(table.tbl_Customer).where('email', '=', "" + req + "").andWhere('status', '=', '1')
        .select(knex.raw('CONCAT(first_name, \' \',last_name) as name'))
        .then((response) => {
            return ({ userName: response[0].name, email: req });
        })
}

function getCustomerEmail(req) {
    return knex.select('id', 'email').from(table.tbl_Customer).where('first_name', '=', "" + req + "").andWhere('status', '=', '1')
        .then((response) => {
            return ({ userName: req, email: response[0].email });
            // return res.json({ response });
        })
}

function sendmail(req) {
    console.log("send mail dataaaa -------------",req)
    // console.log('data=====',req.data);
    let templateDir = path.join(__dirname, "../", 'emailTemplate', 'testMailTemplate')
    let testMailTemplate = new EmailTemplate(templateDir);
    let locals = {
        mailList: req.mailList + req.action + "&email=" + req.data.email,
        action: req.action ? req.action : '',
        userName: req.data.userName ? req.data.userName : '',
        title: req.val.title,
        content: req.val.content ? req.val.content : '',
        url: req.val.image ? req.val.image : '',
        category_id: req.val.email_category_id ? req.val.email_category_id : '',
        ticket_number: req.ticket_number ? req.ticket_number : '',
        ticket_type: req.ticket_type_name ? req.ticket_type_name : '',
        product: req.product ? req.product : '',
        ticketMessage: req.ticketMessage ? req.ticketMessage : '',
        reply: req.reply ? req.reply : '',
        username: req.username ? req.username : '',
        password: req.password ? req.password : '',
        features: req.feature ? req.feature : '',
        customer: req.customer ? req.customer : '',
        loginURL: req.data.url ? req.data.url : '',
        invoice_number: req.data.invoice_number ? req.data.invoice_number : '',
        amount: req.data.amount ? req.data.amount : '',
        fare_amount: req.data.fare_amount ? req.data.fare_amount : '',
        gst_amount: req.data.gst_amount ? req.data.gst_amount : '',
        invoice_month: req.data.invoice_month ? req.data.invoice_month : '',
        didData : req.data.didDatas ? req.data.didDatas : [],
        customerName : req.data.cName ? req.data.cName : '',
        customerEmail : req.data.cEmail ? req.data.cEmail : '',
        customerOrganization : req.data.customerOrganization ? req.data.customerOrganization : '',
        didCountryName : req.data.countryName ? req.data.countryName : '',
        boosterDetail : req.boosterData ? req.boosterData : '',
        boostercustomerEmail : req.data.customerEmail ? req.data.customerEmail : '',
 
    };  
    // admin@ectpl.in
    // console.log('locals=',locals);
    return testMailTemplate.render(locals, function (err, temp) {
        if (err) { console.log("error", err); }
        else {
            transporter.sendMail({
                from: 'helpdesk@cloud-connect.in',
                to: req.data.email,
                subject: req.val.title,
                text: req.val.content,
                html: temp.html,
            }, function (error, info) {
                if (error) {
                    console.log(error);
                    return ({ success: false, msg: 'Mail not sent!', sendStatus: 500 });
                } 
                //else {
                    console.log('Message sent: ' + JSON.stringify(info));
                    transporter.close();
                    return ({ success: true, msg: 'Mail sent', sendStatus: 200 });
               // }
            })
        }
    })
}

module.exports = { getEmailContentUsingCategory, getCustomerNameandEmail, getCustomerName, sendmail, getCustomerEmail, getExtensionName }