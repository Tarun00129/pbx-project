const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');
const Knex = require('knex');

function viewAllAppointmentIVR(req, res) {
    let customer_id = req.query.customer_id ? req.query.customer_id : null;
    var sql = knex.from(table.tbl_pbx_appointment + ' as app')
        .select('app.*', 
            Knex.raw('IF(app.welcome_prompt = 0 , "", p1.prompt_name) as welcomePrompt'),
            Knex.raw('IF(app.invalid_prompt = 0 , "", p2.prompt_name) as invalidSoundPrompt'),
            Knex.raw('IF(app.timeout_prompt = 0 , "", p3.prompt_name) as timeoutPrompt'),
            Knex.raw('GROUP_CONCAT(am.ref_id) as ref_id'),
            Knex.raw('GROUP_CONCAT(am.type) as ref_type'))
        .leftJoin(table.tbl_pbx_prompt + ' as p1', 'p1.id', 'app.welcome_prompt')
        .leftJoin(table.tbl_pbx_prompt + ' as p2', 'p2.id', 'app.invalid_prompt')
        .leftJoin(table.tbl_pbx_prompt + ' as p3', 'p3.id', 'app.timeout_prompt')
        .leftJoin(table.tbl_pbx_appointment_mapping + ' as am', 'am.appointment_id', 'app.id')
        .groupBy('am.appointment_id')
        .orderBy('app.id', 'desc')
        .where('app.customer_id', customer_id);
    sql.then((response) => {
        res.json({
            response: response,
            code: 200
        })
    }).catch((err) => { console.log(err); throw err });
}

function createAppointmentIVR(req, res) {
    var data = req.body.ivrDetail;

    let is_extension = '0';
    if (!data.is_extension || data.is_extension == '0' || data.is_extension == false || data.is_extension == '') {
        is_extension = '0';
    } else if ((data.is_extension == '1' || data.is_extension == true || data.is_extension != '')
        && (data.is_extension == '1' || data.is_extension == true || data.is_extension != '')) {
        is_extension = '1';
    }

    let is_pstn = '0';
    if (!data.is_pstn || data.is_pstn == '0' || data.is_pstn == false || data.is_pstn == '') {
        is_pstn = '0';
    } else if (data.is_pstn == '1' || data.is_pstn == true || data.is_pstn != '') {
        is_pstn = '1';
    }
    knex(table.tbl_pbx_appointment).insert({
        name: "" + data.name + "",
        customer_id: "" + data.customer_id + "",
        welcome_prompt: "" + data.welcome_prompt + "",
        invalid_prompt: "" + data.invalid_prompt + "",
        timeout_prompt: "" + data.timeout_prompt + "",
        digit_timeout: "" + data.digit_timeout + "",
        intermediate_timeout: "" + data.inter_digit_timeout + "",
        max_timeout_count: "" + data.max_timeout_try + "",
        max_invalid_count: "" + data.max_invalid_try + "",
        time_interval: "" + data.time_interval + "",
        is_extension: "" + is_extension + "",
        is_pstn: "" + is_pstn + "",
        group_ids : ""+ data.group,
        open_time: "" +data.open_time,
        close_time:""+data.close_time,
        time_break_start:""+data.time_break_start,


    }).then((response) => {
        if (response) {
            let managedArray = [];
            let extensionList = data.extension;
            let pstnList = data.pstn;

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
                    ({ appointment_id: response, type: contact.type, ref_id: contact.id }));
                console.log(contactsToInsert);

                let sql2 = knex(table.tbl_pbx_appointment_mapping).insert(contactsToInsert);
                sql2.then((response2) => {
                    if (response2) {
                        res.send({
                            response: response,
                            message: "Appointment created successfully !",
                            code: 200
                        });
                    }
                }).catch((err) => {
                    console.log(err);
                    res.status(200).send({
                        code: err.errno,
                        error: 'error', message: 'DB Error: ' + err.message
                    }); throw err
                });
            }
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getAppointmentIVRByFilters(req, res) {
    let data = req.body.filters;
    let customer_id = data.user_id ? data.user_id : null;
    var sql = knex.from(table.tbl_pbx_appointment + ' as app')
        .select('app.*',
            Knex.raw('IF(app.welcome_prompt = 0 , "", p1.prompt_name) as welcomePrompt'),
            Knex.raw('IF(app.invalid_prompt = 0 , "", p2.prompt_name) as invalidSoundPrompt'),
            Knex.raw('IF(app.timeout_prompt = 0 , "", p3.prompt_name) as timeoutPrompt'),
            Knex.raw('GROUP_CONCAT(am.ref_id) as ref_id'),
            Knex.raw('GROUP_CONCAT(am.type) as ref_type'))
        .leftJoin(table.tbl_pbx_prompt + ' as p1', 'p1.id', 'app.welcome_prompt')
        .leftJoin(table.tbl_pbx_prompt + ' as p2', 'p2.id', 'app.invalid_prompt')
        .leftJoin(table.tbl_pbx_prompt + ' as p3', 'p3.id', 'app.timeout_prompt')
        .leftJoin(table.tbl_pbx_appointment_mapping + ' as am', 'am.appointment_id', 'app.id')
        .groupBy('am.appointment_id')
        .orderBy('app.id', 'desc')
        .where('app.customer_id', customer_id);
    if (data.by_name != '') {
        sql = sql.andWhere('app.name', 'like', '%' + data.by_name + '%');
    }
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });


}

