const config = require('../config/app');
const jwt = require('jsonwebtoken');
const { knex } = require('../config/knex.db');
// const Hash = require('crypto-js/pbkdf2');
const Hash = require('crypto-js');
const table = require('../config/table.macros.js');
const pushEmail = require('./pushEmail');
const encrypt = require('../config/custom_encryption.utils');
const { decrypt } = require('./crypt');
const os = require('os');
const ipify = require('ipify2');



function  login(req, res) {       
    let password = '';    
    if(req.body.user.loginType == 'byAdmin'){
        password = req.body.user.password;
    }else{
        const private_cipher = encrypt.cipher(config.appSecret);
        password = private_cipher(req.body.user.password);
    }
    knex.raw('Call login_credential("' + req.body.user.username + '","' + password + '",\'' + req.body.user.password + '\' ,"' + 1 + '","' + req.body.user.ip + '")')
        .then((response) => {
            const user = response[0][0][0];   
            console.log(user,"USER");                                                
            knex.raw("Call pbx_save_activityLog(" + user.id + "," + user.role + ", '0','"+req.body.user.ip+"', '"+req.body.user.username+"', '"+req.headers['user-agent']+"')")
                .then((response) => {                    
                });

           let sql = knex.raw('Call getmenu(' + user.id + ',' + user.role + ')').then((response) => {       
            console.log(response[0][0],"RESPONSE");     
                res.json({
                    role: user.role,
                    user_id: user.id,
                    user_name: user.first_name + ' ' + user.last_name,
                    data: jwt.sign({
                        exp: Math.floor(Date.now() / 1000) + config.jwtExpire,
                        sub: user.id
                    }, config.jwtSecret),
                    uname: user.username,
                    uemail: user.email,
                    menu: response[0][0],
                    token : user.token,
                    code: '200'
                });                
            });


        }).catch((err) => {
            knex.raw("Call pbx_save_activityLog(0,00, '5','"+req.body.user.ip+"', '"+req.body.user.username+"', '"+req.headers['user-agent']+"')")            
            .then((response) => {                                
                res.send({ code: err.errno, message: err.sqlMessage });
            })
           
        });
}

function getHistory(req, res) {

    knex.raw('Call pbx_get_history(' + req.body.loginId + ',' + req.body.role + ')')
        .then((response) => {
            res.send(response[0][0]);
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function makeNotificationAsRead(req, res) {
    knex.raw('Call pbx_mark_read_notification(' + req.body.loginId + ',' + req.body.role + ')')
        .then((response) => {
            res.send(response[0][0]);
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function updatePassword(req, res) {
    const private_cipher = encrypt.cipher(config.appSecret);
    passwordInput = private_cipher(req.body.newPassword);
    // const passwordInput = Hash.AES.encrypt(req.body.newPassword, config.appSecret).toString();    
    knex(table.tbl_Customer).where('username', '=', "" + req.body.username + "")
        .update({ password: passwordInput }).then((response) => {
            if (response == 1) {
                pushEmail.getCustomerName(req.body.email).then((data) => {
                    pushEmail.getEmailContentUsingCategory('ChangePassword').then(val => {
                        pushEmail.sendmail({ data: data, val: val }).then((data1) => {
                            res.json({ data1 })
                        })
                    })
                })
            } else {
                res.status(401).send({ error: 'Unauthorized', message: 'Password updated' });
            }
        }).catch((err) => { console.log(err); throw err });
}

function emailExist(req, res) {
    knex(table.tbl_Customer).count('id', { as: 'count' }).where('email', '=', "" + req.body.email + "").andWhere('status', '=', '1')
        .then((response) => {
            if (response[0].count > 0) {
                pushEmail.getCustomerName(req.body.email).then((data) => {
                    pushEmail.getEmailContentUsingCategory('ForgetPassword').then(val => {
                        pushEmail.sendmail({ data: data, val: val, action: req.body.action, mailList: req.body.mailList }).then((data1) => {
                            res.json({ data1 })
                        })
                    })
                })
            } else {
                res.status(400).send({
									error: "EmailNoFound",
									message: "Email not registered in the platform",
								});
                res.json({ response })
            }
        }).catch((err) => { console.log(err); throw err });
}

function getMenuListForOcPbx(req, res) {    
    knex.raw('Call getmenulistforocpbx(' + req.body.productid + ')')
        .then((response) => {            
            res.send(response[0][0]);
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getSystemIP(req, res) {
    ipify.ipv4().then(ipv4 =>{
        res.send({
            response: ipv4
        })
    }).catch(err => console.log(err))    
}
module.exports = { login, updatePassword, emailExist, getMenuListForOcPbx, getHistory, makeNotificationAsRead, getSystemIP};
