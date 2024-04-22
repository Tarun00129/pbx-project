const { response } = require('express');
const { utc } = require('moment');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
let pushEmail = require('./pushEmail');

// var data="";

function createDID(req, res) {
    var finalCall = 0;
    var data = req.body.did;
    if (data.activated === true || data.activated == '1') {
        data.activated = '1';
    } else {
        data.activated = '0';
    }

     let isTypeRange = (data.is_did_range  == 1 || data.is_did_range == true) ? true : false;
    if (!isTypeRange) {
        knex(table.tbl_DID).insert({
            did: "" + data.did_number + "", billingtype: "" + data.billing + "", provider_id: "" + data.provider + "",
            country_id: "" + data.country + "", max_concurrent: data.concurrent_call, activated: "" + data.activated + "",
            customer_id: data.customer_id, fixrate: data.fixrate, connection_charge: data.connect_charge,
            selling_rate: data.selling_rate, did_type: "" + data.didType + "", create_method: "2",did_group: data.group, master_did: ""+ 0 +""
        }).then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else {
        for (let i = 0; i < data.did_number.length; i++) {
            if (i == (data.did_number.length - 1)) {
                finalCall = 1;
            }
            let sql = knex(table.tbl_DID).insert({
                did: "" + data.did_number[i] + "", billingtype: "" + data.billing + "", provider_id: "" + data.provider + "",
                country_id: "" + data.country + "", max_concurrent: data.concurrent_call, activated: "" + data.activated + "",
                customer_id: data.customer_id, fixrate: data.fixrate, connection_charge: data.connect_charge,
                selling_rate: data.selling_rate, did_type: "" + data.didType + "", create_method: "2",did_group: data.group ,  master_did: ""+ 0 +""
            });


            sql.then((response) => {                
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        }        
        if (finalCall == 1) {
            res.status(200).send({ error: 'Success', message: 'DID added sucessfully.' });
        } else {
            res.status(401).send({ error: 'error', message: 'Something went wrong.' });
        }
    }  
}

function updateDID(req, res) {
    var data = req.body.did;
    if (data.activated === true || data.activated == '1') {
        data.activated = '1';
    } else {
        data.activated = '0';
    }
    if (typeof data.fixrate == 'undefined' || data.fixrate == '') {
        data.fixrate = 0;
    }
    if (typeof data.selling_rate == 'undefined' || data.selling_rate == '') {
        data.selling_rate = 0;
    }
    var did_id = data.id;
    var sql = knex(table.tbl_DID).where('id', '=', "" + did_id + "")
        .update({
            billingtype: "" + data.billing + "", provider_id: "" + data.provider + "",
            country_id: "" + data.country + "", max_concurrent: data.concurrent_call, activated: "" + data.activated + "",
            customer_id: data.customer_id, fixrate: "" + data.fixrate + "", connection_charge: data.connect_charge,
            selling_rate: data.selling_rate, did_group: data.group
        });    
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getAllDID(req, res) {
    knex.select('d.id', 'pro.provider','d.product_id', 'c.name as country', 'd.activated','d.master_did', 'd.reserved', 'd.customer_id', 'd.did', knex.raw('CONCAT((CONCAT("+",c.phonecode)), \' \',d.did) as didDisplay'), 'd.secondusedreal',
        'd.billingtype', 'd.fixrate', 'd.connection_charge', 'd.selling_rate', 'd.max_concurrent',knex.raw('IF (d.did_group = "0","General", IF (d.did_group = "1","Premium", IF (d.did_group = "2","Private","Parked"))) as did_group'), knex.raw('IF (d.did_type = "1","DID Number", IF (d.did_type = "2","DID Number","Tollfree Number")) as did_type'),
        knex.raw('IF (d.status = "0","Inactive","Active") as status'), 'u.company_name as company', 'd.customer_id','af.active_feature','dest.active_feature_id').from(table.tbl_DID + ' as d')
        .leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
        .leftJoin(table.tbl_Country + ' as c', 'c.id', 'd.country_id')
        .leftJoin(table.tbl_Customer + ' as u', 'u.id', 'd.customer_id')
        .leftJoin(table.tbl_DID_Destination + ' as dest', 'd.id', 'dest.did_id')
        .leftJoin(table.tbl_DID_active_feature + ' as af', 'dest.active_feature_id', 'af.id')
        .where('d.status', '!=', "2")
        .orderBy('d.id', 'desc')
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function verifyDID(req, res) {
    let did = req.body.did;
    knex.from(table.tbl_DID).where('did', "" + did + "")
        .select('id')
        .then((response) => {
            if (response.length === 1) {
                const did = response[0];
                res.json({
                    did_id: did.id
                });
            } else {
                res.json({
                    did_id: ''
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function deleteDID(req, res) {
    var sql = knex(table.tbl_DID).where('id', '=', "" + req.body.did_id + "")
        .del();
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error' });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function inactiveDID(req, res) {
    var sql = knex(table.tbl_DID).where('id', '=', "" + req.body.did_id + "")
        .update({ status: "0" });
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error', sql });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function activeDID(req, res) {
    knex(table.tbl_DID).where('id', '=', "" + req.body.did_id + "")
        .update({ status: "1" })
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error' });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getDIDByFilters(req, res) { 
    let data = req.body.filters;
    var sql = knex.select('d.id', 'pro.provider', 'c.name as country', 'd.activated', 'd.reserved', 'd.customer_id', 'd.did', knex.raw('CONCAT((CONCAT("+",c.phonecode)), \' \',d.did) as didDisplay'), 'd.secondusedreal',
        'd.billingtype', 'd.fixrate', 'd.connection_charge', 'd.selling_rate', 'd.max_concurrent',knex.raw('IF (d.did_group = "0","General", IF (d.did_group = "1","Premium", IF (d.did_group = "2","Private","Parked"))) as did_group'), knex.raw('IF (d.did_type = "1","DID Number", IF (d.did_type = "2","DID Number","Tollfree Number")) as did_type'),
        knex.raw('IF (d.status = "0","Inactive","Active") as status'), 'u.company_name as company', 'd.customer_id','af.active_feature','dest.active_feature_id').from(table.tbl_DID + ' as d')
        .leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
        .leftJoin(table.tbl_Country + ' as c', 'c.id', 'd.country_id')
        .leftJoin(table.tbl_Customer + ' as u', 'u.id', 'd.customer_id')
        .leftJoin(table.tbl_DID_Destination + ' as dest', 'd.id', 'dest.did_id')
        .leftJoin(table.tbl_DID_active_feature + ' as af', 'dest.active_feature_id', 'af.id')
        .where('d.status', '!=', "2")
        .orderBy('d.id', 'desc');

    if (data.by_did != '') {
        sql = sql.andWhere('d.did', 'like', "%" + data.by_did + "%");
    }
    if ((data.by_country).length > 0) {    
        sql = sql.whereIn('c.id',data.by_country);
    }
    // if (data.by_country != '') {
    //     sql = sql.andWhere('c.id', '=', "" + data.by_country + "");
    // }
    if (data.by_status != '') {
        sql = sql.andWhere('d.reserved', '=', "" + data.by_status + "");
    }
    if ((data.by_company).length > 0) {    
        sql = sql.whereIn('u.id',data.by_company);
    }
    // if (data.by_company != '') {
    //     sql = sql.andWhere('u.company_name', 'like', "%" + data.by_company + "%");
    // }
    if (data.by_did_type != '') {
        sql = sql.andWhere('d.did_type', '=', "" + data.by_did_type + "");
    }
    if (data.by_provider != '') {
        sql = sql.andWhere('pro.id', '=', "" + data.by_provider + "");
    }
    if (data.by_group != '') {
        sql = sql.andWhere('d.did_group', '=', "" + data.by_group + "");
    }    
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getDIDById(req, res) {
    let id = parseInt(req.query.id);
    knex.select('d.id', 'pro.id as provider_id', 'c.id as country_id', 'd.activated', 'd.reserved', 'd.customer_id', 'd.did', 'd.secondusedreal',
        'd.billingtype', 'd.fixrate', 'd.connection_charge', 'd.selling_rate', 'd.max_concurrent', 'd.did_type','d.did_group',
        'd.status').from(table.tbl_DID + ' as d')
        .leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
        .leftJoin(table.tbl_Country + ' as c', 'c.id', 'd.country_id')
        .where('d.status', '!=', "2")
        .andWhere('d.id', '=', id)
        .orderBy('d.id', 'desc')
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getDIDByCountry(req, res) {
    let id = parseInt(req.query.id);
    knex.select('d.id', 'pro.id as provider_id', 'c.id as country_id', 'd.activated', 'd.reserved', 'd.customer_id', 'd.did', knex.raw('CONCAT((CONCAT("+",c.phonecode)), \' \',d.did) as didDisplay'), 'd.secondusedreal',
        'd.billingtype', 'd.fixrate', 'd.connection_charge', 'd.selling_rate', 'd.max_concurrent', 'd.did_type',knex.raw('IF (d.did_group = "0","General", IF (d.did_group = "1","Premium", IF (d.did_group = "2","Private","Parked"))) as did_group'),
        'd.status').from(table.tbl_DID + ' as d')
        .leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
        .leftJoin(table.tbl_Country + ' as c', 'c.id', 'd.country_id')
        .where('d.status', '=', "1")
        .andWhere('d.country_id', '=', id)
        .andWhere('d.reserved', '=', '0')
        .orderBy('d.id', 'desc')
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function assignDID(req, res) {   
    var finalCall = 0;
    let userTypeVal = 'DIDPurchase';
    let didData = req.body.credentials;
    let url = req.protocol + '://' + req.get('host');
    var didDatas = [];
    var countryName;
    var OrganizationName;
    var customerName = "";

    for (let i = 0; i < didData.did_number.length; i++) {
        var didId = didData.did_number[i];
        var splitData = didId.toString().split('-');
        let did_id = splitData[0];
        let did_num = splitData[1];
        let did_kind = splitData[2];
        let description = "";
        didDatas.push(did_num);
        if (did_kind == '1' || did_kind == '2') {
            description = "Charge for DID - " + did_num;
        } else {
            description = "Charge for TFN - " + did_num;
        }
        if (i == (didData.did_number.length - 1)) {
            finalCall = 1;
        }

        knex(table.tbl_DID).where('id', '=', "" + did_id + "")
            .update({
                reserved: '1', customer_id: didData.customer, product_id: didData.product_id
            }).then((respo) => {
                knex.from(table.tbl_DID + ' as did').where('did.id', "" + did_id + "")
                    .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'did.customer_id')
                    .leftJoin(table.tbl_Country + ' as cntr','cntr.id', 'did.country_id')
                    // .leftJoin(table.tbl_Package + ' as p', 'p.id', 'mcp.package_id')
                    .select('did.fixrate', 'c.company_name','cntr.nicename','c.first_name','c.last_name')
                    .then((resp) => {
                        countryName = resp[0].nicename ? resp[0].nicename : '';
                        OrganizationName = resp[0].company_name ? resp[0].company_name : '';
                        customerName = resp[0].first_name + ' ' + (resp[0].last_name ? resp[0].last_name  : '');
                        let currentDate = new Date();
                        let currentYear = currentDate.getFullYear();
                        let currentMonth = currentDate.getMonth()+1;
                        let currentDateInNumber = currentDate.getDate(); // like : 4,6,9,3,12,31,23 etc
                        let totalNumberOfDayaInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate(); // like : 30,31,28
                        let billingDay = Number(totalNumberOfDayaInCurrentMonth) - Number(currentDateInNumber);
                        let didPerDayCharges = Number(resp[0].fixrate)/totalNumberOfDayaInCurrentMonth;
                        let retroDIDcharges = (billingDay+1)*didPerDayCharges; // plus one day bcz of need to add current day too.
                        var sql = knex(table.tbl_Charge).insert({
                            did_id: "" + did_id + "", customer_id: "" + didData.customer + "", amount: "" + (retroDIDcharges).toFixed(2) + "",
                            charge_type: "1", description: "" + description, charge_status: 0,
                            invoice_status: 0, product_id: didData.product_id
                        }); 
                        sql.then((response) => {
                            if (response) {
                                knex(table.tbl_Uses).insert({
                                    did_id: "" + did_id + "", customer_id: "" + didData.customer + ""
                                }).then((response) => {
                                    if (finalCall == 1) {
                                        res.status(200).send({ error: 'Success', message: 'DID assigned sucessfully.' });
                                        let newdata = {  email: didData.adminEmail, didDatas: didDatas, cName: customerName, 
                                                        cEmail: didData.customerEmail,  url: url , userName : 'Admin' ,
                                                         customerOrganization : OrganizationName , countryName : countryName };
                                        pushEmail.getEmailContentUsingCategory(userTypeVal).then(val => {
                                            pushEmail.sendmail({ data: newdata, val: val }).then((data1) => {
                                            })
                                        })
                                    } else {
                                        res.status(401).send({ error: 'error', message: 'Something went wrong.' });
                                    }
                                    if (!response) {
                                        res.status(401).send({ error: 'error', message: 'DB Error' });
                                    }
                                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
                            } else {
                                res.status(401).send({ error: 'error', message: 'DB Error' });
                            }
                        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}

function getCustomerDID(req, res) {
    let user_id = req.query.user_id;
    var sql = knex.select('d.id','d.product_id', 'pro.provider', 'c.name as country', 'call.name as call_group_name', 'd.reserved', 'd.customer_id','d.did',  knex.raw('CONCAT((CONCAT("+",c.phonecode)), \' \',d.did) as didDisplay'), 'd.secondusedreal',
        'd.billingtype', 'd.fixrate', 'd.connection_charge', 'd.selling_rate', 'd.max_concurrent','d.did_type', knex.raw('IF (d.did_type = "1","DID Number", IF (d.did_type = "2","DID Number","Tollfree Number")) as did_type'),
        knex.raw('IF (d.did_group = "0","General", IF (d.did_group = "1","Premium", IF (d.did_group = "2","Private","Parked"))) as did_group'),
        knex.raw('IF (d.activated = "0","Inactive","Active") as activated'),
        knex.raw('IF (d.master_did = "0","Not-Master","Master") as master'),
        'd.status', 'af.active_feature','dest.active_feature_id','d.customer_id', 'dest.destination','time.name as time_group_name',
        knex.raw('IF (dest.active_feature_id = "1",ext.ext_number, IF (dest.active_feature_id = "2",ivr.name, IF (dest.active_feature_id = "3",conf.name,IF (dest.active_feature_id = "4",que.name,IF (dest.active_feature_id = "5",call.name,IF (dest.active_feature_id = "10",tc.name,IF (dest.active_feature_id = "11",bc.name,IF (dest.active_feature_id = "12",pr.prompt_name,IF (dest.active_feature_id = "13",appointment.name, ""))))))))) as destination_name')).from(table.tbl_DID + ' as d')
        .leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
        .leftJoin(table.tbl_Country + ' as c', 'c.id', 'd.country_id')
        .leftJoin(table.tbl_DID_Destination + ' as dest', 'd.id', 'dest.did_id')
        .leftJoin(table.tbl_DID_active_feature + ' as af', 'dest.active_feature_id', 'af.id')
        .leftJoin(table.tbl_Extension_master + ' as ext', 'dest.destination_id', 'ext.id')
        .leftJoin(table.tbl_Pbx_Ivr_Master + ' as ivr', 'dest.destination_id', 'ivr.id')
        .leftJoin(table.tbl_PBX_conference + ' as conf', 'dest.destination_id', 'conf.id')
        .leftJoin(table.tbl_PBX_queue + ' as que', 'dest.destination_id', 'que.id')
        .leftJoin(table.tbl_PBX_CALLGROUP + ' as call', 'dest.destination_id', 'call.id')
        .leftJoin(table.tbl_Time_Group + ' as time', 'dest.time_group_id', 'time.id')
        .leftJoin(table.tbl_pbx_tc + ' as tc', 'dest.destination_id', 'tc.id')
        .leftJoin(table.tbl_pbx_broadcast + ' as bc', 'dest.destination_id', 'bc.id')
        .leftJoin(table.tbl_pbx_prompt + ' as pr', 'dest.destination_id', 'pr.id')
        .leftJoin(table.tbl_pbx_appointment + ' as appointment', 'dest.destination_id', 'appointment.id')
        .where('d.status', '!=', "2")
        .andWhere('d.customer_id', '=', "" + user_id + "")
        .orderBy('d.id', 'desc');    
    sql.then((response) => {

        if (response) {
            res.json({
                response
            });
        }
        
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function releaseDID(req, res) {
    var reservation_month = '';
    var lastUses_id = '';
    var now = new Date();
    let did_id = req.body.did_id;
    let user_id = req.body.user_id;
    let fixrate = parseFloat(req.body.fixrate);
    var currentMonth = parseInt(now.getMonth() + 1);
    const product_id = req.body.product_id;
    let did_num = req.body.did_number;
    let did_country = req.body.did_country;        
    var sql = knex.from(table.tbl_Uses).where('did_id', "" + did_id + "")
        .select(knex.raw('DATE_FORMAT(`reservation_date`, "%m") as month'), 'id')
        .andWhere('customer_id', "" + user_id + "")
        .first()
        .orderBy('id', 'desc');        
    sql.then((response) => {                
        reservation_month = parseInt(response.month);
        lastUses_id = response.id;
        if (fixrate > 0 && currentMonth != reservation_month) {
            var totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            var oneDayPrice = parseFloat(fixrate / totalDays);
            var usedDays = now.getDate();
            var totalBill = parseFloat(oneDayPrice * usedDays);
            var sql = knex(table.tbl_Charge).insert({
                did_id: did_id, customer_id: user_id, amount: totalBill,
                charge_type: "1", description: 'Payment adjusment for DID - ' + did_num + '- ' + did_country, charge_status: 0,
                invoice_status: 0, product_id :product_id
            });
            sql.then((resp) => {
                if (resp) {
                    knex(table.tbl_DID).where('id', '=', did_id)
                        .update({
                            reserved: '0', customer_id: '0', activated: '0'
                        }).then((respo) => {
                            if (respo) {
                                knex(table.tbl_Uses).where('id', '=', lastUses_id)
                                    .update({
                                        release_date: knex.raw('CURRENT_TIMESTAMP()')
                                    }).then((response) => {
                                        if (response) {
                                            let sql = knex.from(table.tbl_DID_Destination).where('did_id', "" + did_id + "")
                                                .select('id');
                                            sql.then((resp) => {
                                                if (resp.length > 0) {
                                                    knex(table.tbl_DID_Destination).where('did_id', '=', did_id)
                                                        .del().then((respons) => {
                                                            if (respons) {
                                                                knex(table.tbl_customer_did_history).where('did_id', '=', did_id)
                                                                    .del().then((respons) => {
                                                                        res.json({
                                                                            respons
                                                                        });
                                                                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.sqlMessage }); throw err });
                                                            } else {
                                                                res.status(401).send({ error: 'error', message: 'DB Error-12' });
                                                            }
                                                        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.sqlMessage }); throw err });
                                                } else {
                                                    res.json({
                                                        response
                                                    });
                                                }
                                            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.sqlMessage }); throw err });
                                        } else {
                                            res.status(401).send({ error: 'error', message: 'DB Error' });
                                        }
                                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.sqlMessage }); throw err });
                            }
                        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
                } else {
                    res.status(401).send({ error: 'error', message: 'DB Error' });
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        } else {
            knex(table.tbl_DID).where('id', '=', did_id)
                .update({
                    reserved: '0', customer_id: '0', activated: '0' , master_did: '0'
                }).then((respo) => {                    
                    if (respo) {
                        knex(table.tbl_Uses).where('id', '=', lastUses_id)
                            .update({
                                release_date: knex.raw('CURRENT_TIMESTAMP()')
                            }).then((response) => {                                
                                if (response) {
                                    let sql = knex.from(table.tbl_DID_Destination).where('did_id', "" + did_id + "")
                                        .select('id');
                                    sql.then((resp) => {
                                        if (resp.length > 0) {                                        
                                            knex(table.tbl_DID_Destination).where('did_id', '=', did_id)
                                                .del().then((respons) => {                                                    
                                                    if (respons) {
                                                        knex(table.tbl_customer_did_history).where('did_id', '=', did_id)
                                                        .del().then((respons1) => {                                                            
                                                        res.json({
                                                            respons1
                                                        });
                                                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.sqlMessage }); throw err });
                                                    } else {
                                                        res.status(401).send({ error: 'error', message: 'DB Error' });
                                                    }
                                                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.sqlMessage }); throw err });
                                        } else {                                            
                                            res.json({
                                                response
                                            });
                                        }
                                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

                                } else {
                                    res.status(401).send({ error: 'error', message: 'DB Error' });
                                }
                            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.sqlMessage }); throw err });
                    }
                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        }

    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });        
}

function inactiveCustomerDID(req, res) {
    var sql = knex(table.tbl_DID).where('id', '=', "" + req.body.did_id + "")
        .update({ activated: 0 });
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error', sql });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function activeCustomerDID(req, res) {
    knex(table.tbl_DID).where('id', '=', "" + req.body.did_id + "")
        .update({ activated: 1 })
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error' });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function makeMasterDID(req,res) {
    let masterID    
    let m_did;        
    if(req.body.master_id=="master"){
        m_did = "1";
        masterID = "0"        
    }    
    knex(table.tbl_DID).where('did','=',""+req.body.data.did+"")    
    .update({master_did : m_did})
    .then((responses)=>{
        if(responses){                
            knex(table.tbl_DID).select('master_did','did')
            .where('master_did','1')
            .andWhere('customer_id','=',req.body.data.customer_id)
            .whereNot('did',req.body.data.did)
            .then((response)=>{                                              
                if(response!=""){                
                    knex(table.tbl_DID).where('did',response[0]['did'])
                    .update({'master_did':masterID})
                    .then((response)=>{
                        res.json({
                            response
                        })
                    })                
            }else{
                    res.json({
                        responses
                    })
                }
            })
        }else{
            res.status(400).send({error:'error'})
        }
    })
}

function getActiveFeature(req, res) {
    //var productId = req.query.product;
    var user_id = req.query.user_id;
    var sql = knex.select('pf.ivr', 'pf.call_group', 'pf.conference', 'p.name', 'pf.voicemail', 'pf.music_on_hold', 'pf.queue','pf.custom_prompt','pf.teleconsultation as tele_consultancy',
                          'pf.broadcasting as broadcasting', 'pf.playback',  'pf.feed_back_call as feedbackcall', 'pf.click_to_call', 'pf.appointment')
        .from(table.tbl_PBX_features + ' as pf')
        .leftJoin(table.tbl_Package + ' as p', 'p.feature_id', 'pf.id')
        .leftJoin(table.tbl_Map_customer_package + ' as map', 'p.id', 'map.package_id')
        .where('p.product_id', '=', "1").andWhere('map.customer_id', '=', "" + user_id + "");    
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error' });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getDestination(req, res) {
    var user_id = req.query.user_id;
    var feature_id = req.query.feature;    
    if (feature_id == '1') { //SIP
        var sql = knex.select('id', knex.raw('CONCAT(ext_number, \'-\',caller_id_name) as name')).from(table.tbl_Extension_master)
            .where('status', '=', "1")
            .andWhere('customer_id', '=', "" + user_id + "")
            .orderBy('id', 'desc');
    } else if (feature_id == '2') { //IVR
        var sql = knex.select('id', 'name').from(table.tbl_Pbx_Ivr_Master)
            .where('status', '=', "1")
            .andWhere('customer_id', '=', "" + user_id + "")
            .andWhere('is_multilevel_ivr', '=', "0")
            .andWhere('feedback_call', '=', "0")
            .orderBy('id', 'desc');
    } else if (feature_id == '3') { //Conference
        var sql = knex.select('id', 'name').from(table.tbl_PBX_conference)
            .where('status', '=', "1")
            .andWhere('customer_id', '=', "" + user_id + "")
            .orderBy('id', 'desc');
    } else if (feature_id == '4') { //Queue
        var sql = knex.select('id', 'name').from(table.tbl_PBX_queue)
            .where('status', '=', "1")
            .andWhere('customer_id', '=', "" + user_id + "")
            .orderBy('id', 'desc');
    } else if (feature_id == '5') { //Ring Group
        var sql = knex.select('id', 'name').from(table.tbl_PBX_CALLGROUP)
            .where('customer_id', '=', "" + user_id + "")
            .orderBy('id', 'desc');
    }else if (feature_id == '10') { //Tele Consultation
        var sql = knex.select('id', 'name').from(table.tbl_pbx_tc)
            .where('customer_id', '=', "" + user_id + "")
            .orderBy('id', 'desc');
    }else if (feature_id == '11') { //Broadcasting
        var sql = knex.select('id', 'name').from(table.tbl_pbx_broadcast)
            .where('customer_id', '=', "" + user_id + "")
            .orderBy('id', 'desc');
    } else if (feature_id == '12') { //Playback
        var sql = knex.select('id', 'prompt_name as name').from(table.tbl_pbx_prompt)
            .where('customer_id', '=', "" + user_id + "")
            .orderBy('id', 'desc');
    } else if (feature_id == '13') { //Appointment
        var sql = knex.select('id', 'name').from(table.tbl_pbx_appointment)
            .where('customer_id', '=', "" + user_id + "")
            .orderBy('id', 'desc');       
    }
    // con sole.log(sql.toString());
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error' });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function createDestination(req, res) {
    var data = req.body.credentials;    
    var sql = knex(table.tbl_DID_Destination).insert({
        customer_id: data.user_id, did_id: data.did_id, active_feature_id: data.active_feature,
        destination_id: data.destination_id, destination: "" + data.destination + "",
        time_group_id: data.time_group_id 
    });
    sql.then((response) => {
        if(response){
            let sql2 =  knex.raw("call save_customer_did_feature_log(" + data.did_id+ ",'" + data.destination+ "' , '" + data.product_id + "', '" + data.time_group_id + "')");            
             sql2.then(response=>{                 
                 res.send(response[0][0]);
             })
         }else{
             res.status(401).send({ error: 'error', message: 'DB Error while updating did destination '  })
         }
        // res.json({
        //     response
        // });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getDIDDestination(req, res) {
    var user_id = req.query.user_id;
    var did_id = req.query.did_id;
    knex.from(table.tbl_DID_Destination).where('customer_id', "" + user_id + "")
        .andWhere('did_id', "" + did_id + "")
        .select('id', 'active_feature_id', 'destination_id','time_group_id')
        .then((response) => {
            if (response.length === 1) {
                const did = response[0];
                res.json({
                    did
                });
            } else {
                res.json({
                    did: ''
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function updateDestination(req, res) {
    var data = req.body.credentials;
     dest = data.destination;
     var id = data.did_id;
    var sql = knex(table.tbl_DID_Destination).where('id', '=', "" + data.id + "")
        .update({
            active_feature_id: data.active_feature,
            destination_id: data.destination_id, destination: "" + data.destination + "",
            time_group_id: data.time_group_id
        });
    sql.then((response) => {
        if(response){
            let sql2 =  knex.raw("call save_customer_did_feature_log(" + data.did_id+ ",'" + data.destination+ "' , '" + data.product_id + "', '" + data.time_group_id+ "')");           
            sql2.then(response=>{                
                res.send(response[0][0]);
            })
        }else{
            res.status(401).send({ error: 'error', message: 'DB Error while updating did destination '  })
        }
        // res.json({
        //     response
        // });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function getCustomerDIDByFilters(req, res) {
    let data = req.body.filters;    
    let user_id = req.body.user_id;
    var sql = knex.select('d.id','d.product_id','pro.provider', 'c.name as country', 'd.reserved', 'd.customer_id','d.did', knex.raw('CONCAT((CONCAT("+",c.phonecode)), \' \',d.did) as didDisplay'), 'd.secondusedreal',
        'd.billingtype', 'd.fixrate', 'd.connection_charge', 'd.selling_rate', 'd.max_concurrent', 'call.name as call_group_name',  knex.raw('IF (d.did_type = "1","DID Number", IF (d.did_type = "2","DID Number","Tollfree Number")) as did_type'),
        knex.raw('IF (d.activated = "0","Inactive","Active") as activated'),
        knex.raw('IF (d.did_group = "0","General", IF (d.did_group = "1","Premium", IF (d.did_group = "2","Private","Parked"))) as did_group'),
        'd.status', 'af.active_feature', 'd.customer_id', 'dest.destination','time.name as time_group_name',
        knex.raw('IF (dest.active_feature_id = "1",ext.ext_number, IF (dest.active_feature_id = "2",ivr.name, IF (dest.active_feature_id = "3",conf.name,IF (dest.active_feature_id = "4",que.name,IF (dest.active_feature_id = "5",call.name,IF (dest.active_feature_id = "10",tc.name,IF (dest.active_feature_id = "11",bc.name, ""))))))) as destination_name')).from(table.tbl_DID + ' as d')
        .leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
        .leftJoin(table.tbl_Country + ' as c', 'c.id', 'd.country_id')
        .leftJoin(table.tbl_DID_Destination + ' as dest', 'd.id', 'dest.did_id')
        .leftJoin(table.tbl_DID_active_feature + ' as af', 'dest.active_feature_id', 'af.id')
        .leftJoin(table.tbl_Extension_master + ' as ext', 'dest.destination_id', 'ext.id')
        .leftJoin(table.tbl_Pbx_Ivr_Master + ' as ivr', 'dest.destination_id', 'ivr.id')
        .leftJoin(table.tbl_PBX_conference + ' as conf', 'dest.destination_id', 'conf.id')
        .leftJoin(table.tbl_PBX_queue + ' as que', 'dest.destination_id', 'que.id')
        .leftJoin(table.tbl_PBX_CALLGROUP + ' as call', 'dest.destination_id', 'call.id')
        .leftJoin(table.tbl_Time_Group + ' as time', 'dest.time_group_id', 'time.id')
        .leftJoin(table.tbl_pbx_tc + ' as tc', 'dest.destination_id', 'tc.id')
        .leftJoin(table.tbl_pbx_broadcast + ' as bc', 'dest.destination_id', 'bc.id')
        .where('d.status', '!=', "2")
        .andWhere('d.customer_id', '=', "" + user_id + "")
        .orderBy('d.id', 'desc');

    if (data.by_did != '') {
        sql = sql.andWhere('d.did', 'like', "%" + data.by_did + "%");
    }
    if ((data.by_country).length > 0) {    
        sql = sql.whereIn('c.id',data.by_country);
    }
    // if (data.by_country != '') {
    //     sql = sql.andWhere('c.id', '=', "" + data.by_country + "");
    // }
    if (data.by_status != '') {
        sql = sql.andWhere('d.activated', '=', "" + data.by_status + "");
    }
    if (data.by_did_type != '') {
        sql = sql.andWhere('d.did_type', '=', "" + data.by_did_type + "");
    }
    if (data.by_group != '') {
        sql = sql.andWhere('d.did_group', '=', "" + data.by_group + "");
    }

    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getInternalUserDIDByFilters(req, res) {
    let data = req.body.filters;
    let accountMAnagerId = req.body.user_id;
    knex.select('id').from(table.tbl_Customer).where("account_manager_id", "=", "" + accountMAnagerId + "")
        .whereNotIn('status', ['2'])
        .then((response) => {
            let customerId = Object.values(JSON.parse(JSON.stringify(response)));
            var lastCustomerId = [];
            for (let i = 0; i < customerId.length; i++) {
                lastCustomerId.push(customerId[i].id);
            }
            var sql = knex.select('d.id', 'pro.provider', 'c.name as country', 'd.reserved', 'd.customer_id', 'd.did', knex.raw('CONCAT((CONCAT("+",c.phonecode)), \' \',d.did) as didDisplay'), 'd.secondusedreal',
                'd.billingtype', 'd.fixrate', 'd.connection_charge', 'd.selling_rate', 'd.max_concurrent', knex.raw('IF (d.did_type = "1","DID Number", IF (d.did_type = "2","DID Number","Tollfree Number")) as did_type'),
                knex.raw('IF (d.activated = "0","Inactive","Active") as activated'),
                knex.raw('IF (d.did_group = "0","General", IF (d.did_group = "1","Premium", IF (d.did_group = "2","Private","Parked"))) as did_group'),
                'd.status', 'af.active_feature', 'd.customer_id', 'cus.company_name', 'dest.destination',
                knex.raw('IF (dest.active_feature_id = "1",ext.ext_number, IF (dest.active_feature_id = "2",ivr.name, IF (dest.active_feature_id = "3",conf.name,IF (dest.active_feature_id = "4",que.name,IF (dest.active_feature_id = "5",call.name, ""))))) as destination_name')).from(table.tbl_DID + ' as d')
                .leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
                .leftJoin(table.tbl_Country + ' as c', 'c.id', 'd.country_id')
                .leftJoin(table.tbl_DID_Destination + ' as dest', 'd.id', 'dest.did_id')
                .leftJoin(table.tbl_DID_active_feature + ' as af', 'dest.active_feature_id', 'af.id')
                .leftJoin(table.tbl_Customer + ' as cus', 'd.customer_id', 'cus.id')
                .leftJoin(table.tbl_Extension_master + ' as ext', 'dest.destination_id', 'ext.id')
                .leftJoin(table.tbl_Pbx_Ivr_Master + ' as ivr', 'dest.destination_id', 'ivr.id')
                .leftJoin(table.tbl_PBX_conference + ' as conf', 'dest.destination_id', 'conf.id')
                .leftJoin(table.tbl_PBX_queue + ' as que', 'dest.destination_id', 'que.id')
                .leftJoin(table.tbl_PBX_CALLGROUP + ' as call', 'dest.destination_id', 'call.id')
                
                .where('d.status', '!=', "2")
                .whereIn('d.customer_id', lastCustomerId)
                .orderBy('d.id', 'desc');


            if (data.by_did != '') {
                sql = sql.andWhere('d.did', 'like', "%" + data.by_did + "%");
            }
            if ((data.by_country).length > 0) {    
                sql = sql.whereIn('c.id',data.by_country);
            }
            if (data.by_status != '') {
                sql = sql.andWhere('d.activated', '=', "" + data.by_status + "");
            }
            // if (data.by_company != '') {
            //     sql = sql.andWhere('cus.company_name', 'like', "%" + data.by_company + "%");
            // }
            if ((data.by_company).length > 0) {    
                sql = sql.whereIn('cus.id',data.by_company);
            }
            if (data.by_group != '') {
                sql = sql.andWhere('d.did_group', '=', "" + data.by_group + "");
            }            
            sql.then((response) => {
                if (response) {
                    res.json({
                        response
                    });
                } else {
                    res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getIntenalUserDID(req, res) {
    let user_id = req.query.user_id;
    knex.select('id').from(table.tbl_Customer).where("account_manager_id", "=", "" + user_id + "")
        .whereNotIn('status', ['2'])
        .then((response) => {
            let customerId = Object.values(JSON.parse(JSON.stringify(response)));
            var lastCustomerId = [];
            for (let i = 0; i < customerId.length; i++) {
                lastCustomerId.push(customerId[i].id);
            }
            knex.select('d.id', 'pro.provider', 'c.name as country', 'd.activated', 'd.reserved', 'd.customer_id', 'd.did', knex.raw('CONCAT((CONCAT("+",c.phonecode)), \' \',d.did) as didDisplay'), 'd.secondusedreal',
                'd.billingtype', 'd.fixrate', 'd.connection_charge', 'd.selling_rate', 'd.max_concurrent', knex.raw('IF (d.did_type = "1","DID Number", IF (d.did_type = "2","DID Number","Tollfree Number")) as did_type'),
                knex.raw('IF (d.activated = "0","Inactive","Active") as activated'),
                knex.raw('IF (d.did_group = "0","General", IF (d.did_group = "1","Premium", IF (d.did_group = "2","Private","Parked"))) as did_group'),
                'd.status', 'af.active_feature', 'd.customer_id', 'cus.company_name', 'dest.destination',
                knex.raw('IF (dest.active_feature_id = "1",ext.ext_number, IF (dest.active_feature_id = "2",ivr.name, IF (dest.active_feature_id = "3",conf.name,IF (dest.active_feature_id = "4",que.name,IF (dest.active_feature_id = "5",call.name, ""))))) as destination_name')).from(table.tbl_DID + ' as d')
                .leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
                .leftJoin(table.tbl_Country + ' as c', 'c.id', 'd.country_id')
                .leftJoin(table.tbl_DID_Destination + ' as dest', 'd.id', 'dest.did_id')
                .leftJoin(table.tbl_DID_active_feature + ' as af', 'dest.active_feature_id', 'af.id')
                .leftJoin(table.tbl_Customer + ' as cus', 'd.customer_id', 'cus.id')
                .leftJoin(table.tbl_Extension_master + ' as ext', 'dest.destination_id', 'ext.id')
                .leftJoin(table.tbl_Pbx_Ivr_Master + ' as ivr', 'dest.destination_id', 'ivr.id')
                .leftJoin(table.tbl_PBX_conference + ' as conf', 'dest.destination_id', 'conf.id')
                .leftJoin(table.tbl_PBX_queue + ' as que', 'dest.destination_id', 'que.id')
                .leftJoin(table.tbl_PBX_CALLGROUP + ' as call', 'dest.destination_id', 'call.id')
                .where('d.status', '!=', "2")
                .whereIn('d.customer_id', lastCustomerId)
                .orderBy('d.id', 'desc')
                .then((response) => {
                    res.json({ response });
                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getSupportDIDByFilters(req, res) {
    let data = req.body.filters;
    let id = req.body.productId;
    var sql = knex.select('d.id', 'pro.provider', 'c.name as country', 'd.activated', 'd.reserved', 'd.customer_id', 'd.did', knex.raw('CONCAT((CONCAT("+",c.phonecode)), \' \',d.did) as didDisplay'), 'd.secondusedreal',
        'd.billingtype', 'd.fixrate', 'd.connection_charge', 'd.selling_rate', 'd.max_concurrent', knex.raw('IF (d.did_type = "1","DID Number", IF (d.did_type = "2","DID Number","Tollfree Number")) as did_type'),
        knex.raw('IF (d.activated = "0","Inactive","Active") as activated'),
        knex.raw('IF (d.did_group = "0","General", IF (d.did_group = "1","Premium", IF (d.did_group = "2","Private","Parked"))) as did_group'),
        'd.status', 'af.active_feature', 'd.customer_id', 'cus.company_name', 'dest.destination',
        knex.raw('IF (dest.active_feature_id = "1",ext.ext_number, IF (dest.active_feature_id = "2",ivr.name, IF (dest.active_feature_id = "3",conf.name,IF (dest.active_feature_id = "4",que.name,IF (dest.active_feature_id = "5",call.name,IF (dest.active_feature_id = "10",tc.name,IF (dest.active_feature_id = "11",bc.name, ""))))))) as destination_name')).from(table.tbl_DID + ' as d')
        .leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
        .leftJoin(table.tbl_Country + ' as c', 'c.id', 'd.country_id')
        .leftJoin(table.tbl_DID_Destination + ' as dest', 'd.id', 'dest.did_id')
        .leftJoin(table.tbl_DID_active_feature + ' as af', 'dest.active_feature_id', 'af.id')
        .leftJoin(table.tbl_Customer + ' as cus', 'd.customer_id', 'cus.id')
        .leftJoin(table.tbl_Map_customer_package + ' as map', 'map.customer_id', 'cus.id')
        .leftJoin(table.tbl_Product + ' as prod', 'prod.id', 'map.product_id')
        .leftJoin(table.tbl_Extension_master + ' as ext', 'dest.destination_id', 'ext.id')
        // .leftJoin(table.tbl_Pbx_Ivr_Master + ' as ivr', 'dest.destination_id', 'ivr.id')
        .leftJoin(table.tbl_Pbx_Ivr_Master + ' as ivr', 'dest.destination_id', 'ivr.id')
        .leftJoin(table.tbl_PBX_conference + ' as conf', 'dest.destination_id', 'conf.id')
        .leftJoin(table.tbl_PBX_queue + ' as que', 'dest.destination_id', 'que.id')
        .leftJoin(table.tbl_PBX_CALLGROUP + ' as call', 'dest.destination_id', 'call.id')
        .leftJoin(table.tbl_pbx_tc + ' as tc', 'dest.destination_id', 'tc.id')
        .leftJoin(table.tbl_pbx_broadcast + ' as bc', 'dest.destination_id', 'bc.id')
        .where('prod.id', "=", "" + id + "")
        .andWhere('d.status', '!=', "2")
        .orderBy('d.id', 'desc');     
    if (data.by_did != '') {
        sql = sql.andWhere('d.did', 'like', "%" + data.by_did + "%");
    }
    // if (data.by_country != '') {  // comment bcz  of multiselect searchable by nagender
    if ((data.by_country).length > 0) {
            sql = sql.whereIn('c.id',  data.by_country);
    }
    if (data.by_status != '') {
        sql = sql.andWhere('d.activated', '=', "" + data.by_status + "");
    }

    // if (data.by_company != '') {// comment bcz  of multiselect searchable by nagender
    if ((data.by_company).length > 0) {    
        sql = sql.whereIn('cus.id',data.by_company);
    }

    // if (data.by_provider != '')  {  //comment bcz  of multiselect searchable by nagender
    if ((data.by_provider).length > 0) { 
        sql = sql.whereIn('d.provider_id',  data.by_provider );
    }

    if (data.by_group != '') {
        sql = sql.andWhere('d.did_group', '=', "" + data.by_group + "");
    }    
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getSupportProductWiseDID(req, res) {
    let id = req.query.productId;
    var sql = knex.select('d.id', 'pro.provider', 'c.name as country', 'd.activated', 'd.reserved', 'd.customer_id', 'd.did', knex.raw('CONCAT((CONCAT("+",c.phonecode)), \' \',d.did) as didDisplay'), 'd.secondusedreal',
        'd.billingtype', 'd.fixrate', 'd.connection_charge', 'd.selling_rate', 'd.max_concurrent',
        knex.raw('IF (d.did_type = "1","DID Number", IF (d.did_type = "2","DID Number","Tollfree Number")) as did_type'),
        knex.raw('IF (d.activated = "0","Inactive","Active") as activated'),
        knex.raw('IF (d.did_group = "0","General", IF (d.did_group = "1","Premium", IF (d.did_group = "2","Private","Parked"))) as did_group'),
        'd.status', 'af.active_feature', 'd.customer_id', 'cus.company_name', 'dest.destination',
        knex.raw('IF (dest.active_feature_id = "1",ext.ext_number, IF (dest.active_feature_id = "2",ivr.name, IF (dest.active_feature_id = "3",conf.name,IF (dest.active_feature_id = "4",que.name,IF (dest.active_feature_id = "5",call.name,IF (dest.active_feature_id = "10",tc.name,IF (dest.active_feature_id = "11",bc.name, ""))))))) as destination_name')).from(table.tbl_DID + ' as d')
        .leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
        .leftJoin(table.tbl_Country + ' as c', 'c.id', 'd.country_id')
        .leftJoin(table.tbl_DID_Destination + ' as dest', 'd.id', 'dest.did_id')
        .leftJoin(table.tbl_DID_active_feature + ' as af', 'dest.active_feature_id', 'af.id')
        .leftJoin(table.tbl_Customer + ' as cus', 'd.customer_id', 'cus.id')
        .leftJoin(table.tbl_Map_customer_package + ' as map', 'map.customer_id', 'cus.id')
        .leftJoin(table.tbl_Product + ' as prod', 'prod.id', 'map.product_id')
        .leftJoin(table.tbl_Extension_master + ' as ext', 'dest.destination_id', 'ext.id')
        .leftJoin(table.tbl_Pbx_Ivr_Master + ' as ivr', 'dest.destination_id', 'ivr.id')
        .leftJoin(table.tbl_PBX_conference + ' as conf', 'dest.destination_id', 'conf.id')
        .leftJoin(table.tbl_PBX_queue + ' as que', 'dest.destination_id', 'que.id')
        .leftJoin(table.tbl_PBX_CALLGROUP + ' as call', 'dest.destination_id', 'call.id')
        .leftJoin(table.tbl_pbx_tc + ' as tc', 'dest.destination_id', 'tc.id')
        .leftJoin(table.tbl_pbx_broadcast + ' as bc', 'dest.destination_id', 'bc.id')
        .where('prod.id', "=", "" + id + "")
        .andWhere('d.status', '!=', "2")
        .orderBy('d.id', 'desc');    
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getProductWiseCustomer(req, res){
    var id = req.query.id;
    var sql = knex.select('c.company_name', 'c.id','c.first_name', 'c.last_name')
        .from(table.tbl_Customer + ' as c')       
        .leftJoin(table.tbl_Map_customer_package + ' as map', 'c.id', 'map.customer_id') 
        .where('map.product_id', '=', id).andWhere('c.status', '=', "1").andWhere('c.role_id', '=', "1");    
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error' });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


function getAllMappedDIDHistroy(req, res) {
  let sql = knex.select('du.id',knex.raw('DATE_FORMAT(du.reservation_date, "%d/%m/%Y %H:%i:%s") as reservation_date'),knex.raw('DATE_FORMAT(du.release_date, "%d/%m/%Y %H:%i:%s") as release_date'),'cust.first_name','cust.last_name', 'cust.company_name','d.product_id',
    'd.activated', 'd.reserved', 'd.customer_id', 'd.did', knex.raw('CONCAT((CONCAT("+",c.phonecode)), \' \',d.did) as didDisplay'), 'd.secondusedreal',
        'd.billingtype', 'd.fixrate', 'd.connection_charge','c.name as country', 'd.selling_rate','pro.provider', 'd.max_concurrent',knex.raw('IF (d.did_group = "0","General", IF (d.did_group = "1","Premium", IF (d.did_group = "2","Private","Parked"))) as did_group'), knex.raw('IF (d.did_type = "1","DID Number", IF (d.did_type = "2","DID Number","Tollfree Number")) as did_type'),
        knex.raw('IF (d.status = "0","Inactive","Active") as status'))
        .from(table.tbl_Uses + ' as du')
        .leftJoin(table.tbl_DID + ' as d', 'd.id', 'du.did_id')
         .leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
         .leftJoin(table.tbl_Country + ' as c', 'c.id', 'd.country_id')
        .leftJoin(table.tbl_Customer + ' as cust', 'cust.id', 'du.customer_id')
        .where('d.status', '!=', "2")
        .groupBy('du.did_id')
        .orderBy('du.did_id', 'desc');    
        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getAllFeatureDIDHistory(req, res){
    var id = req.query.id;
    var sql = knex.select('FD.did_number','FD.did_id','FD.product','FD.assigned_to','FD.time_group_name',
                   knex.raw('DATE_FORMAT(FD.reservation_date,"%d-%m-%Y %H:%i:%s") as reservation_date'),
                   knex.raw('DATE_FORMAT(FD.release_date,"%d-%m-%Y %H:%i:%s") as release_date'))
                  .from(table.tbl_customer_did_history + ' as FD').where('FD.did_id','=',id).orderBy('FD.reservation_date','desc');    
    sql.then((response) => {
    if (response) { 
        res.json({
            response
        });
    } else {
        res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
    }
}).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


function getMappedDIDByFilters(req, res) { 
    let data = req.body.filters;
    var sql = knex.select('du.id',knex.raw('DATE_FORMAT(du.reservation_date, "%d/%m/%Y %H:%i:%s") as reservation_date'),knex.raw('DATE_FORMAT(du.release_date, "%d/%m/%Y %H:%i:%s") as release_date'),'cust.first_name','cust.last_name', 'cust.company_name','d.product_id',
    'd.activated', 'd.reserved', 'd.customer_id', 'd.did', knex.raw('CONCAT((CONCAT("+",c.phonecode)), \' \',d.did) as didDisplay'), 'd.secondusedreal',
        'd.billingtype', 'd.fixrate', 'd.connection_charge','c.name as country', 'd.selling_rate','pro.provider', 'd.max_concurrent',knex.raw('IF (d.did_group = "0","General", IF (d.did_group = "1","Premium", IF (d.did_group = "2","Private","Parked"))) as did_group'), knex.raw('IF (d.did_type = "1","DID Number", IF (d.did_type = "2","DID Number","Tollfree Number")) as did_type'),
        knex.raw('IF (d.status = "0","Inactive","Active") as status'))
        .from(table.tbl_Uses + ' as du')
        .leftJoin(table.tbl_DID + ' as d', 'd.id', 'du.did_id')
        .leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
        .leftJoin(table.tbl_Country + ' as c', 'c.id', 'd.country_id')
        .leftJoin(table.tbl_Customer + ' as cust', 'cust.id', 'du.customer_id')
        .where('d.status', '!=', "2");

       
    if (data.by_type == 'filter') {
        sql = sql.orderBy('du.did_id', 'desc');
    } else {
        sql = sql.orderBy('du.id', 'asc');
    }

    if (data.by_did != '') {
        sql = sql.andWhere('d.did', 'like', "%" + data.by_did + "%");
    }
    if ((data.by_country).length > 0) {    
        sql = sql.whereIn('c.id',data.by_country);
    }
    if ((data.by_company).length > 0) {    
        sql = sql.whereIn('cust.id',data.by_company);
    }
   if(data.by_type == 'filter'){
    sql = sql.groupBy('du.did_id')
   }    
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}
module.exports = {
    assignDID, createDID, getAllDID, verifyDID, deleteDID, getDIDById,
    getDIDByFilters, inactiveDID, activeDID, updateDID, getDIDByCountry,
    getCustomerDID, releaseDID, activeCustomerDID, inactiveCustomerDID,
    getActiveFeature, getDestination, createDestination, getDIDDestination,
    updateDestination, getCustomerDIDByFilters, getInternalUserDIDByFilters,
    getIntenalUserDID, getSupportDIDByFilters, getSupportProductWiseDID, getProductWiseCustomer,
    getAllMappedDIDHistroy, getMappedDIDByFilters,getAllFeatureDIDHistory, makeMasterDID
};