const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');

function viewAllSMS(req, res) {
    var sql = knex.from(table.tbl_pbx_SMS + ' as sms')
        .select('sms.id', 'sms.name', 'sms.description', 'sms.validity', 'sms.charge', 'sms.provider', 'sms.number_of_sms',
            knex.raw('IF (sms.validity = "1","Monthly", IF (sms.validity = "2","Yearly","Pay Per Use")) as validity_name'), 'sa.provider')
        // .leftJoin(table.tbl_Provider + ' as p', 'p.id', 'sms.provider')
        .leftJoin(table.tbl_pbx_sms_api + ' as sa', 'sa.id', 'sms.provider')
        .orderBy('sms.name', 'asc');
    sql.then((response) => {
        res.json({
            response: response,
            code: 200
        })
    }).catch((err) => { console.log(err); throw err });
}

function createSMSPlan(req, res) {
    var data = req.body.smsDetail;
    knex(table.tbl_pbx_SMS).insert({
        name: "" + data.name + "",
        validity: "" + data.validity + "",
        charge: "" + data.charge + "",
        number_of_sms: data.no_of_sms ? "" + data.no_of_sms + "" : "",
        provider: "" + data.provider + "",
        description: "" + data.description + "",
    }).then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function createSMSPlanFilters(req, res) {
    let data = req.body.filters;
    var sql = knex.from(table.tbl_pbx_SMS + ' as sms')
        .select('sms.id', 'sms.name', 'sms.description', 'sms.validity', 'sms.charge', 'sms.provider', 'sms.number_of_sms',
            knex.raw('IF (sms.validity = "1","Monthly", IF (sms.validity = "2","Yearly","Pay Per Use")) as validity_name'), 'sa.provider')
            .leftJoin(table.tbl_pbx_sms_api + ' as sa', 'sa.id', 'sms.provider')
            // .leftJoin(table.tbl_Provider + ' as p', 'p.id', 'sms.provider')
        .orderBy('sms.id', 'desc');

    if (data.by_name != '') {
        sql = sql.andWhere('sms.name', 'like', "%" + data.by_name + "%");
    }
    // if (data.by_provider != '') {
    //     sql = sql.andWhere('sms.provider', '=', "" + data.by_provider + "");
    // }
    if ((data.by_provider).length > 0) {
        sql = sql.whereIn('sms.provider',data.by_provider);
    }

    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getSMSById(req, res) {
    let id = parseInt(req.query.id);
    knex.select('*').from(table.tbl_pbx_SMS)
        .where('id', '=', id)
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function updateSMSPlan(req, res) {
    var data = req.body.smsDetail;
    let sql = knex(table.tbl_pbx_SMS).update({
        name: "" + data.name + "",
        validity: "" + data.validity + "",
        charge: "" + data.charge + "",
        number_of_sms: data.no_of_sms ? "" + data.no_of_sms + "" : "",
        provider: "" + data.provider + "",
        description: "" + data.description + "",
    }).where('id', '=', "" + data.id + "")

    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function createSMSApi(req, res) {  //working on it
    var data = req.body.apiDetail;
    var parameterForm = data.parameterForm;
    let query = knex.select('sp.provider').from(table.tbl_pbx_sms_api + ' as sp')
        .where('sp.provider', '=', data.provider)
        .andWhere('sp.customer_id','=',data.customer_id);
    query.then((response) => {
        if (response.length == 0) {
            knex(table.tbl_pbx_sms_api).insert({
                provider: "" + data.provider + "",
                url: "" + data.url + "",
                customer_id: "" + data.customer_id + "",
            }).then((response) => {
                if (response) {
                    let managedArray = parameterForm;
                    const contactsToInsert = managedArray.map(contact =>
                        ({ sms_api_id: response, header: contact.header, value: contact.header_value,is_type : ((contact.isType).toString()) }));
                    let sql2 = knex(table.tbl_pbx_sms_api_mapping).insert(contactsToInsert);
                    sql2.then((response) => {
                        if (response) {
                            res.send({
                                response: response,
                                message: 'Add SMS API successfully',
                                code: 200
                            });
                        }
                    }).catch((err) => {
                        res.status(200).send({
                            code: err.errno,
                            error: 'error', message: 'DB Error: ' + err.message
                        }); throw err
                    });
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        } else {
            res.json({
                response: response,
                code: 201,
                message: `Provider name already exist`
            });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function viewAllSMSApi(req, res) {
    let customer_id = parseInt(req.query.cId);
    var sql = knex.from(table.tbl_pbx_sms_api + ' as sms')
        .select('sms.id', 'sms.url', 'sms.provider', 'p.provider as provider_name',
            knex.raw('GROUP_CONCAT(smsm.header) as header'),
            knex.raw('GROUP_CONCAT(smsm.value) as header_value'))
        .leftJoin(table.tbl_pbx_sms_api_mapping + ' as smsm', 'smsm.sms_api_id', 'sms.id')
        .leftJoin(table.tbl_Provider + ' as p', 'p.id', 'sms.provider')
        .groupBy('sms.id')
        .orderBy('sms.id', 'desc')
        .where('sms.customer_id', '=', customer_id);
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getSMSApiById(req, res) {
    let id = parseInt(req.query.id);
    var sql = knex.from(table.tbl_pbx_sms_api + ' as sms')
        .select('sms.id', 'sms.url', 'sms.provider', 'p.provider as provider_name',
            knex.raw('GROUP_CONCAT(smsm.header) as header'),
            knex.raw('GROUP_CONCAT(smsm.value) as header_value'),
            knex.raw('GROUP_CONCAT(smsm.is_type) as isType'))
        .leftJoin(table.tbl_pbx_sms_api_mapping + ' as smsm', 'smsm.sms_api_id', 'sms.id')
        .leftJoin(table.tbl_Provider + ' as p', 'p.id', 'sms.provider')
        .where('sms.id', '=', id);
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function updateSMSApi(req, res) {
    var data = req.body.apiDetail;
    var parameterForm = data.parameterForm;

    let query = knex(table.tbl_pbx_sms_api)
        .where('provider', '=', "" + data.provider + "")
        .andWhere('customer_id','=',data.customer_id)
        .whereNot('id', data.id);
    query.then((response) => {
        if (response.length == 0) {
            let sql = knex(table.tbl_pbx_sms_api).update({
                provider: "" + data.provider + "",
                url: "" + data.url + "",
                customer_id: "" + data.customer_id + "",
            }).where('id', '=', "" + data.id + "");
            sql.then((response) => {
                let smsId = data.id ? data.id : 0;
                if (response) {
                    let sql2 = knex(table.tbl_pbx_sms_api_mapping).where('sms_api_id', '=', "" + smsId + "");
                    sql2.del();
                    sql2.then((response) => {
                        if (response) {
                            let managedArray = parameterForm;
                            const contactsToInsert = managedArray.map(contact =>
                                ({ sms_api_id: smsId, header: contact.header, value: contact.header_value, is_type : ((contact.isType).toString()) }));
                            let sql3 = knex(table.tbl_pbx_sms_api_mapping).insert(contactsToInsert);
                            sql3.then((response) => {
                                if (response) {
                                    res.send({
                                        response: response,
                                        message: 'Update SMS API successfully !',
                                        code: 200
                                    });
                                }
                            }).catch((err) => {
                                res.status(401).send({
                                    code: err.errno,
                                    error: 'error', message: 'DB Error: ' + err.message
                                }); throw err
                            });
                        }
                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        } else {
            res.json({
                response: response,
                code: 201,
                message: `Provider name already exist`
            });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function viewSMSPlanFilters(req, res) {
    let customer_id = parseInt(req.query.cid);
    let data = req.body.filters;
    var sql = knex.from(table.tbl_pbx_sms_api + ' as sms')
        .select('sms.id', 'sms.url', 'sms.provider', 'p.provider as provider_name',
            knex.raw('GROUP_CONCAT(smsm.header) as header'),
            knex.raw('GROUP_CONCAT(smsm.value) as header_value'))
        .leftJoin(table.tbl_pbx_sms_api_mapping + ' as smsm', 'smsm.sms_api_id', 'sms.id')
        .leftJoin(table.tbl_Provider + ' as p', 'p.id', 'sms.provider')
        .groupBy('sms.id')
        .orderBy('sms.id', 'desc')
        .where('sms.customer_id', '=', customer_id);
    if (data.by_provider != '') {
        sql = sql.andWhere('sms.provider', '=', "" + data.by_provider + "");
    }
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function viewSMSCategories(req, res) {
    var sql = knex.from(table.tbl_pbx_sms_category + ' as sc')
        .select('sc.*')
        // .orderBy('sc.id', 'desc');
        .orderBy('sc.category_name', 'asc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function createSMSTemplate(req, res) {
    var data = req.body.smsDetail;
    knex.select('id').from(table.tbl_pbx_sms_template)
        .where("category_id", "=", "" + data.category + "")
        .andWhere('customer_id', '=', "" + data.customer_id + "")
        .then((response) => {
            let statusValue = response.length > 0 ? '0' : '1'
            knex(table.tbl_pbx_sms_template).insert({
                category_id: "" + data.category + "",
                description: "" + data.description + "",
                status: "" + statusValue + "",
                customer_id: "" + data.customer_id + "",
            }).then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });


}

function viewSMSTemplate(req, res) {
    let customer_id = parseInt(req.query.cid);
    var sql = knex.from(table.tbl_pbx_sms_template + ' as sms')
        .select('sms.*', 'smsc.category_name', knex.raw('IF (sms.status = "1","Active","Inactive") as status'))
        .leftJoin(table.tbl_pbx_sms_category + ' as smsc', 'smsc.id', 'sms.category_id')
        .orderBy('sms.id', 'desc')
        .where('sms.customer_id', '=', customer_id);
    sql.then((response) => {
        res.json({
            response: response,
            code: 200
        })
    }).catch((err) => { console.log(err); throw err });
}

function viewSMSTemplateFilters(req, res) {
    let data = req.body.filters;
    var sql = knex.from(table.tbl_pbx_sms_template + ' as sms')
        .select('sms.*', 'smsc.category_name', knex.raw('IF (sms.status = "1","Active","Inactive") as status'))
        .leftJoin(table.tbl_pbx_sms_category + ' as smsc', 'smsc.id', 'sms.category_id')
        .orderBy('sms.id', 'desc')
        .where('sms.customer_id', '=', data.customer_id);

    if (data.by_category != '') {
        sql = sql.andWhere('sms.category_id', '=', "" + data.by_category + "");
    }
    if (data.by_status != '') {
        sql = sql.andWhere('sms.status', '=', "" + data.by_status + "");
    }
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function updateSMSTemplate(req, res) {
    var data = req.body.smsDetail;
    let sql = knex(table.tbl_pbx_sms_template).update({
        category_id: "" + data.category + "",
        description: "" + data.description + "",
    }).where('id', '=', "" + data.id + "")
        .andWhere('customer_id', '=', "" + data.customer_id + "");

    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function updateSMSTemplateStatus(req, res) {
    let id = parseInt(req.body.id);
    let category_id = parseInt(req.body.category_id);
    let status = '';

    if (req.body.status == '0') {
        status = '1'; //to change other email template status with same category (in case of multiple records)
    } else {
        status = '0';
    }
    knex(table.tbl_pbx_sms_template).where('id', '=', "" + id + "")
        .andWhere('category_id', '=', "" + category_id + "")
        .update({ status: "" + req.body.status + "" })
        .then((response) => {
            if (response) {
                knex(table.tbl_pbx_sms_template)
                    .whereNot("id", "=", id)
                    .andWhere('category_id', '=', "" + category_id + "")
                    .update({ status: "" + status + "" })
                    .then((response) => {
                        res.json({ response });
                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function deleteSMSApi(req, res) {
    let body = req.body.circle;
    let sms_api_id = req.query[Object.keys(req.query)[0]];

    knex.select('s.id').from(table.tbl_pbx_SMS + ' as s')
        .where('s.provider', '=', sms_api_id)
        .then((response) => {
            if (response.length == 0) {
                let sql = knex(table.tbl_pbx_sms_api).where('id', '=', "" + sms_api_id + "");
                sql.del();
                sql.then((response) => {
                    if (response) {
                        let sql2 = knex(table.tbl_pbx_sms_api_mapping).where('sms_api_id', '=', "" + sms_api_id + "")
                        sql2.del();
                        sql2.then((response) => {
                            if (response) {
                                res.json({
                                    response: response,
                                    code: 200,
                                    message: 'You have deleted this sms api!'

                                });
                            }
                        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
                    } else {
                        res.status(401).send({ error: 'error', message: 'DB Error' });
                    }
                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
            } else {
                res.json({
                    response: response,
                    code: 400,
                    message: 'You can not delete this sms api!'
                });
            }
        });
}

function deleteSMSPlan(req, res) {
    let sms_plan_id = req.query[Object.keys(req.query)[0]];
    console.log('sms_api_id', sms_plan_id)

    knex.select('f.id').from(table.tbl_PBX_features + ' as f')
        .where('f.sms_id', '=', sms_plan_id)
        .then((response) => {
            if (response.length == 0) {
                let sql = knex(table.tbl_pbx_SMS).where('id', '=', "" + sms_plan_id + "");
                sql.del();
                sql.then((response) => {
                    if (response) {
                        res.json({
                            response: response,
                            code: 200,
                            message: 'You have deleted this sms plan!'

                        });
                    } else {
                        res.status(401).send({ error: 'error', message: 'DB Error' });
                    }
                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
            } else {
                res.json({
                    response: response,
                    code: 400,
                    message: 'You can not delete this sms plan!'
                });
            }
        });
}

function deleteSMSTemplate(req, res) {
    let sms_template_id = req.query[Object.keys(req.query)[0]];
    console.log('sms_api_id', sms_template_id)
    let sql = knex(table.tbl_pbx_sms_template).where('id', '=', "" + sms_template_id + "");
    sql.del();
    sql.then((response) => {
        if (response) {
            res.json({
                response: response,
                code: 200,
                message: 'You have deleted this sms template!'

            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error' });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function CreateSMSService(req, res) {
    let data = req.body.service;
    var count = 0;
    let sql = knex(table.tbl_pbx_sms_service_config).where('customer_id', '=', "" + data.customer_id + "");
    sql.then((response) => {
        if (response.length > 0) { // work for update
            let sql2 = knex(table.tbl_pbx_sms_service_config).where('customer_id', '=', "" + data.customer_id + "");
             sql2.del();
             sql2.then((response) => {
                if (response) {
                    for (let i = 0; i < data.smsConfigForm.length; i++) {
                        count++;
                        let smsValue = data.smsConfigForm[i].value;
                        if (smsValue === true || smsValue === 1) {
                            smsValue = '1';
                        } else {
                            smsValue = '0';
                        }
                        console.log(data);
                        knex(table.tbl_pbx_sms_service_config)
                            .insert({
                                name: "" + data.smsConfigForm[i].name + "",
                                value: "" + smsValue + "",
                                customer_id: "" + data.customer_id + "",
                            }).then(response => {
                                console.log('count',count);
                               console.log('data.smsConfigForm.length=======',data.smsConfigForm.length);
                                if (count == data.smsConfigForm.length) {
                                    res.send({
                                        response: response,
                                        message: 'SMS Service updated successfully',
                                        code: 200
                                    });
                                }
                            }).catch((err) => {
                                console.log(err);
                                res.status(400).send({
                                    code: err.errno,
                                    error: 'error', message: 'DB Error: ' + err.message
                                }); throw err
                            });
                    }
                } else {
                    res.status(401).send({ error: 'error', message: 'DB Error' });
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        } else {  // work for insert
            for (let i = 0; i < data.smsConfigForm.length; i++) {
                count++;
                let smsValue = data.smsConfigForm[i].value;
                if (smsValue === true || smsValue === 1) {
                    smsValue = '1';
                } else {
                    smsValue = '0';
                }
                console.log(data);
                knex(table.tbl_pbx_sms_service_config)
                    .insert({
                        name: "" + data.smsConfigForm[i].name + "",
                        value: "" + smsValue + "",
                        customer_id: "" + data.customer_id + "",
                    }).then(response => {
                        console.log('count',count);
                        console.log('data.smsConfigForm.length=======',data.smsConfigForm.length);
                        if (count == data.smsConfigForm.length) {
                            res.send({
                                response: response,
                                message: 'SMS Service updated successfully',
                                code: 200
                            });
                        }
                    }).catch((err) => {
                        console.log(err);
                        res.status(400).send({
                            code: err.errno,
                            error: 'error', message: 'DB Error: ' + err.message
                        }); throw err
                    });
            }
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });


}

function viewSMSConfigService(req, res) {
    let customer_id = parseInt(req.query.cid);
    var sql = knex.from(table.tbl_pbx_sms_service_config + ' as sms')
        .select('sms.*')
        .orderBy('sms.name', 'asc')
        .where('sms.customer_id', '=', customer_id);
    sql.then((response) => {
        res.json({
            response: response,
            code: 200
        })
    }).catch((err) => { console.log(err); throw err });
}

function viewSMSPlanAssociateUsers(req, res) {
    var body = req.body;
    let smsId = parseInt(req.query.smsPlan_id);
    var sql = knex.from(table.tbl_pbx_SMS+ ' as sms')
        .select('sms.id','c.first_name','c.last_name','c.email', 'c.mobile')
        .leftJoin(table.tbl_PBX_features + ' as f', 'f.sms_id', 'sms.id')
        .leftJoin(table.tbl_Package + ' as p', 'p.feature_id', 'f.id')
        .leftJoin(table.tbl_Map_customer_package + ' as map', 'p.id', 'map.package_id')
        // .leftJoin(table.tbl_Contact_list + ' as cl', 'cl.id', 'tc.user_id')
        // .leftJoin(table.tbl_Map_customer_package + ' as map', 'p.id', 'map.package_id')
        .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'map.customer_id')

        .where('sms.id', '=', smsId)
        .groupBy('c.first_name');
     console.log(sql.toQuery())
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getCustomerSMSid(req, res) {
    let customerId = parseInt(req.query.customer_id);
    var sql = knex.from(table.tbl_Customer+ ' as c')
            .select('sms.id')
            .leftJoin(table.tbl_Map_customer_package + ' as map', 'c.id', 'map.customer_id')
            .leftJoin(table.tbl_Package + ' as p', 'p.id', 'map.package_id')
            .leftJoin(table.tbl_PBX_features + ' as f', 'f.id', 'p.feature_id')
            .leftJoin(table.tbl_pbx_SMS + ' as sms',  'sms.id','f.sms_id')
            .where('c.id', "=", customerId)
        .groupBy('sms.id');
     console.log(sql.toQuery())
    sql.then((response) => {
        res.json({
            response:response[0]
        })
    }).catch((err) => { console.log(err); throw err });
}

function getCustomerSMSInfo(req, res) {
    let userId = parseInt(req.body.userId);
    knex.select('sms.number_of_sms as remainng_sms','map.sms_active_at')
        .from(table.tbl_pbx_SMS + ' as sms')
        .leftJoin(table.tbl_PBX_features + ' as f', 'f.sms_id', 'sms.id')
        .leftJoin(table.tbl_Package + ' as p', 'p.feature_id', 'f.id')
        .leftJoin(table.tbl_Map_customer_package + ' as map', 'p.id', 'map.package_id')
        .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'map.customer_id')
        .where('c.id', "" + userId + "")
        .then((response) => {
            if (response) {
                let sms_package_active_date = response[0]['sms_active_at'];
                let current_time = new Date();
                console.log(response)
                console.log(sms_package_active_date)
                console.log(current_time);
               let sql = knex.select('*')
                         .from(table.tbl_pbx_sms_logs)
                         .where('created_at','>',sms_package_active_date)
                         .andWhere('created_at','<',current_time)
                         .andWhere('customer_id',"" + userId + "");
                 console.log(sql.toQuery());
                sql.then((res2)=>{
                    let totalUsedSMS = res2.length;
                    let remainng_sms = response[0]['remainng_sms'] - totalUsedSMS;
                    res.send({ response: remainng_sms });
                })
            }
            else {
                response.status(401).send({ error: 'error', message: 'DB Error' });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function resetCustomerSMSPackage(req, res) {
    let userId = parseInt(req.body.userId);
    let current_time = new Date();
    current_time = current_time.toISOString().split('T')[0] + ' '+ current_time.toTimeString().split(' ')[0];
    let sql = knex(table.tbl_Map_customer_package).update({
        sms_active_at: "" + current_time + ""
    }).where('customer_id', '=', "" + userId + "")
    sql.then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getAdminSMSReportInfo(req, res) {
    let limit_flag = req.query.limit_flag == '1'?req.query.limit_flag:null;
    knex.raw("Call pbx_getAdminSMSReportInfo("+limit_flag+")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAdminSMSReportByFilters(req, res) {
    let data = req.body.filters;
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_company = (data.by_company).length ? ("'" + data.by_company + "'") : null;
    data.by_smsplan = (data.by_smsplan).length ? ("'" + data.by_smsplan + "'") : null;
    data.by_smscategory = data.by_smscategory ? ("'" + data.by_smscategory + "'") : null;
    data.by_smsvalidity = data.by_smsvalidity ? ("'" + data.by_smsvalidity + "'") : null;

    knex.raw("Call pbx_getAdminSMSReportByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company + ","+ data.by_smsplan +","+ data.by_smscategory +","+ data.by_smsvalidity  +")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.Message } });
    });
}

function getCustomerSMSReportInfo(req, res) {
    let limit_flag = req.query.limit_flag == '1'?req.query.limit_flag:null;
    let customer_id = req.query.customer_id ? req.query.customer_id : 0;
    customer_id
    knex.raw("Call pbx_getCustomerSMSReportInfo("+limit_flag+ "," + customer_id + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getCustomerSMSReportByFilters(req, res) {
    let data = req.body.filters;
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_company = data.by_company ? ("'" + data.by_company + "'") : null;
    data.by_smsplan = data.by_smsplan ? ("'" + data.by_smsplan + "'") : null;
    data.by_smscategory = data.by_smscategory ? ("'" + data.by_smscategory + "'") : null;
    data.by_smsvalidity = data.by_smsvalidity ? ("'" + data.by_smsvalidity + "'") : null;
    let customer_id = data.customer_id ? data.customer_id : 0;

    knex.raw("Call pbx_getCustomerSMSReportByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company + ","+ data.by_smsplan +","+ data.by_smscategory +","+ data.by_smsvalidity+ "," + customer_id  +")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.Message } });
    });
}

function createSMSCharge(req, res) {
    var data = req.body.smsDetail;
    knex(table.tbl_Charge).insert({
        customer_id: "" + data.customer_id + "",
        amount: "" + data.amount + "",
        charge_type: "" + data.charge_type + "",
        description: "" + data.description + "",
    }).then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

module.exports = {
    viewAllSMS, createSMSPlan, createSMSPlanFilters, getSMSById, updateSMSPlan, deleteSMSPlan,viewSMSPlanAssociateUsers,getCustomerSMSid,
    createSMSApi, viewAllSMSApi, getSMSApiById, updateSMSApi, viewSMSPlanFilters, deleteSMSApi,
    viewSMSCategories, createSMSTemplate, viewSMSTemplate, viewSMSTemplateFilters, updateSMSTemplate, updateSMSTemplateStatus, deleteSMSTemplate,
    CreateSMSService, viewSMSConfigService,getCustomerSMSInfo, resetCustomerSMSPackage,getAdminSMSReportInfo, getAdminSMSReportByFilters,
    getCustomerSMSReportInfo,getCustomerSMSReportByFilters, createSMSCharge
}
