const config = require('../config/app');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const checksum_lib = require('./checkSum');
const https = require('https');
const qs = require('querystring');

function createSoftPhoneLogs(req, res) {
    knex(table.tbl_pbx_softPhone_logs).insert({
        device_info: "" + req.body.device_info + "",
        mac_address: "" + req.body.mac_address + "",
        sip_info: "" + req.body.sip_info + "",
        operator_info: "" + req.body.operator_info + "",
    })
        .then((response) => {
            if (response.length > 0) {
                res.json({
                    data: req.body,
                    StatusCode: 200,
                    message: 'You have successfully logged in.'
                });
            } else {
                res.status(401).send({ error: 'Unauthorized', message: 'Softphone log Creation error' });
            }
        }).catch((err) => {
            res.status(400).send({
                StatusCode: 400,
                DB_Errorcode: err.errno,
                message: 'DB Error: ' + err.message
            }); throw err
        });
}

function login(req, res) {
    let data = req.body;
    let sql = knex.select('*')
        .from(table.tbl_Extension_master + ' as ext')
        .where('ext.ext_number', '=', "" + data.username + "")
        .andWhere('ext.sip_password', '=', "" + data.password + "");

    sql.then((response) => {
        if (response.length > 0) {
            knex(table.tbl_pbx_softPhone_logs).insert({
                username: "" + req.body.username  + "",
                device_info: "" + req.body.device_info + "",
                mac_address: "" + req.body.mac_address + "",
                sip_info: "" + req.body.sip_info + "",
                operator_info: "" + req.body.operator_info + "",
            })
                .then((response2) => {
                    if (response2.length > 0) {
                        res.json({
                            data: response,
                            token: response[0].token,
                            StatusCode: 200,
                            message: 'You have successfully logged in.'
                        });

                    } else {
                        res.status(401).send({ error: 'Unauthorized', message: 'Softphone log Creation error' });
                    }
                }).catch((err) => {
                    res.status(400).send({
                        StatusCode: 400,
                        DB_Errorcode: err.errno,
                        message: 'DB Error: ' + err.message
                    }); throw err
                });
        } else {
            res.status(401).send({ error: 'Unauthorized', message: 'user does not exist' });
        }
    }).catch((err) => {
        res.status(400).send({
            StatusCode: 400,
            DB_Errorcode: err.errno,
            message: 'DB Error: ' + err.message
        }); throw err
    });
}

function location(req, res) {
    knex(table.tbl_pbx_softPhone_logs).insert({
        username: "" + req.body.username + "",
        city: "" + req.body.city + "",
        state: "" + req.body.state + "",
        country: "" + req.body.country + "",
        latitude: "" + req.body.latitude + "",
        longitude: "" + req.body.longitude + "",
    })
        .then((response) => {
            if (response.length > 0) {
                res.json({
                    data: req.body,
                    StatusCode: 200,
                    message: 'You have uploaded location data.'
                });
            } else {
                res.status(401).send({ error: 'Unauthorized', message: 'Softphone location Creation error' });
            }
        }).catch((err) => {
            res.status(400).send({
                StatusCode: 400,
                DB_Errorcode: err.errno,
                message: 'DB Error: ' + err.message
            }); throw err
        });
}

function getContact(req, res) {
    let id = parseInt(req.query.username);
    var sql = knex.from(table.tbl_Extension_master + ' as ext')
        .select('ext.id')
        // .where('ext.username', '=', id);
        .where('ext.ext_number', '=', id);
    sql.then((response) => {
        console.log('>>>>>>>>>>>',response)
        if (response.length) {
            let ext_id = response[0].id;
            var sql2 = knex.from(table.tbl_Contact_list + ' as c')
                .select('*')
                .where('c.extension_id', '=', ext_id);
            sql2.then((response2) => {
                res.json({
                    data: response2,
                    StatusCode: 200,
                    message: 'Contact list.'
                })
            }).catch((err) => { console.log(err); throw err });
        } else {
            res.status(401).send({ error: 'Unauthorized', message: 'user does not exist' });
        }
    }).catch((err) => { console.log(err); throw err });
}

function getCallHistory(req, res) {
    let id = parseInt(req.query.username);
    var sql = knex.from(table.tbl_Extension_master + ' as ext')
        .select('ext.id')
        .where('ext.ext_number', '=', id);
    sql.then((response) => {
        if (response.length) {
            let ext_id = response[0].id;
            knex.raw("Call pbx_getExtensionCdrInfo(" + ext_id + ")").then((response) => {
                if (response) {
                    res.send({ 
                        data: response[0][0], 
                        StatusCode: 200,
                        message: 'Call History.'
                    });
                }
            }).catch((err) => {
                res.send({ response: { code: err.errno, message: err.sqlMessage } });
            });

        } else {
            res.status(401).send({ error: 'Unauthorized', message: 'user does not exist' });
        }
    }).catch((err) => { console.log(err); throw err });
}
module.exports = {
    login, createSoftPhoneLogs, location, getContact, getCallHistory
};