function updateAppointmentIVR(req, res) {
    var data = req.body.ivrDetail;
    let is_extension = '0';
    if (!data.is_extension || data.is_extension == '0' || data.is_extension == false || data.is_extension == '') {
        is_extension = '0';
    } else if ((data.is_extension == '1' || data.is_extension == true || data.is_extension != '')
        && (data.is_extension == '1' || data.is_extension == true || data.is_extension != '')) {
        is_extension = '1';
    }

    let is_pstn = '0';
    if (!data.is_pstn || data.is_pstn == '0' || data.is_pstn == false || data.is_pstn == '') {
        is_pstn = '0';
    } else if (data.is_pstn == '1' || data.is_pstn == true || data.is_pstn != '') {
        is_pstn = '1';
    }
    console.log(data,"------------------yash------------------------------------");
    let sql = knex(table.tbl_pbx_appointment).update({
        name: "" + data.name + "",
        customer_id: "" + data.customer_id + "",
        welcome_prompt: "" + data.welcome_prompt + "",
        invalid_prompt: "" + data.invalid_prompt + "",
        timeout_prompt: "" + data.timeout_prompt + "",
        digit_timeout: "" + data.digit_timeout + "",
        intermediate_timeout: "" + data.inter_digit_timeout + "",
        max_timeout_count: "" + data.max_timeout_try + "",
        max_invalid_count: "" + data.max_invalid_try + "",
        time_interval: "" + data.time_interval + "",
        is_extension: "" + is_extension + "",
        is_pstn: "" + is_pstn + "",
        group_ids: "" + data.group,
        open_time:""+ data.open_time,
        close_time:""+data.close_time,
        time_break_start:""+data.time_break_start,
    }).where('id', '=', "" + data.id + "")
        .andWhere('customer_id', data.customer_id);
    sql.then((response) => {
        if (response) {
            let appoinmentId = req.body.ivrDetail.id ? req.body.ivrDetail.id : 0;
            let sql2 = knex(table.tbl_pbx_appointment_mapping).where('appointment_id', '=', "" + appoinmentId + "")
            sql2.del();
            sql2.then((response) => {
                console.log('>>>>>>=====>>>', response)
                if (response) {
                    console.log('>>>>>>>>>', response)
                    let managedArray = [];
                    let extensionList = req.body.ivrDetail.extension;
                    let pstnList = req.body.ivrDetail.pstn;
                    console.log('>>>>>>>>>', extensionList)
                    console.log('>>>>>>>>>', pstnList)
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
                    console.log('>>>>>>>>>', managedArray)

                    if (extensionList.length != 0 || pstnList.length != 0) {
                        const contactsToInsert = managedArray.map(contact =>
                            ({ appointment_id: req.body.ivrDetail.id, type: contact.type, ref_id: contact.id }));
                        console.log(contactsToInsert);
                        let sql3 = knex(table.tbl_pbx_appointment_mapping).insert(contactsToInsert);
                        sql3.then((response) => {
                            if (response) {
                                res.send({
                                    response: response,
                                    message: 'Appointment Updated Successfully',
                                    code: 200
                                });
                            }
                        }).catch((err) => {
                            console.log(err);
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

    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function deleteAppointmentIVR(req, res) {
    let appointment_id = req.query[Object.keys(req.query)[0]];
    let sql = knex(table.tbl_pbx_appointment).where('id', '=', "" + appointment_id + "");
    sql.del();
    sql.then((response) => {
        if (response) {
            res.json({
                response: response,
                code: 200,
                message: 'You have deleted this Appointment!'

            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error' });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function viewAppointment_CDR(req, res) {
    knex.raw("Call pbx_getAppointmentCdrInfo(" + req.query.user_id+","+  req.query.limit_flag + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAppointment_CdrByFilters(req, res) {
    let data = req.body.filters;
    // let rangeFrom = data.by_date ? data.by_date[0].split('T')[0] : null;
    // let rangeTo = data.by_date ? data.by_date[1].split('T')[0] : null;
    data.by_buycost = null;
    data.by_sellcost = data.by_sellcost ? ("'" + data.by_sellcost + "'") : null;
    data.by_src = data.by_src ? ("'" + data.by_src + "'") : null;
    data.by_dest = data.by_dest ? ("'" + data.by_dest + "'") : null;
    data.by_destination = data.by_destination ? ("'" + data.by_destination + "'") : null;
    data.by_callerid = data.by_callerid ? ("'" + data.by_callerid + "'") : null;
    data.by_terminatecause = data.by_terminatecause ? ("'" + data.by_terminatecause + "'") : null;
    data.by_appointment = data.by_appointment ? ("'" + data.by_appointment + "'") : null;
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    //  knex.raw("Call pbx_getTCCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.customer_id + ","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause + ","+ data.by_tc +")").then((response) => {
        knex.raw("Call pbx_getAppointmentCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.customer_id + ","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause + ","+ data.by_appointment +")").then((response) => {
            if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}
function viewAppointmentHistory(req, res) {
    var isFilter = req.query.appointment_name;
    // console.log(,'-------------filterdata---------');
  let sql =  knex.select('ap.name','aps.src','aps.time_start','aps.time_end',
        //     knex.raw('DATE_FORMAT(FD.reservation_date,"%d-%m-%Y %H:%i:%s") as time_start'),
          knex.raw('DATE_FORMAT(aps.date_slot,"%d-%m-%Y ") as date_slot'))
        .from(table.tbl_pbx_appointment_slots + ' as aps')
        .leftJoin(table.tbl_pbx_appointment + ' as ap ','ap.id','aps.app_id')
        // .where('aps.date_slot',knex.raw('current_date()'))
        .andWhereRaw('aps.date_slot >= CURRENT_DATE()')
        // .where('customer_id', '=', "" + customer_id + "")
        // .orderBy('ar.id', 'desc')
        if(isFilter){
            sql.andWhere('ap.name','like',"%"+isFilter+"%");
        }
        // console.log(sql.toQuery(),"000000000000in query");
        sql.then((response) => {  

            // console.log(response,'----------history------------');          
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Contact list ' }); throw err });

}
// function getAllFeatureDIDHistory(req, res){
//     var id = req.query.id;
//     var sql = knex.select('FD.did_number','FD.did_id','FD.product','FD.assigned_to','FD.time_group_name',
//                    knex.raw('DATE_FORMAT(FD.reservation_date,"%d-%m-%Y %H:%i:%s") as time_start'),
//                    knex.raw('DATE_FORMAT(FD.release_date,"%d-%m-%Y %H:%i:%s") as time_end'))
//                   .from(table.tbl_pbx_appointment_slots + ' as aps').where('aps.app_id','=',id)
//                   .leftJoin(table.tbl_pbx_appointment + ' as ap ','ap.id','aps.app_id')

//     // console.log(sql.query);
//     // var test = updateDestination.p_assign;
//     // console.log(p_assign);
//     sql.then((response) => {
//     if (response) { 
//         res.json({
//             response
//         });
//     } else {
//         res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
//     }
// }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
// }



module.exports = {
    viewAllAppointmentIVR, createAppointmentIVR, getAppointmentIVRByFilters, updateAppointmentIVR, deleteAppointmentIVR,
    viewAppointment_CDR, getAppointment_CdrByFilters,viewAppointmentHistory
}