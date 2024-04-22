const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');
const { eachOfLimit } = require('async');

function addBC(req, res) {
    let data = req.body;

    let is_extension = '0';
    if (!req.body.is_extension || req.body.is_extension == '0' || req.body.is_extension == false || req.body.is_extension == '') {
        is_extension = '0';
    } else if ((req.body.is_extension == '1' || req.body.is_extension == true || req.body.is_extension != '')
        && (req.body.is_extension == '1' || req.body.is_extension == true || req.body.is_extension != '')) {
        is_extension = '1';
    }

    let is_pstn = '';
    if (!req.body.is_pstn || req.body.is_pstn == '0' || req.body.is_pstn == false || req.body.is_pstn == '') {
        is_pstn = '0';
    } else if (req.body.is_pstn == '1' || req.body.is_pstn == true || req.body.is_pstn != '') {
        is_pstn = '1';
    }

    let is_caller_id = '';
    if (!req.body.is_caller_id || req.body.is_caller_id == '0' || req.body.is_caller_id == false || req.body.is_caller_id == '') {
        is_caller_id = '0';
    } else if (req.body.is_caller_id == '1' || req.body.is_caller_id == true || req.body.is_caller_id != '') {
        is_caller_id = '1';
    }

    let start_date = req.body.schedular_start_date;
    let schedular_start_date = start_date ? moment(start_date).format('YYYY-MM-DD HH:mm:ss') : "";
    let scheduler = req.body.scheduler;

    let sql = knex(table.tbl_pbx_broadcast).insert({
        name: "" + data.name + "",
        welcome_prompt: "" + req.body.welcome_prompt + "",
        is_extension: "" + is_extension + "",
        is_pstn: "" + is_pstn + "",
        schedular_start_date: "" + schedular_start_date + "",
        scheduler: "" + scheduler + "",
        customer_id: "" + req.body.customerId + "",
        group_ids : ""+ req.body.group,
        is_caller_id: "" + is_caller_id + "",
        SIP_caller_id: "" + req.body.caller_id_ext + "",
        DID_caller_id: "" + req.body.caller_id_pstn + ""
    });

    sql.then((response) => {
        if (response) {
            let managedArray = [];
            let extensionList = req.body.extension;
            let pstnList = req.body.pstn;

            for (let i = 0; i < extensionList.length; i++) {
                let obj = {};
                obj.id = extensionList[i];
                obj.type = "E";
                managedArray.push(obj);
            }
            for (let i = 0; i < pstnList.length; i++) {
                let obj = {};
                obj.id = pstnList[i];
                obj.type = "P";
                managedArray.push(obj);
            }

            if (extensionList.length != 0 || pstnList.length != 0) {
                const contactsToInsert = managedArray.map(contact =>
                    ({ bc_id: response, type: contact.type, ref_id: contact.id }));

                let sql2 = knex(table.tbl_pbx_broadcast_mapping).insert(contactsToInsert);
                sql2.then((response) => {
                    if (response) {
                        res.send({
                            response: response,
                            message: 'Add Broadcast successfully',
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
        }
    }).catch((err) => {
        res.status(200).send({
            code: err.errno,
            error: 'error', message: 'DB Error: ' + err.message
        }); throw err
    });
}


function viewBC(req, res) {
    var body = req.body;
    let customerId = parseInt(req.query.customer_id);
    let isFilter = Object.keys(body).length == 0 ? false : true;
    var sql = knex.from(table.tbl_pbx_broadcast + ' as bc')
    .select('*')
        .where('customer_id', '=', customerId)
        .orderBy('bc.id', 'desc');
    if (isFilter) {
           sql.where('name', 'like', '%' + body.name + '%').andWhereNot ('scheduler',body.by_schduler)
    }
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function viewSingleBCFullDetails(req, res) {
    var body = req.body;
    let bcId = parseInt(req.query.bc_id);
    var sql = knex.from(table.tbl_pbx_broadcast + ' as bc')
        .select('bc.id', 'bc.name', 'bc.welcome_prompt',
             'bc.is_extension','bc.is_pstn','bc.scheduler',
             'bc.group_ids','bc.is_caller_id','bc.SIP_caller_id','bc.DID_caller_id',
             knex.raw('DATE_FORMAT(bc.schedular_start_date, "%d/%m/%Y %H:%i:%s") as schedular_start_date'),
            knex.raw('GROUP_CONCAT(bcm.ref_id) as ref_id'),
            knex.raw('GROUP_CONCAT(bcm.type) as ref_type'))
        .leftJoin(table.tbl_pbx_broadcast_mapping + ' as bcm', 'bcm.bc_id', bcId)
        .where('bc.id', '=', bcId);
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function updateBC(req, res) {
    let data = req.body;
    let is_extension = '0';
    if (!req.body.is_extension || req.body.is_extension == '0' || req.body.is_extension == false || req.body.is_extension == '') {
        is_extension = '0';
    } else if ((req.body.is_extension == '1' || req.body.is_extension == true || req.body.is_extension != '')
        && (req.body.is_extension == '1' || req.body.is_extension == true || req.body.is_extension != '')) {
        is_extension = '1';
    }

    let is_pstn = '';
    if (!req.body.is_pstn || req.body.is_pstn == '0' || req.body.is_pstn == false || req.body.is_pstn == '') {
        is_pstn = '0';
    } else if (req.body.is_pstn == '1' || req.body.is_pstn == true || req.body.is_pstn != '') {
        is_pstn = '1';
    }

    let is_caller_id = '';
    if (!req.body.is_caller_id || req.body.is_caller_id == '0' || req.body.is_caller_id == false || req.body.is_caller_id == '') {
        is_caller_id = '0';
    } else if (req.body.is_caller_id == '1' || req.body.is_caller_id == true || req.body.is_caller_id != '') {
        is_caller_id = '1';
    }

     let start_date = req.body.schedular_start_date;
     let scheduler = req.body.scheduler;

    knex.from(table.tbl_pbx_broadcast).where('id', '=', "" + req.body.id + "")
    .select('schedular_start_date')
    .then((response) => {
        if (response.length > 0) {
            let conf = Object.values(JSON.parse(JSON.stringify(response)));
            let lastStartDate = conf[0].schedular_start_date;
            let schedular_start_date = '';
            if (lastStartDate == start_date) {
                schedular_start_date = start_date;
            } else {
                schedular_start_date = moment(start_date).format('YYYY-MM-DD HH:mm:ss');
            }

            if (schedular_start_date == 'Invalid date') {
                schedular_start_date = lastStartDate;
            }
            let sql = knex(table.tbl_pbx_broadcast)
            .update({
                name: "" + data.name + "",
                welcome_prompt: "" + req.body.welcome_prompt + "",
                schedular_start_date: "" + schedular_start_date + "",
                scheduler: "" + scheduler + "",
                customer_id: "" + req.body.customerId + "",
                is_extension: "" + is_extension + "",
                is_pstn: "" + is_pstn + "" ,
                group_ids : ""+ req.body.group,
                is_caller_id: "" + is_caller_id + "",
                SIP_caller_id: "" + req.body.caller_id_ext + "",
                DID_caller_id: "" + req.body.caller_id_pstn + ""
            })
            .where('id', '=', "" + req.body.id + "");

        sql.then((response) => {
            let bcId = req.body.id ? req.body.id : 0;
            if (response) {
                let sql2 = knex(table.tbl_pbx_broadcast_mapping).where('bc_id', '=', "" + bcId + "")
                sql2.del();
                sql2.then((response) => {
                    if (response) {
                        let managedArray = [];
                        let extensionList = req.body.extension;
                        let pstnList = req.body.pstn;
                        for (let i = 0; i < extensionList.length; i++) {
                            let obj = {};
                            obj.id = extensionList[i];
                            obj.type = "E";
                            managedArray.push(obj);
                        }
                        for (let i = 0; i < pstnList.length; i++) {
                            let obj = {};
                            obj.id = pstnList[i];
                            obj.type = "P";
                            managedArray.push(obj);
                        }

                        if (extensionList.length != 0 || pstnList.length != 0) {
                            const contactsToInsert = managedArray.map(contact =>
                                ({ bc_id: req.body.id, type: contact.type, ref_id: contact.id }));
                            let sql3 = knex(table.tbl_pbx_broadcast_mapping).insert(contactsToInsert);
                            sql3.then((response) => {
                                if (response) {
                                    res.send({
                                        response: response,
                                        message: 'Broadcast Updated Successfully',
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
                    } else {
                        res.status(200).send({ error: 'error', message: 'DB Error' });
                    }

                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });



            }
        }).catch((err) => {
            res.status(200).send({
                code: err.errno,
                error: 'error', message: 'DB Error: ' + err.message
            }); throw err
        });

        }
    }).catch((err) => { console.log(err); throw err });
}

function viewBC_CDR(req, res) {
    knex.raw("Call pbx_getBCCdrInfo(" + req.query.user_id+","+  req.query.limit_flag + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getBC_CdrByFilters(req, res) {
    let data = req.body.filters;
    data.by_buycost = null;
    data.by_sellcost = data.by_sellcost ? ("'" + data.by_sellcost + "'") : null;
    data.by_src = data.by_src ? ("'" + data.by_src + "'") : null;
    data.by_dest = data.by_dest ? ("'" + data.by_dest + "'") : null;
    // data.by_destination = data.by_destination ? ("'" + data.by_destination + "'") : null;
    data.by_callerid = data.by_callerid ? ("'" + data.by_callerid + "'") : null;
    data.by_terminatecause = (data.by_terminatecause).length ? ("'" + data.by_terminatecause + "'") : null;
    // data.by_bc = data.by_bc ? ("'" + data.by_bc + "'") : null;
    data.by_bc = (data.by_bc).length ? ("'" + data.by_bc + "'") : null;
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;

    let destination_data = (data.by_destination).length ? (data.by_destination).map(item => '+'+item) : "";
    data.by_destination = destination_data ? ("'" + destination_data + "'") : null;

    //  knex.raw("Call pbx_getTCCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.customer_id + ","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause + ","+ data.by_tc +")").then((response) => {
        knex.raw("Call pbx_getBCCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.customer_id + ","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause + ","+ data.by_bc +")").then((response) => {
            if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getBroadcastCount(req, res) {
    console.log(req.query)
    var bc_id = req.query.broadcast_id;//broabcast_id:
        var countQuery = knex.select(knex.raw('COUNT(dd.customer_id) as broadcast_count'))
            .from(table.tbl_DID_Destination + ' as dd')
            .where('dd.destination_id', bc_id);
    countQuery.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function deleteBC(req, res) {
    knex.raw("Call pbx_delete_broadcast(" + req.query[Object.keys(req.query)[0]] + ")")
    .then((response) => {
        if (response) {
            res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
        }
    }).catch((err) => {
        res.send({ code: err.errno, message: err.sqlMessage });
    });
}

function getIsBroadcastExist(req, res) {
    let bc_name = req.query.bc_name;
    let customer_id = req.query.customer_id;
    let bc_id = req.query.bc_id ? req.query.bc_id : null;
    var countQuery = knex.select(knex.raw('COUNT(b.id) as broadcast_count'))
        .from(table.tbl_pbx_broadcast + ' as b')
        .where('b.name', bc_name)
        .andWhere('b.customer_id', customer_id )
        .whereNot('b.id', bc_id);;
    countQuery.then((response) => {
        if (response) {
            res.json({
                response:response[0]
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


function partiallyUpdateBC(req, res) {
    let data = req.body;
    let id = req.query.id;
    let sql = knex(table.tbl_pbx_broadcast)
        .update(data)
        .where('id', '=', "" + id + "");
    sql.then((response) => {
        if (response) {
            res.send({
                response: response,
                message: 'Broadcast status Updated Successfully',
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

module.exports = { addBC, viewBC, viewSingleBCFullDetails, updateBC, viewBC_CDR,
                   getBC_CdrByFilters, getBroadcastCount, deleteBC, getIsBroadcastExist, partiallyUpdateBC }
