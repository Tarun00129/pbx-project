const config = require('../config/app');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros');
// const Hash = require('crypto-js/pbkdf2');
const Hash = require('crypto-js');
const fs = require('fs');
const pushEmail = require('./pushEmail');
const checksum_lib = require('./checkSum');
var moment = require('moment');
const jwt = require('jsonwebtoken');
const encrypt = require('../config/custom_encryption.utils');


//customer
function verifyEmail(req, res) {
    let keyword = req.body.email;
    let user_id = req.body.id;
    let sql = knex.from(table.tbl_Customer)
        .select('id', 'email')
        .where('email', "" + keyword + "")
        .andWhere('status', '!=', '2')
        .andWhere('role_id', '!=', '0');
    sql.then((response) => {
        if (response.length > 0 && response[0].id != user_id) {
            const user = response[0];
            res.json({
                id: user.id
            });
        } else {
            res.json({
                id: ''
            });
        }
    }).catch((err) => { console.log(err); res.status(411).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function verifyCompany(req, res) {
    let company = req.body.company;
    let user_id = req.body.id;
    knex.from(table.tbl_Customer).where('company_name', "" + company + "")
        .andWhere('role_id', '=', '1')
        .select('id')
        .where('status', '!=', '2')
        .andWhere('role_id', '!=', '0')
        .then((response) => {
            if (response.length > 0 && response[0].id !== user_id) {
                const user = response[0];
                res.json({
                    id: user.id
                });
            } else {
                res.json({
                    id: ''
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getCustomerBillingTypePackage(req, res) {
    knex.select('pbx.billing_type').from(table.tbl_PBX_features + ' as pbx')
        .leftJoin(table.tbl_Package + ' as p', 'pbx.id', 'p.feature_id')
        .where('p.id', '=', "" + req.query.packageId + "")
        .then((response) => {
            if (response) {
                var billing_type = response[0].billing_type;
                knex.select('p.*').from(table.tbl_Package + ' as p')
                    .leftJoin(table.tbl_PBX_features + ' as pbx', 'pbx.id', 'p.feature_id')
                    .where('pbx.billing_type', '=', "" + billing_type + "").andWhere('p.product_id', '=', "" + req.query.productId + "")
                    .then((resp) => {
                        if (resp) {
                            res.json({
                                resp
                            });
                        } else {
                            res.status(411).send({ error: 'error', message: 'DB Error' });
                        }
                    });
            } else {
                res.status(411).send({ error: 'error', message: 'DB Error' });
            }
        });
}

function getCustomerById(req, res) {
    var package = '';
    var sql = knex.select('c.*', knex.raw('GROUP_CONCAT(DISTINCT (map.product_id)) as product_id'),'feat.bundle_plan_id','feat.roaming_plan_id','feat.teleConsultancy_call_plan_id','inv.paid_status as invoice_status','inv.id as invoice_status_id',
        knex.raw('GROUP_CONCAT(DISTINCT(pro.name)) as product_name'), knex.raw('GROUP_CONCAT(pack.id) as package_id'),
        knex.raw('GROUP_CONCAT(pack.name) as package_name'), 'feat.minute_plan as is_associate_with_bundle_plan', 'feat.is_bundle_type as is_associate_with_bundle_plan_real',
         'feat.is_roaming_type as is_associate_with_roaming_plan','feat.teleconsultation as is_associate_with_tc_plan','feat.billing_type as pckg_billing_type').from(table.tbl_Customer + ' as c')
        .leftJoin(table.tbl_Map_customer_package + ' as map', 'c.id', 'map.customer_id')
        .leftJoin(table.tbl_Product + ' as pro', 'map.product_id', 'pro.id')
        .leftJoin(table.tbl_Package + ' as pack', 'pack.id', 'map.package_id')
        .leftJoin(table.tbl_PBX_features + ' as feat', 'feat.id', 'pack.feature_id')
        .leftJoin(table.tbl_Pbx_Invoice + ' as inv', 'inv.customer_id', 'c.id')
        .where('c.id', '=', "" + req.query.id + "")
        .groupBy('map.customer_id')
        .orderBy('c.id', 'desc');
    sql.then((response) => {

        if (response) {            
            response[0]['pbx_package_id'] = global.pbx_package_id;
            response[0]['oc_package_id'] = global.oc_package_id;
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error' });
        }
    });
}

function deleteUser(req, res) {    
    let sql = knex(table.tbl_Customer).where('id', '=', "" + req.body.id + "").update({ status: "2" });
    const product_id = req.body.product_id;
    sql.then((response) => {
        if (response) {
            if (req.body.role == '1') {
                var sql = knex.select('d.id', 'pro.provider', 'c.name as country', 'd.reserved', 'd.customer_id', 'd.did', 'd.secondusedreal',
                    'd.billingtype', 'd.fixrate', 'd.connection_charge', 'd.selling_rate', 'd.max_concurrent', 'd.did_type', knex.raw('IF (d.did_type = "1","DID Number", IF (d.did_type = "2","DID Number","Tollfree Number")) as did_type'),
                    knex.raw('IF (d.activated = "0","Inactive","Active") as activated'),
                    'd.status', 'af.active_feature', 'd.customer_id').from(table.tbl_DID + ' as d')
                    .leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
                    .leftJoin(table.tbl_Country + ' as c', 'c.id', 'd.country_id')
                    .leftJoin(table.tbl_DID_Destination + ' as dest', 'd.id', 'dest.did_id')
                    .leftJoin(table.tbl_DID_active_feature + ' as af', 'dest.active_feature_id', 'af.id')
                    .where('d.status', '!=', "2")
                    .andWhere('d.customer_id', '=', "" + req.body.id + "")
                    .orderBy('d.id', 'desc');
                sql.then((resp) => {                                        
                    if (resp.length > 0) {                        
                        for (let i = 0; i < resp.length; i++) {
                            var reservation_month = '';
                            var lastUses_id = '';
                            var now = new Date();
                            let did_id = resp[i].id;
                            let user_id = req.body.id;
                            let fixrate = parseFloat(resp[i].fixrate);
                            var currentMonth = parseInt(now.getMonth() + 1);

                            //get resevation month
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
                                        charge_type: "1", description: 'Payment adjusment for DID', charge_status: 0,
                                        invoice_status: 0, product_id : product_id 
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
                                                                                            res.json({
                                                                                                respons
                                                                                            });                                                                                        
                                                                                        res.status(401).send({ error: 'error-1', message: 'DB Error-12' });
                                                                                    }
                                                                                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error-2', message: 'DB Error: ' + err.sqlMessage }); throw err });
                                                                        }
                                                                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error-3', message: 'DB Error: ' + err.sqlMessage }); throw err });
                                                                } else {
                                                                    res.status(401).send({ error: 'error-4', message: 'DB Error' });
                                                                }
                                                            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error-5', message: 'DB Error: ' + err.sqlMessage }); throw err });
                                                    }
                                                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error-6', message: 'DB Error: ' + err.message }); throw err });
                                        } else {
                                            res.status(401).send({ error: 'error-7', message: 'DB Error' });
                                        }
                                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error-8', message: 'DB Error: ' + err.message }); throw err });
                                } else {
                                   
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
                                                                                    res.json({
                                                                                        respons
                                                                                    });
                                                                                // } else {
                                                                        res.status(401).send({ error: 'error-11', message: 'DB Error' });
                                                                            }
                                                                        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error-22', message: 'DB Error: ' + err.sqlMessage }); throw err });
                                                                }
                                                            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error-33', message: 'DB Error: ' + err.message }); throw err });

                                                        } else {
                                                            res.status(401).send({ error: 'error-44', message: 'DB Error' });
                                                        }
                                                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error-55', message: 'DB Error: ' + err.sqlMessage }); throw err });
                                            }
                                        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error-66', message: 'DB Error: ' + err.message }); throw err });
                                }

                            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error-77', message: 'DB Error: ' + err.message }); throw err });                            
                        }
                        
                        knex(table.tbl_Customer).where('id', '=', "" + req.body.id + "").update({ status: "4" }).then((response) => {
                            if (response) {
                                res.json({ response });
                            }
                        });
                        
                    } else {
                        ///
                       
                        knex(table.tbl_Map_customer_package).where('customer_id', '=', req.body.id).del().then((respons) => {
                            if (respons) {
                                knex(table.tbl_assignpackage).where('userid', '=', req.body.id).del().then((respons) => {
                                    if (respons) {
                                        res.json({ respons }); }
                                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error-222', message: 'DB Error: ' + err.sqlMessage }); throw err });
                            }
                            else { res.status(401).send({ error: 'error-333', message: 'DB Error' }); }
                        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error-444', message: 'DB Error: ' + err.sqlMessage }); throw err });
                        ///                       
                    }
                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error-555', message: 'DB Error: ' + err.message }); throw err });
                

            }
            else { res.json({ response }); }
        }
        else { res.status(401).send({ error: 'error-666-main', message: 'DB Error' }); }
    });
}

function inactiveUser(req, res) {
    let userTypeVal = '';
    if (req.body.role == '1') { userTypeVal = 'CustomerInactiveStatus' }
    else if (req.body.role == '2') { userTypeVal = 'ResellerInactiveStatus' }    
    else userTypeVal = 'InternalUserInactiveStatus';
    knex(table.tbl_Customer).where('id', '=', "" + req.body.id + "").update({ status: "0" })
        .then((response) => {
            //if (req.body.role == '4' || req.body.role == '5') {
            let newdata = { userName: req.body.name, email: req.body.email }
            pushEmail.getEmailContentUsingCategory(userTypeVal).then(val => {
                pushEmail.sendmail({ data: newdata, val: val }).then((data1) => {
                    //res.json({ data1 })
                })
            })
            // }
            res.json({ response });
        });
}

function activeUser(req, res) {
    if (req.body.role == '1') { userTypeVal = 'CustomerInactiveStatus' }
    else if (req.body.role == '2') { userTypeVal = 'ResellerInactiveStatus' }
    else userTypeVal = 'InternalUserInactiveStatus';
    knex(table.tbl_Customer).where('id', '=', "" + req.body.id + "").update({ status: "1" })
        .then((response) => {
            if (response) {
                //if (req.body.role == '4' || req.body.role == '5') {
                let newdata = { userName: req.body.name, email: req.body.email }
                pushEmail.getEmailContentUsingCategory(userTypeVal).then(val => {
                    pushEmail.sendmail({ data: newdata, val: val }).then((data1) => {
                        //res.json({ data1 })
                    })
                })
                // }
                res.json({ response });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error' });
            }
        });
}

function verifyUsername(req, res) {
    let username_keyword = req.body.username;
    let user_id = req.body.id;
    knex.from(table.tbl_Customer).where('username', "" + username_keyword + "")
        .select('id')
        .then((response) => {
            if (response.length > 0 && response[0].id !== user_id) {
                const user = response[0];
                res.json({
                    id: user.id
                });
            } else {
                res.json({
                    id: ''
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getUserInfo(req, res) {
    console.log("getUserInfo");
    let userId = parseInt(req.body.userId);
    knex.select('c.*', 'tm.gmtzone')
        .from(table.tbl_Customer + ' as c')
        .leftJoin(table.tbl_Time_Zone + ' as tm', 'tm.id', 'c.time_zone_id')
        .where('c.id', "" + userId + "")
        .then((response) => {
            if (response) {
                res.json({ response });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error' });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function updateUserProfile(req, res) {    
    let userId = parseInt(req.body.user.user_id);
    let country_id = req.body.user.country;
    let country_code = req.body.user.country_code;
    let time_zone = req.body.user.time_zone;
    let token = req.body.user.token;
    let profileImg = req.body.user.profile_img;    
    let isSMSNotification = req.body.user.sms_notification;  //sms_notification 
    if (isSMSNotification === true || isSMSNotification == 1) {
        isSMSNotification = '1';
    } else {
        isSMSNotification = '0';
    }
    let isEmailNotification = req.body.user.email_notification;  //email_notification 
    if (isEmailNotification === true || isEmailNotification == 1) {
        isEmailNotification = '1';
    } else {
        isEmailNotification = '0';
    }

    if (req.body.role === '4' || req.body.role === '5') {
        knex(table.tbl_Customer).where('id', '=', "" + userId + "")
            .update({
                first_name: knex.raw('TRIM("' + req.body.user.first_name + '")'), last_name: knex.raw('TRIM("' + req.body.user.last_name + '")'),
                email: knex.raw('TRIM("' + req.body.user.email + '")'), mobile: "" + req.body.user.mobile + "", country_id: "" + country_id + "",
                country_code: "" + country_code + "", time_zone_id: "" + time_zone + "", 
            }).then((response) => {
                if (response) {
                    res.json({
                        response
                    });
                } else {
                    res.status(401).send({ error: 'error', message: 'DB Error' });
                }
            });
    } else if (req.body.role === '0') {
        let phone = parseInt(req.body.user.company_phone);
        let accountNo = parseInt(req.body.user.account_no);
        knex(table.tbl_Customer).where('id', '=', "" + userId + "")
            .update({
                first_name: knex.raw('TRIM("' + req.body.user.first_name + '")'), last_name: knex.raw('TRIM("' + req.body.user.last_name + '")'),
                email: knex.raw('TRIM("' + req.body.user.email + '")'), mobile: "" + req.body.user.mobile + "", username: "" + req.body.user.username + "",
                account_number: "" + accountNo + "", country_id: "" + country_id + "", country_code: + country_code + "", time_zone_id: "" + time_zone + ""
            }).then((response) => {
                if (response) {
                    knex(table.tbl_Company_info).
                        update({
                            phone: "" + phone + "", name: knex.raw('TRIM("' + req.body.user.company_name + '")'),
                            address: knex.raw('TRIM("' + req.body.user.company_address + '")'),
                            domain: knex.raw('TRIM("' + req.body.user.domain + '")')
                        }).then((response) => {
                            if (response) {
                                res.json({
                                    response
                                });
                            } else {
                                res.status(401).send({ error: 'error', message: 'DB Error' });
                            }
                        })
                } else {
                    res.status(401).send({ error: 'error', message: 'DB Error' });
                }
            });        

    } else if (req.body.role === '1') {        
        knex(table.tbl_Customer).where('id', '=', "" + userId + "")
            .update({
                first_name: knex.raw('TRIM("' + req.body.user.first_name + '")'), last_name: knex.raw('TRIM("' + req.body.user.last_name + '")'),
                email: knex.raw('TRIM("' + req.body.user.email + '")'), mobile: "" + req.body.user.mobile + "", phone: "" + req.body.user.company_phone + "", domain: knex.raw('TRIM("' + req.body.user.domain + '")'),
                country_id: "" + country_id + "", country_code: "" + country_code + "", time_zone_id: "" + time_zone + "",
                token: "" + token + "", 
                is_sms_notification : ""+ isSMSNotification + "",
                is_email_notification : "" + isEmailNotification + ""
            }).then((response) => {
                if (response) {
                    res.json({
                        response
                    });
                } else {
                    res.status(401).send({ error: 'error', message: 'DB Error' });
                }
            });
    }
}


function UpdateProfile(req,res){
    let data = req.body.crdentials;        
    if(req.body.role === '1'){    
        knex(table.tbl_Customer).where('id','=',"" + data.user_id +"")
        .update({profile_img: ""+ data.profile_img+""}).then((response)=>{            
            if(response){                
                res.json({
                    response
                });
            }else{
                res.status(401).send({ error: 'error', message: 'DB Error' });
            }
        });
    }
}


function getCustomers(req, res) {
    knex.select('c.*', knex.raw('GROUP_CONCAT(DISTINCT (map.product_id)) as product_id'),
        knex.raw('GROUP_CONCAT(DISTINCT(pro.name)) as product_name'), knex.raw('GROUP_CONCAT(pack.id) as package_id'),
        knex.raw('GROUP_CONCAT(pack.name) as package_name')).from(table.tbl_Customer + ' as c')
        .leftJoin(table.tbl_Map_customer_package + ' as map', 'c.id', 'map.customer_id')
        .leftJoin(table.tbl_Product + ' as pro', 'map.product_id', 'pro.id')
        .leftJoin(table.tbl_Package + ' as pack', 'pack.id', 'map.package_id')
        .whereIn('c.role_id', ['1']).whereNotIn('c.status', ['0', '2'])
        .groupBy('map.customer_id')
        .orderBy('c.id', 'desc')
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

function getInternalUserById(req, res) {
    knex.from(table.tbl_Customer + ' as c')
        .where('c.id', '=', "" + req.query.id + "")
        .select('c.*')
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error' });
            }
        });
}

function getCustomerName(req, res) {
    knex(table.tbl_Customer).where('email', '=', "" + req.query.email + "")
        .select(knex.raw('CONCAT(first_name, \' \',last_name) as name'))
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error' });
            }
        }).catch((err) => {            
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            throw err
        });
}

function getCustomerEmail(req, res) {
    knex.select('id', 'email')
        .from(table.tbl_Customer).where('first_name', '=', "" + req.query.name + "")
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error' });
            }
        }).catch((err) => {            
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            throw err
        });
}

function getCustomercompany(req, res) {
    let id = parseInt(req.query.productId);

    knex.distinct().select('c.id', 'c.company_name').from(table.tbl_Customer + ' as c')
        .leftJoin(table.tbl_Map_customer_package + ' as map', 'c.id', 'map.customer_id')
        .leftJoin(table.tbl_Product + ' as pro', 'map.product_id', 'pro.id')
        .where('pro.id', '=', "" + id + "")
        .whereIn('c.role_id', ['1']).whereIn('c.status', ['1'])
        .orderBy('c.company_name', 'asc')
        .then((response) => {            
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}



function getAccountManagerCustomercompany(req, res) {

    let id = parseInt(req.query.accountManagerId);

    knex.select('id', 'company_name').from(table.tbl_Customer)
        .where('account_manager_id', '=', "" + id + "")
        .whereIn('role_id', ['1'], ['0']).whereNotIn('status', ['2'])
        .orderBy('company_name', 'asc')
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

function resetPassword(req, res) {
    if (req.query.action == 'admin') {
        // const passwordInput = Hash.AES.encrypt(req.query.newPassword, config.appSecret).toString();
        const private_cipher = encrypt.cipher(config.appSecret);
        const passwordInput = private_cipher(req.query.newPassword);        
        knex(table.tbl_Customer).where('email', '=', "" + req.query.email + "")
            .update({ password: passwordInput })
            .then((response) => {
                if (response > 0) {
                    pushEmail.getCustomerName(req.query.email).then((data) => {
                        pushEmail.getEmailContentUsingCategory('ChangePassword').then(val => {
                            pushEmail.sendmail({ data: data, val: val }).then((data1) => {
                                res.json({ data1 })
                            })
                        })
                    })
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
    else if (req.query.action == 'extension') {
        const passwordInput = req.query.newPassword;
        knex(table.tbl_Extension_master).where('email', '=', "" + req.query.email + "")
            .update({ ext_web_password: passwordInput })
            .then((response) => {
                if (response === 1) {
                    pushEmail.getCustomerName(req.query.email).then((data) => {
                        pushEmail.getEmailContentUsingCategory('ChangePassword').then(val => {
                            pushEmail.sendmail({ data: data, val: val }).then((data1) => {
                                res.json({ data1 })
                            })
                        })
                    })
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}

//done
function createUser(req, res) {
    let request = req.body;    
    let id = request.id ? request.id : null;
    let url = req.protocol + '://' + req.get('host');
    let userTypeVal = '';
    let permission_id = '';    
    let plugin = request.plugin;
    if (plugin == null || plugin == false) {
        plugin = 'N';
        knex(table.tbl_Extension_master)
        .update({ status: '0'  })
        .where('customer_id',id)
        .andWhere('plug_in','1')
        .then((resp) => {            
        });   } else {
        plugin = 'Y';
    }
    if (!id) {
        if (request.user_type == '1') { userTypeVal = 'CustomerCreation' }
        else if (request.user_type == '2') { userTypeVal = 'SubAdminCreation'; permission_id =  request.permission_type}
        else if(request.user_type == '3') { userTypeVal = 'ResellerCreation'; permission_id =  request.permission_type}
        else userTypeVal = 'InternalUserCreation';
    }
    else {
        if (request.user_type == '1') { userTypeVal = 'CustomerUpdation' }
        else if (request.user_type == '2') { userTypeVal = 'SubAdminCreation' }
        else userTypeVal = 'InternalUserUpdation';
    }
    let states = '';
    if(request.country_code !== '+91'){
        states = ''
    }else{
        states = request.states
    }
    let profile_img = "assets/uploads/Profile-Image.png";
    let isCirlce = (request.isCircle == true) ? '1' : '0';    
    let isAPItoken = (request.apiToken == true) ? '1' : '0';
    let isNotificationEmail = request.is_notification_email == true ? '1' : '0';
    request.circle = request.circle ? request.circle : '';
    request.token = request.token ? request.token : '';

    request.extension_length_limit = request.extension_length_limit ? request.extension_length_limit : 0;
    request.monthly_international_threshold = request.monthly_international_threshold ? request.monthly_international_threshold : 0;
    request.invoice_day  = request.invoice_day ? request.invoice_day : 0 ;
    request.advance_payment = request.advance_payment  ? request.advance_payment  : 0; 
    request.callback_url =request.callback_url ? request.callback_url : '';
    request.dialout_group = request.dialout_group ? request.dialout_group : 0;
    request.notification_email = request.notification_email ? request.notification_email : '';

    const private_cipher = encrypt.cipher(config.appSecret);
    const password = private_cipher(Math.random().toString(36).slice(-8));

    // console.log(Hash.AES.encrypt(Math.random().toString(36).slice(-8), config.appSecret).toString());

    request.credit_limit = request.credit_limit ? request.credit_limit : 0;    
 
    knex.raw("Call pbx_create_customer(" + id + ",'" + request.f_name + "','" + request.l_name + "','" + request.email + "','" +
        request.mobile + "','" + request.username + "','" + password.toString() + "','" +
        Math.round(+new Date() / 1000) + "','" + request.company + "','" + request.company_address + "','" + request.company_phone + "','" +
        request.user_type + "','" + request.domain + "','" + request.user_id + "','" + request.status + "','" + (request.account_manager ? request.account_manager : '0') + "','" +
        request.country + "','" + request.country_code + "','" + request.time_zone + "','" + request.billing_type + "','" +
        request.balance + "','" + request.credit_limit + "','" + request.gst_number + "','" + request.pbx_package_name + "' ,'" + request.oc_package_name + "','" +
        request.product_name + "', '" + request.states + "', '" + isCirlce + "','" + request.circle+ "', '" + isAPItoken + "', '" + request.token + "', '"+permission_id +  "',"  + 
        (request.product_name ? (request.product_name).length : 1) + "," +  request.extension_length_limit  + "," +  request.monthly_international_threshold  + "," + request.invoice_day + "," + 
         request.advance_payment + ",'" + request.callback_url + "'," +  request.dialout_group + ",'" + isNotificationEmail + "','" + request.notification_email + "','" + request.ip + "','" + profile_img + "','" + plugin + "')").then((response) => {
            if (response) {                          
                if(id === null){ // only for new customer creation                        
                    let customer_id = response[0][0][0]['lastInserted'];                    
                    const payload = { 'id': customer_id, 'package_id':"", 'customer_id':customer_id, 'ext_number':'', 'token' : '', 'user_type' : request.user_type};
                    const upgradeToken = jwt.sign(payload, config.jwtSecret);                    
                    updateCustomerToken(upgradeToken,customer_id); 
                }
                if ((request.user_type == '1') && (response[0][0][0].MYSQL_SUCCESSNO == 200) && (id == null)) {                    
                    ensureExists(__dirname + '/../upload/' + response[0][0][0].lastInserted, 0755, function (err) {
                        if (err) { console.log("customer dir not created. " + err); }
                        else {
                            ensureExists(__dirname + '/../upload/' + response[0][0][0].lastInserted + '/prompts', 0755, function (err) {
                                if (err) { console.log("prompts dir not created. " + err); }
                                else { console.log("prompts dir created."); }
                            });

                            ensureExists(__dirname + '/../upload/' + response[0][0][0].lastInserted + '/vm', 0755, function (err) {
                                if (err) { console.log("vm dir not created. " + err); }
                                else { console.log("vm dir created."); }
                            });
                            
                            ensureExists(__dirname + '/../upload/' + response[0][0][0].lastInserted + '/recording', 0755, function (err) {
                                if (err) { console.log("recording dir not created. " + err); }
                                else { console.log("recording dir created."); }
                            });
                        }
                    });
                }
                if(request.status == '2'){ // Delete the customer 
                    generateInvoiceAmount(id); 
                }
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT, user_id: response[0][0][0].lastInserted });
                let newdata = { userName: request.f_name, email: request.email, url: url }
                pushEmail.getEmailContentUsingCategory(userTypeVal).then(val => {
                    const private_cipher = encrypt.decipher(config.appSecret);
                    const decrypted = private_cipher(password.toString());
                    pushEmail.sendmail({ data: newdata, val: val, username: request.username, password: decrypted }).then((data1) => {
                        //res.json({ data1 })
                    })
                })
                // updateChargeForMinutePlan(request.pbx_package_name, response[0][0][0].lastInserted);
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });

            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function ensureExists(path, mask, cb) {

    fs.mkdir(path, mask, function (err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null);
            else cb(err);
        } else cb(null);
    });
}

function getInternalUsersByFilters(req, res) {
    let data = req.body.filters;
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;
    data.by_mobile = data.by_mobile ? ("'" + data.by_mobile + "'") : null;
    data.by_email = data.by_email ? ("'" + data.by_email + "'") : null;
    data.by_status = data.by_status ? ("'" + data.by_status + "'") : null;
    data.by_user_role = data.by_user_role ? ("'" + data.by_user_role + "'") : null;
    knex.raw("Call pbx_getinternalusersbyfilters(" + data.by_mobile + "," + data.by_email + "," + data.by_status + "," + data.by_name + ", " + data.by_user_role + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getInternalUser(req, res) {
    knex.raw("Call pbx_get_internalcustomer()").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAllUser(req, res) {
    knex.raw("Call pbx_getAllUser()").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getUsersByFilters(req, res) {
    let data = req.body.filters;
    // data.by_company = data.by_company ? ("'" + data.by_company + "'") : null;
    data.by_company = data.by_company.length ? ("'" + data.by_company + "'") : null;
    data.by_email = data.by_email ? ("'" + data.by_email + "'") : null;
    data.by_status = data.by_status ? ("'" + data.by_status + "'") : null;
    // data.by_account_manager = data.by_account_manager ? ("'" + data.by_account_manager + "'") : null;
    data.by_account_manager = data.by_account_manager.length ? ("'" + data.by_account_manager + "'") : null;
    data.by_billing = data.by_billing_type ? ("'" + data.by_billing_type + "'") : null;
    data.by_product = data.by_product ? ("'" + data.by_product + "'") : null;
    data.by_oc = data.by_oc ? ("'" + data.by_oc + "'") : null;
    data.by_pbx = data.by_pbx ? ("'" + data.by_pbx + "'") : null;
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;
    data.by_circle = data.by_circle.length ? ("'" + data.by_circle + "'") : null;
    data.by_username = data.by_username ? ("'" + data.by_username + "'") : null;

    knex.raw("Call pbx_getusersbyfilters(" + data.by_company + "," + data.by_email + "," + data.by_status + "," + data.by_account_manager + ", " + data.by_billing + ", " + data.by_name + ", " + data.by_product + ", " + data.by_pbx + ", " + data.by_oc + "," + data.by_circle +  "," + data.by_username+  ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAllUserStatusWise(req, res) {
    let data = req.body;
    data.customerStatus = data.customerStatus ? ("'" + data.customerStatus + "'") : null;
    data.productId = data.productId ? ("'" + data.productId + "'") : null;
    knex.raw("Call pbx_getAllUserStatusWise(" + data.customerStatus + "," + data.productId + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAllUserStatusWiseFilters(req, res) {
    let data = req.body.filters;
   // data.by_company = data.by_company ? ("'" + data.by_company + "'") : null;
    data.by_email = data.by_email ? ("'" + data.by_email + "'") : null;
    data.by_status = data.by_status ? ("'" + data.by_status + "'") : null;
   // data.by_account_manager = data.by_account_manager ? ("'" + data.by_account_manager + "'") : null;

    data.productId = data.productId ? ("'" + data.productId + "'") : null;
    data.by_username = data.by_username ? ("'" + data.by_username + "'") : null;
    data.by_circle = data.by_circle.length ? ("'" + data.by_circle + "'") : null;
    data.by_company = data.by_company.length ? ("'" + data.by_company + "'") : null;
    data.by_account_manager = data.by_account_manager.length ? ("'" + data.by_account_manager + "'") : null;    

    knex.raw("Call pbx_getAllUserStatusWiseFilters(" + data.by_company + "," + data.by_email + "," + data.by_status + "," + data.by_account_manager + "," + data.productId +  "," + data.by_username + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAllUserForAccountManager(req, res) {
    knex.raw("Call pbx_getalluserforaccountmanager(" + parseInt(req.query.accountManagerId) + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getUsersForAccountManagerByFilters(req, res) {
    let id = parseInt(req.query.accountManagerId);
    let data = req.body.filters;    
    data.by_company =  (data.by_company).length ? ("'" + data.by_company + "'") : null;
    data.by_email = data.by_email ? ("'" + data.by_email + "'") : null;
    data.by_status = data.by_status ? ("'" + data.by_status + "'") : null;
    data.by_product = data.by_product ? ("'" + data.by_product + "'") : null;
    data.by_pbx = data.by_pbx ? ("'" + data.by_pbx + "'") : null;
    data.by_oc = data.by_oc ? ("'" + data.by_oc + "'") : null;
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;
    data.by_billing_type = data.by_billing_type ? ("'" + data.by_billing_type + "'") : null;
    // data.by_circle = data.by_circle ? ("'" + data.by_circle + "'") : null;
    data.by_circle =  (data.by_circle).length ? ("'" + data.by_circle + "'") : null;
    data.by_username =  (data.by_username) ? ("'" + data.by_username + "'") : null;
    
    knex.raw("Call pbx_getUsersForAccountManagerByFilters(" + data.by_company + "," + data.by_email + "," + data.by_status + "," +  data.by_product + ","  + data.by_pbx + "," +  data.by_oc + ","  + data.by_name + ","  + id + "," + data.by_billing_type + "," + data.by_circle  + "," + data.by_username + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });

   
}

function getAllUserForSupport(req, res) {
    knex.raw("Call pbx_getAllUserForSupport(" + parseInt(req.query.productId) + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAllSupportUser(req, res) {
   let query =  knex.select('id', 'username').from(table.tbl_Customer)
    .where('role_id', '=', '5').whereIn('status', ['1']);    
    query .then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


function getUsersForSupportByFilters(req, res) {
    let id = parseInt(req.query.productId);
    let data = req.body.filters;
    // data.by_company = data.by_company ? ("'" + data.by_company + "'") : null;
    data.by_company = data.by_company.length ? ("'" + data.by_company + "'") : null;
    data.by_email = data.by_email ? ("'" + data.by_email + "'") : null;
    data.by_status = data.by_status ? ("'" + data.by_status + "'") : null;
    data.by_account_manager = data.by_account_manager.length ? ("'" + data.by_account_manager + "'") : null;
    data.by_product = data.by_product ? ("'" + data.by_product + "'") : null;
    if(data.by_product != "" && data.by_product != null){
        id = data.by_product;
    }
    data.by_pbx = data.by_pbx ? ("'" + data.by_pbx + "'") : null;
    data.by_oc = data.by_oc ? ("'" + data.by_oc + "'") : null;
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;    
    data.by_billing_type = data.by_billing_type ? ("'" + data.by_billing_type + "'") : null;
    data.by_username = data.by_username ? ("'" + data.by_username + "'") : null;    
     
    knex.raw("Call pbx_getUsersForSupportByFilters(" + data.by_company + "," + data.by_email + "," + data.by_status + "," + id + "," + data.by_account_manager + "," + data.by_product +  "," + data.by_pbx +  "," + data.by_oc +   "," + data.by_name + "," + data.by_billing_type + "," + data.by_username + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAllCustomerCompany(req, res) {
    knex.select('id', 'company_name').from(table.tbl_Customer)
        .where('role_id', '=', '1').whereNotIn('status', ['2'])
        .orderBy('company_name', 'asc')
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getAccountManagerProductCustomercompany(req, res) {

    let id = parseInt(req.query.accountManagerId);
    knex.select('cus.id', 'cus.company_name')
        .from(table.tbl_Customer + ' as cus')
        .leftOuterJoin(table.tbl_Map_customer_package + ' as map', 'map.customer_id', 'cus.id')
        .where('cus.account_manager_id', '=', "" + id + "")
        .andWhere('map.product_id', '=', req.query.productId)
        .whereIn('cus.role_id', ['1'], ['0']).whereIn('cus.status', ['1'])
        .orderBy('cus.id', 'desc')
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

function getPackageProductWise(req, res) {
    knex.select('id', 'product_id').from(table.tbl_Package)
        .where('id', '=', req.query.packageId).then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error' });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getCompany(req, res) {
    knex.select('id', 'company_name').from(table.tbl_Customer)
        .whereIn('role_id',['1'])
        .whereIn('status', ['1'])
        .orderBy('company_name', 'asc')
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getAssignedUser(req, res) {
    var sql = knex.select('id').from(table.tbl_Customer)
        .where('account_manager_id', '=', req.query.managerId)
        .andWhere('status', '=', '1');   
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function updateLogoutLog(req, res){
    myDate =  moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
   
    knex.raw("Call pbx_update_activityLog(" + req.body.user_id + ", " + req.body.user_type + ",'1','" + myDate + "')")
    .then((response) => {
        res.json({
            response
        });
    })
}

function getUserByType(req, res) {
    knex.from(table.tbl_Customer + ' as c')
        .where('c.role_id', '=', "" + req.query.type + "")
        .select('c.*')
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error' });
            }
        });
}

function getUserHasMinutePlan(req, res) {
    var sql =   knex.from(table.tbl_Customer + ' as c')
    .leftJoin(table.tbl_Map_customer_package + ' as map', 'c.id', 'map.customer_id')
    .leftJoin(table.tbl_Package + ' as pack', 'pack.id', 'map.package_id')
    .leftJoin(table.tbl_PBX_features + ' as feat', 'feat.id', 'pack.feature_id')
    .where('feat.minute_plan', '=',  1 )
    .select('c.*')        
        sql.then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error' });
            }
        });
}

function checkContactAssociateOrNot(req, res) {
    let customerId = req.query.id;    
    knex.select('*').from(table.tbl_pbx_support_user_map_support_group)
        .where('support_user_id', customerId)
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getCustomerBillingTypeAndWithOutBundlePackage(req, res) {
    knex.select('pbx.billing_type').from(table.tbl_PBX_features + ' as pbx')
        .leftJoin(table.tbl_Package + ' as p', 'pbx.id', 'p.feature_id')
        .where('p.id', '=', "" + req.query.packageId + "")
        .then((response) => {
            if (response) {
                var billing_type = response[0].billing_type;
                knex.select('p.*').from(table.tbl_Package + ' as p')
                    .leftJoin(table.tbl_PBX_features + ' as pbx', 'pbx.id', 'p.feature_id')
                    .where('pbx.billing_type', '=', "" + billing_type + "").andWhere('p.product_id', '=', "" + req.query.productId + "").andWhere('pbx.minute_plan','=','0')
                    .then((resp) => {
                        if (resp) {
                            res.json({
                                resp
                            });
                        } else {
                            res.status(411).send({ error: 'error', message: 'DB Error' });
                        }
                    });
            } else {
                res.status(411).send({ error: 'error', message: 'DB Error' });
            }
        });
}


const updateChargeForMinutePlan = async (packageId, customerId) => {        
    await  knex.select('f.is_bundle_type','f.bundle_plan_id','f.is_roaming_type','f.roaming_plan_id','f.teleconsultation','f.teleConsultancy_call_plan_id').from(table.tbl_PBX_features + ' as f')
    .join(table.tbl_Package + ' as p', 'f.id', 'p.feature_id')
     .join(table.tbl_Map_customer_package + ' as mp', 'mp.package_id', 'p.id')
    .where('p.id', '=', "" + packageId + "")
    .then((response) => {    
        if(response){
           
        }
        // res.json({
        //     response
        // });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });      
}

const generateInvoiceAmount = async (customerId) => {
    var now = new Date();
    var totalInvoiceAmount = 0;
    var currentMonth = parseInt(now.getMonth() + 1);
    await releaseDID(customerId);
    await knex.from(table.tbl_pbx_realtime_cdr + ' as cdr')
        .sum('cdr.sessionbill as amount')
        .select('cdr.created_at')
        .join(table.tbl_Pbx_Invoice + ' as inv', 'inv.customer_id', 'cdr.customer_id')
        .where('cdr.customer_id', '=', "" + customerId + "")
        // .whereBetween('cdr.created_at', ['inv.invoice_date',knex.fn.now()])
        .andWhere(knex.raw('DATE(cdr.created_at)'), '>', knex.raw('DATE(inv.invoice_date)'))
      //  .andWhere(knex.raw('DATE(cdr.created_at)'), '<=', knex.raw('DATE(knex.fn.now())'));       
        sql.then((response) => {            
            if (response) {
                totalInvoiceAmount = totalInvoiceAmount + Number(response[0]['amount']);                
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    await knex(table.tbl_Charge).insert({
        did_id: '', customer_id: customerId, amount: totalInvoiceAmount,
        charge_type: "2", description: 'Charge for PSTN - ' + customerId, charge_status: 0,
        invoice_status: 0, product_id: 1 })
        .then((resp) => {            
        });
        
    await knex.from(table.tbl_Charge + ' as c')
        .sum('c.amount as amount')
        .where('c.customer_id', '=', "" + customerId + "")
        .andWhere('c.charge_status', '=', 0)
        .andWhere('c.invoice_status', '=', 0)
        .then((response) => {            
            if (response) {
                totalInvoiceAmount = totalInvoiceAmount + Number(response[0]['amount']);                
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

     await changeStatus(totalInvoiceAmount, customerId);
        
}

const updateCustomerToken = async (jwtToken,customer_id) => {
    let current_time = new Date();
    current_time.setHours(current_time.getHours() + 1 );
    current_time = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
    await knex(table.tbl_Customer)
        .update({ token: jwtToken,token_exp_time : current_time  })
        .where('id',customer_id)
        .then((resp) => {            
        });
       
}

   const changeStatus = (totalInvoiceAmount, customerId) =>  {
       if (totalInvoiceAmount == 0) {
           knex(table.tbl_Customer).update({
               status: 2
           }).where('id', '=', customerId)
           sql.then((response) => {               
           }).catch((err) => { console.log(err) });
       } else {
           knex(table.tbl_Customer).update({
               status: 4
           }).where('id', '=', customerId)
           sql.then((response) => {               
               generateInvoice(customerId);
           }).catch((err) => { console.log(err) });
       }
   }

const releaseDID = (customerId) => {
    var sql0 = knex.from(table.tbl_DID)
        .select('id')
        .where('customer_id', "" + customerId + "");
    sql0.then((response0) => {        
        let allDidIds = response0 ? response0.map(item => item.id) : [];
        knex.from(table.tbl_DID).whereIn('id', allDidIds)
            .update({
                reserved: '0', customer_id: '0', activated: '0', product_id: '0' // need to set product_id : 0
            }).then((respo) => {                
                if (respo) {
                  let sql =  knex.from(table.tbl_Uses)
                        .whereIn('did_id', allDidIds)
                        .andWhere('customer_id',customerId)
                        .andWhere('release_date','0000-00-00 00:00:00.000000')
                        .update({
                            release_date: knex.raw('CURRENT_TIMESTAMP()')
                        });                        
                        sql.then((response3) => {                            
                            if (response3) {
                                knex.from(table.tbl_DID_Destination).whereIn('did_id', allDidIds)
                                    .del().then((respons) => {
                                        if (respons) {                                           
                                        } else {                                            
                                        }
                                    }).catch((err) => { console.log(err);  throw err });
                            } else {                                
                            }
                        }).catch((err) => { console.log(err); throw err });
                }else{  }
            }).catch((err) => { console.log(err);  throw err });
    }).catch((err) => { console.log(err);  throw err });    
}

const generateInvoice = (customerId) => {
    var now = new Date();
    var n = now.getMonth() - 1;
    var currentDate = now.getDate();
    var months = ['December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var invoice_month = months[++n];
    var current_total_balance = 0;
    knex.from(table.tbl_Customer)
        .select('id', 'email', 'company_name', 'invoice_day', 'balance','advance_payment','created_by')
        .where('id', customerId)
        .andWhere('status', '=', '1')
        .then((response) => {            
            // for (let i = 0; i < response.length; i++) {
                current_total_balance = response[i].balance;
                //unique Invoice number     
                var numbs = "1234567890";
                var number_lehgth = 6;
                var randomNum = '';
                for (var k = 0; k < number_lehgth; k++) {
                    var rnum = Math.floor(Math.random() * numbs.length);
                    randomNum += numbs.substring(rnum, rnum + 1);
                }
                let InvoiceNumberDisplay = randomNum;
                let sql = knex(table.tbl_Pbx_Invoice).insert({
                    reference_num: '' + InvoiceNumberDisplay + '', customer_id: response[i].id,
                });
                sql.then((resp) => {                    
                    let invoiceId = resp;
                    knex.from(table.tbl_Charge + ' as c')
                        .select('c.*',knex.raw('DATE_FORMAT(c.created_at, "%d") as did_activate_day'))
                        .where('customer_id', response[i].id)
                        .andWhere('charge_status',0)
                        .andWhere('invoice_status',0)
                        .then( async (response2) => {                            
                            let allTypeChargeData = response2;
                            let didRegularCount = 0 ; //DID
                            let didRegularTotalRate = 0;  //DID
                            let didRetroCount = 0; // DID -RETRO
                            let SMSCount = 0;  //SMS
                            let SMSTotalRate = 0;  //SMS
                            let PSTNCount = 0;  //PSTN
                            let PSTNTotalRate = 0;  // PSTN
                            let boosterCount = 0;  // booster
                            let boosterTotalRate = 0; // booster
                            let bundleCount = 0;  // BUNDLE
                            let bundleTotalRate = 0; // BUNDLE
                            let roamingCount = 0;  // ROAMING
                            let roamingTotalRate = 0;  // ROAMING
                            let TCCount = 0;  // TC
                            let TCTotalRate = 0;  //TC
                            for (let j = 0; j < allTypeChargeData.length; j++) {
                                if (allTypeChargeData[j]['charge_type'] == '1' && allTypeChargeData[j]['did_activate_day'] == 1) { // DID
                                    didRegularCount++;
                                    didRegularTotalRate = didRegularTotalRate + allTypeChargeData[j]['amount'];
                                }else if(allTypeChargeData[j]['charge_type'] == '1' && allTypeChargeData[j]['did_activate_day'] != 1){ // DID RETRO
                                    didRetroCount++;
                                    // didRetroTotalRate++;
                                    knex(table.tbl_Invoice_Item).insert({
                                        invoice_id: '' + invoiceId + '',
                                        amount: allTypeChargeData[j]['amount'],
                                        description: 'DID Retro rental charge' + '-'+'1',
                                        item_type: '1'
                                    }).then((response3) => {                                        
                                    }).catch(err => { console.log(err) });
                                }else if(allTypeChargeData[j]['charge_type'] == '2'){ // PSTN
                                    PSTNCount++;
                                    PSTNTotalRate = PSTNTotalRate + allTypeChargeData[j]['amount'];
                                }else if(allTypeChargeData[j]['charge_type'] == '3'){ // SMS
                                    SMSCount++;
                                    SMSTotalRate = SMSTotalRate + allTypeChargeData[j]['amount'];
                                }else if(allTypeChargeData[j]['charge_type'] == '4'){ // Booster
                                    boosterCount++;
                                    boosterTotalRate = boosterTotalRate + allTypeChargeData[j]['amount'];
                                }else if(allTypeChargeData[j]['charge_type'] == '5'){ // Bundle
                                    bundleCount++;
                                    bundleTotalRate = bundleTotalRate + allTypeChargeData[j]['amount'];
                                }else if(allTypeChargeData[j]['charge_type'] == '6'){ // Roaming
                                    roamingCount++;
                                    roamingTotalRate = roamingTotalRate + allTypeChargeData[j]['amount'];
                                }else if(allTypeChargeData[j]['charge_type'] == '7'){ // TC
                                    TCCount++;
                                    TCTotalRate = TCTotalRate + allTypeChargeData[j]['amount'];
                                }
                            }
                            
                            if (didRegularCount > 0) {
                                await knex(table.tbl_Invoice_Item).insert({
                                    invoice_id: '' + invoiceId + '',
                                    amount: didRegularTotalRate,
                                    description: 'DID rental charge' + '-'+didRegularCount,
                                    item_type: '1'
                                }).then((response3) => {                                    
                                }).catch(err => { console.log(err) });
                            }
                            if (PSTNCount > 0) {
                                await knex(table.tbl_Invoice_Item).insert({
                                    invoice_id: '' + invoiceId + '',
                                    amount: PSTNTotalRate,
                                    description: 'PSTN Call charges',
                                    item_type: '1'
                                }).then((response3) => {                                    
                                }).catch(err => { console.log(err) });
                            }
                            if (SMSCount > 0) {
                                await knex(table.tbl_Invoice_Item).insert({
                                    invoice_id: '' + invoiceId + '',
                                    amount: SMSTotalRate,
                                    description: 'SMS charges',
                                    item_type: '1'
                                }).then((response3) => {                                    
                                }).catch(err => { console.log(err) });
                            }
                            if (bundleCount > 0) {
                                await knex(table.tbl_Invoice_Item).insert({
                                    invoice_id: '' + invoiceId + '',
                                    amount: bundleTotalRate,
                                    description: 'Bundle charges',
                                    item_type: '1'
                                }).then((response3) => {                                    
                                }).catch(err => { console.log(err) });
                            }
                            if (roamingCount > 0) {
                                await knex(table.tbl_Invoice_Item).insert({
                                    invoice_id: '' + invoiceId + '',
                                    amount: roamingTotalRate,
                                    description: 'Roaming charges',
                                    item_type: '1'
                                }).then((response3) => {                                    
                                }).catch(err => { console.log(err) });
                            }
                            if (TCCount > 0) {
                                await knex(table.tbl_Invoice_Item).insert({
                                    invoice_id: '' + invoiceId + '',
                                    amount: TCTotalRate,
                                    description: 'Teleconsult charges',
                                    item_type: '1'
                                }).then((response3) => {                                    
                                }).catch(err => { console.log(err) });
                            }
                            if (boosterCount > 0) {
                                await knex(table.tbl_Invoice_Item).insert({
                                    invoice_id: '' + invoiceId + '',
                                    amount: boosterTotalRate,
                                    description: 'Booster charges',
                                    item_type: '1'
                                }).then((response3) => {                                    
                                }).catch(err => { console.log(err) });
                            }
                            await update_invoice_with_single_entry(invoiceId, response[i].id, response[i].company_name, response[i].email,InvoiceNumberDisplay, invoice_month, response[i].advance_payment, response[i].created_by );

                        }).catch(err => { console.log(err) })
                }).catch(err=>{ console.log(err)});
           // }
        });

    const update_invoice_with_single_entry =  (invoiceId, customer_id, company_name, customer_email, InvoiceNumberDisplay, invoice_month, cust_advance_payment,created_by) => {
        knex.from(table.tbl_Invoice_Item)
        .select(knex.raw('(now()- INTERVAL 1 MONTH) as invoice_period'))
        .sum('amount as amount')
        .where('invoice_id', '=', invoiceId)
        .then((response4) => {            
            let paid_status = '2';
            var gst_on_amount = 0.00;
            var amount_with_gst = 0.00;
            var cgst_on_amount = 0.00;
            var sgst_on_amount = 0.00;
            var fare_amount = 0.00;
            let invoice_period_day = response4[0]['invoice_period']            
            if (response4[0]['amount'] > 0) {
                paid_status = '2';
                fare_amount = response4[0]['amount'].toFixed(2),
                cgst_on_amount = ((response4[0]['amount'].toFixed(2) * config.cgst) / 100).toFixed(2);
                sgst_on_amount = ((response4[0]['amount'].toFixed(2) * config.sgst) / 100).toFixed(2);
                gst_on_amount = parseFloat(cgst_on_amount) + parseFloat(sgst_on_amount);
                amount_with_gst = parseFloat(response4[0]['amount'].toFixed(2)) + parseFloat(cgst_on_amount) + parseFloat(sgst_on_amount);
            } else {
                paid_status = '4';
            }            
            knex.from(table.tbl_pbx_invoice_conf)
                .select('*')
                .where('id', created_by)
                .then((resp) => {  // get user due date record                    
                    let orgInfo = resp[0];
                    let currentDate = new Date();
                    let current_time = new Date(currentDate.setDate(currentDate.getDate() + orgInfo.payment_day));
                    let invoiceDueDate = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];                     
                    knex(table.tbl_Pbx_Invoice).where('id', '=', invoiceId)
                        .update({ 
                            amount: response4[0]['amount'].toFixed(2), paid_status: paid_status, cgst_percentage: config.cgst, sgst_percentage: config.cgst, total_gst_percentage: config.gst,
                            amount_with_gst: amount_with_gst, cgst_amount: cgst_on_amount, sgst_amount: sgst_on_amount, total_gst_amount: gst_on_amount,
                            invoice_period: invoice_period_day,
                            invoice_due_date: invoiceDueDate,
                            advance_balance: cust_advance_payment
                        })
                        .then((response5) => {                            
                            let sql = knex(table.tbl_Charge)
                                .update({
                                    charge_status: 1,
                                    invoice_status: 1
                                })
                                .where('customer_id', '=', "" + customer_id + "")
                            sql.then((response6) => {                                
                                let newdata = {
                                    userName: company_name,
                                    email: customer_email,
                                    invoice_number: InvoiceNumberDisplay,
                                    amount: amount_with_gst.toFixed(2),
                                    fare_amount: fare_amount,
                                    gst_amount: gst_on_amount.toFixed(2),
                                    invoice_month: invoice_month,
                                };
                                pushEmail.getEmailContentUsingCategory('InvoiceCreation').then(val => {
                                    pushEmail.sendmail({ data: newdata, val: val, username: company_name, email: customer_email }).then((data1) => {                                        
                                    });
                                });
                            }).catch((err) => { console.log(err) });
                        }).catch(err => { console.log(err) });
                }).catch(err => { console.log(err) });
        }).catch(err => { console.log(err) });
    }

}

function sendUserEmail(req, res) {
    let url = req.protocol + '://' + req.get('host');
    let request = req.body;
    let newdata = { userName: request.first_name, email: request.email, url: url };    
    const private_cipher = encrypt.decipher(config.appSecret);
    const decrypted = private_cipher(request.password);    
    //let decrypted = Hash.AES.decrypt(request.password, config.appSecret);
    // decrypted = decrypted.toString(Hash.enc.Utf8);
    pushEmail.getEmailContentUsingCategory('CustomerCreation').then(val => {
        pushEmail.sendmail({ data: newdata, val: val, username: request.username, password: decrypted }).then((data1) => {            
            res.json({
                message: 'The mail is sended to '+request.first_name,
                status : 200
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}


function setLogo(){
    let sql = knex(table.tbl_profile_logo).insert({logo_img: profile_logo})
              .where('role',role_id)
              .andWhere('customer_id',customer_id);
        sql.then((response) => {
            res.send({
                status_code: 200,
                message: "Logo Inserted."
            })
        })
}

module.exports = {
    createUser, getAllUser, getAllUserStatusWise, verifyUsername, getUserInfo, getInternalUserById,
    getInternalUser, deleteUser, inactiveUser, activeUser, getCustomerById, getCustomerBillingTypePackage,
    updateUserProfile, getUsersByFilters, getInternalUsersByFilters, getCustomerName, getCustomers, verifyCompany,
    getCustomerEmail, resetPassword, verifyEmail, getUsersForAccountManagerByFilters,
    getAllUserForAccountManager, getUsersForSupportByFilters, getAllUserForSupport, getCustomercompany,
    getAccountManagerCustomercompany, getAllCustomerCompany, getAllUserStatusWiseFilters, getAccountManagerProductCustomercompany, getPackageProductWise,
    getCompany, getAssignedUser, getAllSupportUser, updateLogoutLog, getUserByType, checkContactAssociateOrNot, getCustomerBillingTypeAndWithOutBundlePackage,
    getUserHasMinutePlan, sendUserEmail, UpdateProfile, setLogo
};