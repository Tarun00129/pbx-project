const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');

function viewAllSMS(req, res) {
    var sql = knex.from(table.tbl_pbx_SMS)
        .select('*');
    sql.then((response) => {
        res.json({
            response: response,
            code: 200
        })
    }).catch((err) => { console.log(err); throw err });
}

function addTCPlan(req, res)
{
    let data = req.body;
    let sql = knex(table.tbl_pbx_tc_plan).insert({name: "" + data.name + "", price: "" + data.price, description: "" + data.description, customer_id: "" + data.customerId  }); 
        sql.then((response) =>{
            if (response) {
                res.send({
                    response: response,
                    message : 'TC Plan create successfully',
                    code: 200
                });
            }
    }).catch((err) => { 
        console.log(err); 
        res.status(200).send({ 
            code:err.errno,
            error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function viewTCPlan(req, res) {
    var body = req.body;
    let customerId = parseInt(req.query.customer_id);
    let isFilter = Object.keys(body).length == 0 ? false : true;
    var sql = knex.from(table.tbl_pbx_tc_plan)
        .select('*')
        .where('customer_id', '=', customerId);
    if (isFilter) {
        sql.where('name', 'like', '%' + body.name + '%')
    }
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}


function updateTCPlan(req, res){
    let body = req.body;
    console.log(body);
    let sql = knex(table.tbl_pbx_tc_plan)
             .where('name', '=', "" + body.name + "")
             .whereNot('id', body.id);
    sql.then((response) => {
        if(response.length == 0 ) {
            let sql = knex(table.tbl_pbx_tc_plan).where('id', '=', "" + body.id + "");
            body.customer_id = body.customerId;
            delete body.id;
            delete body.customerId;
            sql.update(body)
            sql.then((response) => {
                res.json({
                    response:response,
                    code:200
                });  
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        } else {
            res.json({
                response:response,
                code:201,
                message:`Plan name already exist`
            });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getMyAssignedMinutes(req, res) {
    let customerId = parseInt(req.query.customer_id);
    var sql = knex.distinct()
        .from(table.tbl_pbx_tc_plan_mapping + ' as tcplm')
        .sum('tcplm.minutes as minutes')
        .where('tcplm.customer_id', '=', customerId)
        .orderBy('tcplm.id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function assignMinuteToUser(req, res) {
    let data = req.body;
    let sql = knex(table.tbl_pbx_tc_plan_mapping)
        .insert({ tc_plan_id: "" + data.name + "", user_id: "" + data.user_id, minutes: "" + data.assign_minute, customer_id: "" + data.customerId });
    sql.then((response) => {
        if (response) {
            let managedArray = data.minutManageForm;
            let insertedPlanId = response[0];
            const contactsToInsert = managedArray.map(contact =>
                ({ destination: contact['destination'], contact_id: data.user_id, tc_plan_id: data.name, assign_minutes: contact['minutes'], customer_id: data.customerId, tc_plan_mapped_id : insertedPlanId }));
            console.log(contactsToInsert);
            let sql2 = knex(table.tbl_pbx_min_tc_mapping).insert(contactsToInsert);
            sql2.then((response) => {
                if (response) {
                    res.send({
                        response: response,
                        message: 'Assign Minutes to user successfully',
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
    }).catch((err) => {
        console.log(err);
        res.status(200).send({
            code: err.errno,
            error: 'error', message: 'DB Error: ' + err.message
        }); throw err
    });
}

function viewAssignUsers(req, res) {
    var body = req.body;
    let customerId = parseInt(req.query.customer_id);
    let isFilter = Object.keys(body).length == 0 ? false : true;
    var sql = knex.from(table.tbl_pbx_tc_plan_mapping + ' as tcpm')
        .select('tcpm.id','tcpm.tc_plan_id', 'tcpm.user_id', 'tcp.name as plan_name', 'cl.name', 'tcpm.used_minute',
        knex.raw('GROUP_CONCAT( distinct mtc.destination) as destination'),
        knex.raw('GROUP_CONCAT( distinct mtc.assign_minutes) as minutes'))
        .leftJoin(table.tbl_pbx_tc_plan + ' as tcp', 'tcp.id', 'tcpm.tc_plan_id')
        .leftJoin(table.tbl_Contact_list + ' as cl', 'cl.id', 'tcpm.user_id')
        .leftJoin(table.tbl_pbx_min_tc_mapping + ' as mtc', 'mtc.tc_plan_mapped_id', 'tcpm.id')
        .where('tcp.customer_id', '=', customerId)
        .groupBy('tcpm.id');
    if (isFilter) {
        sql.where('tcp.name', 'like', '%' + body.name + '%')
    }
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function updateassignMinuteToUser(req, res) {
    let data = req.body;
    console.log(data)
    let sql = knex(table.tbl_pbx_tc_plan_mapping).where('id', '=', "" + data.id + "");
    sql.update({ tc_plan_id: "" + data.name + "",
                 user_id: "" + data.user_id,
                  minutes: "" + data.assign_minute,
                });
    sql.then((response) => {
        if (response) {
            let sql2 = knex(table.tbl_pbx_min_tc_mapping).where('tc_plan_mapped_id', '=', "" + data.id + "")
            sql2.del();
            sql2.then((response2) => {
                if (response2) {
                    let managedArray = data.minutManageForm;
                    let insertedPlanId = data.id;
                    const contactsToInsert = managedArray.map(contact =>
                        ({ destination: contact['destination'], contact_id: data.user_id, tc_plan_id: data.name, assign_minutes: contact['minutes'], customer_id: data.customerId, tc_plan_mapped_id: insertedPlanId }));
                    console.log(contactsToInsert);
                    let sql2 = knex(table.tbl_pbx_min_tc_mapping).insert(contactsToInsert);
                    sql2.then((response) => {
                        if (response) {
                            res.send({
                                response: response,
                                message: 'Assign Minutes to user update successfully',
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
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        }
        // res.json({
        //     response: response,
        //     message: 'Assign Minutes to user update successfully',
        //     code: 200
        // });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
} 


function addTC(req, res) {
    let data = req.body;
    console.log(req.body);
    let max_waiting_call = '';
    req.body.max_waiting_call = req.body.max_waiting_call ? "" + req.body.max_waiting_call + "" : 0;

    let recording = '';
    if (!req.body.recording || req.body.recording == '0' || req.body.recording == false || req.body.recording == '') {
        recording = '0';
    } else if (req.body.recording == '1' || req.body.recording == true || req.body.recording != '') {
        recording = '1';
    }

    let moh = '';
    if (!req.body.moh || req.body.moh == '') {
        moh = '0';
    } else if (req.body.moh != '') {
        moh = req.body.moh;
    }

    let ring_strategy = '';
    if (!req.body.ring_strategy || req.body.ring_strategy == '') {
        ring_strategy = '0';
    } else if (req.body.ring_strategy != '') {
        ring_strategy = req.body.ring_strategy;
    }

    let periodic_announcement = '';
    if (!req.body.periodic_announcement || req.body.periodic_announcement == '0' || req.body.periodic_announcement == false || req.body.periodic_announcement == '') {
        periodic_announcement = '0';
    } else if (req.body.periodic_announcement == '1' || req.body.periodic_announcement == true || req.body.periodic_announcement != '') {
        periodic_announcement = '1';
    }

    let periodic_announcement_time = '';
    if (!req.body.periodic_announcement || req.body.periodic_announcement == '0' || req.body.periodic_announcement == false || req.body.periodic_announcement == '') {
        periodic_announcement_time = '0'
    } else if (req.body.periodic_announcement == '1' || req.body.periodic_announcement == true || req.body.periodic_announcement != '') {
        periodic_announcement_time = req.body.periodic_announcement_time ? req.body.periodic_announcement_time : "1";
    }

    let play_position_on_call = '';
    if (!req.body.play_position_on_call || req.body.play_position_on_call == '0' || req.body.play_position_on_call == false || req.body.play_position_on_call == '') {
        play_position_on_call = '0';
    } else if (req.body.play_position_on_call == '1' || req.body.play_position_on_call == true || req.body.play_position_on_call != '') {
        play_position_on_call = '1';
    }

    let play_position_periodically = '0';
    if (!req.body.play_position_periodically || req.body.play_position_periodically == '0' || req.body.play_position_periodically == false || req.body.play_position_periodically == '') {
        play_position_periodically = '0';
    } else if ((req.body.play_position_periodically == '1' || req.body.play_position_periodically == true || req.body.play_position_periodically != '')
        && (req.body.play_position_on_call == '1' || req.body.play_position_on_call == true || req.body.play_position_on_call != '')) {
        play_position_periodically = '1';
    }

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

    let unauthorized_fail = '';
    if (!req.body.unauthorized_fail || req.body.unauthorized_fail == '0' || req.body.unauthorized_fail == false || req.body.unauthorized_fail == '') {
        unauthorized_fail = '0';
    } else if (req.body.unauthorized_fail == '1' || req.body.unauthorized_fail == true || req.body.unauthorized_fail != '') {
        unauthorized_fail = '1';
    }

    let sql = knex(table.tbl_pbx_tc).insert({
        name: "" + data.name + "",
       // max_waiting_call: "" + req.body.max_waiting_call + "",
        welcome_prompt: "" + req.body.welcome_prompt + "",
        moh: "" + moh + "",
        ring_strategy: "" + ring_strategy + "",
        recording: "" + recording + "",
        periodic_announcement: "" + periodic_announcement + "",
        periodic_announcement_time: "" + periodic_announcement_time + "",
        periodic_announcement_prompt: "" + req.body.periodic_announcement_prompt + "",
        play_position_on_call: "" + play_position_on_call + "",
        play_position_periodically: "" + play_position_periodically + "",
        is_extension: "" + is_extension + "",
        is_pstn: "" + is_pstn + "",
        customer_id : "" + req.body.customerId + "",
        unauthorized_fail : "" + unauthorized_fail + "",
        active_feature : "" + req.body.active_feature + "",
        active_feature_value : "" + req.body.active_feature_value + ""
    });

    sql.then((response) => {
        if (response) {
            let managedArray = [];
            let extensionList = req.body.extension;
            let pstnList = req.body.pstn;
            let userList = req.body.user_ids;
        
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
            for (let i = 0; i < userList.length; i++) {
                let obj = {};
                obj.id = userList[i];
                obj.type = "U";
                managedArray.push(obj);
            }

            if (userList.length != 0 && (extensionList.length != 0 || pstnList.length != 0)) {
                const contactsToInsert = managedArray.map(contact =>
                    ({ tc_id : response, type: contact.type, ref_id: contact.id }));
                console.log(contactsToInsert);

                let sql2 = knex(table.tbl_pbx_tc_mapping).insert(contactsToInsert);
                sql2.then((response) => {
                    if (response) {
                        res.send({
                            response: response,
                            message: 'Add TC successfully',
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
    }).catch((err) => {
        console.log(err);
        res.status(200).send({
            code: err.errno,
            error: 'error', message: 'DB Error: ' + err.message
        }); throw err
    });
}

function viewTC(req, res) {
    var body = req.body;
    let customerId = parseInt(req.query.customer_id);
    let isFilter = Object.keys(body).length == 0 ? false : true;
    var sql = knex.from(table.tbl_pbx_tc + ' as tc')
        .select('tc.id', 'tc.name', 'tc.max_waiting_call', 'tc.moh', 'tc.welcome_prompt',  
                knex.raw('IF (tc.recording = "0","Off","On") AS recordingDisplay'),
                knex.raw('IF (tc.recording = "0",0,1) AS recording'),
                knex.raw('IF (tc.ring_strategy = "0","Ring All", IF (tc.ring_strategy = "1","Round Robin","Random")) AS ring_strategy'),
                knex.raw('IF (tc.ring_strategy = "0","0", IF (tc.ring_strategy = "1","1","2")) AS ringStrategyDisplay'), 
                knex.raw('IF (tc.periodic_announcement = "0",0,1) as periodic_announcement'),
                knex.raw('IF (periodic_announcement = "0","Off","On") as periodicAnnouncementDisplay'),
                knex.raw('IF (tc.periodic_announcement_time = "0","", IF (tc.periodic_announcement_time = "1", "15", IF(tc.periodic_announcement_time = "2", "30","60"))) as periodic_announcement_time1'),
                knex.raw('IF (tc.periodic_announcement_time = "0","0", IF(tc.periodic_announcement_time = "1", "1", IF(tc.periodic_announcement_time = "2", "2","3"))) as periodicAnnouncementTimeDisplay'),
                knex.raw('IF (tc.play_position_on_call = "0",0,1) as play_position_on_call'),
                knex.raw('IF (tc.play_position_on_call = "0","Off","On") as playPositionOnCallDisplay'),
                knex.raw('IF (tc.play_position_periodically = "0",0,1) as play_position_periodically'),
                 'tc.periodic_announcement_prompt' ,'tc.periodic_announcement_time'
                )
        .where('customer_id', '=', customerId)
        .orderBy('tc.id', 'desc');
    if (isFilter) {
        sql.where('name', 'like', '%' + body.name + '%')
    }
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function viewSingleTCFullDetails(req, res) {
    var body = req.body;
    let tcId = parseInt(req.query.tc_id);
    var sql = knex.from(table.tbl_pbx_tc + ' as tc')
        .select('tc.id', 'tc.name', 'tc.max_waiting_call', 'tc.moh', 'tc.welcome_prompt','tc.unauthorized_fail','tc.active_feature','tc.active_feature_value',
            knex.raw('IF (tc.recording = "0","Off","On") AS recordingDisplay'),
            knex.raw('IF (tc.recording = "0",0,1) AS recording'),
            knex.raw('IF (tc.unauthorized_fail = "0",0,1) AS unauthorized_fail'),
            knex.raw('IF (tc.ring_strategy = "0","Ring All", IF (tc.ring_strategy = "1","Round Robin","Random")) AS ring_strategy'),
            knex.raw('IF (tc.ring_strategy = "0","0", IF (tc.ring_strategy = "1","1","2")) AS ringStrategyDisplay'),
            knex.raw('IF (tc.periodic_announcement = "0",0,1) as periodic_announcement'),
            knex.raw('IF (periodic_announcement = "0","Off","On") as periodicAnnouncementDisplay'),
            knex.raw('IF (tc.periodic_announcement_time = "0","", IF (tc.periodic_announcement_time = "1", "15", IF(tc.periodic_announcement_time = "2", "30","60"))) as periodic_announcement_time1'),
            knex.raw('IF (tc.periodic_announcement_time = "0","0", IF(tc.periodic_announcement_time = "1", "1", IF(tc.periodic_announcement_time = "2", "2","3"))) as periodicAnnouncementTimeDisplay'),
            knex.raw('IF (tc.play_position_on_call = "0",0,1) as play_position_on_call'),
            knex.raw('IF (tc.play_position_on_call = "0","Off","On") as playPositionOnCallDisplay'),
            knex.raw('IF (tc.play_position_periodically = "0",0,1) as play_position_periodically'),
            'tc.periodic_announcement_prompt', 'tc.periodic_announcement_time','tc.is_extension','tc.is_pstn',
            knex.raw('GROUP_CONCAT(tcm.ref_id) as ref_id'),
            knex.raw('GROUP_CONCAT(tcm.type) as ref_type'))
        .leftJoin(table.tbl_pbx_tc_mapping + ' as tcm', 'tcm.tc_id', tcId)
        .where('tc.id', '=', tcId);
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function updateTC(req, res) {
    let data = req.body;
    console.log(req.body);
    let max_waiting_call = '';
    req.body.max_waiting_call = req.body.max_waiting_call ? "" + req.body.max_waiting_call + "" : 0;

    let recording = '';
    if (!req.body.recording || req.body.recording == '0' || req.body.recording == false || req.body.recording == '') {
        recording = '0';
    } else if (req.body.recording == '1' || req.body.recording == true || req.body.recording != '') {
        recording = '1';
    }

    let moh = '';
    if (!req.body.moh || req.body.moh == '') {
        moh = '0';
    } else if (req.body.moh != '') {
        moh = req.body.moh;
    }

    let ring_strategy = '';
    if (!req.body.ring_strategy || req.body.ring_strategy == '') {
        ring_strategy = '0';
    } else if (req.body.ring_strategy != '') {
        ring_strategy = req.body.ring_strategy;
    }

    let periodic_announcement = '';
    if (!req.body.periodic_announcement || req.body.periodic_announcement == '0' || req.body.periodic_announcement == false || req.body.periodic_announcement == '') {
        periodic_announcement = '0';
    } else if (req.body.periodic_announcement == '1' || req.body.periodic_announcement == true || req.body.periodic_announcement != '') {
        periodic_announcement = '1';
    }

    let periodic_announcement_time = '';
    if (!req.body.periodic_announcement || req.body.periodic_announcement == '0' || req.body.periodic_announcement == false || req.body.periodic_announcement == '') {
        periodic_announcement_time = '0'
    } else if (req.body.periodic_announcement == '1' || req.body.periodic_announcement == true || req.body.periodic_announcement != '') {
        periodic_announcement_time = req.body.periodic_announcement_time ? req.body.periodic_announcement_time : "1";
    }

    let play_position_on_call = '';
    if (!req.body.play_position_on_call || req.body.play_position_on_call == '0' || req.body.play_position_on_call == false || req.body.play_position_on_call == '') {
        play_position_on_call = '0';
    } else if (req.body.play_position_on_call == '1' || req.body.play_position_on_call == true || req.body.play_position_on_call != '') {
        play_position_on_call = '1';
    }

    let play_position_periodically = '0';
    if (!req.body.play_position_periodically || req.body.play_position_periodically == '0' || req.body.play_position_periodically == false || req.body.play_position_periodically == '') {
        play_position_periodically = '0';
    } else if ((req.body.play_position_periodically == '1' || req.body.play_position_periodically == true || req.body.play_position_periodically != '')
        && (req.body.play_position_on_call == '1' || req.body.play_position_on_call == true || req.body.play_position_on_call != '')) {
        play_position_periodically = '1';
    }

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

    let unauthorized_fail = '';
    if (!req.body.unauthorized_fail || req.body.unauthorized_fail == '0' || req.body.unauthorized_fail == false || req.body.unauthorized_fail == '') {
        unauthorized_fail = '0';
    } else if (req.body.unauthorized_fail == '1' || req.body.unauthorized_fail == true || req.body.unauthorized_fail != '') {
        unauthorized_fail = '1';
    }

    let sql = knex(table.tbl_pbx_tc)
        .update({
            name: "" + data.name + "",
            // max_waiting_call: "" + req.body.max_waiting_call + "",
            welcome_prompt: "" + req.body.welcome_prompt + "",
            moh: "" + moh + "",
            ring_strategy: "" + ring_strategy + "",
            recording: "" + recording + "",
            periodic_announcement: "" + periodic_announcement + "",
            periodic_announcement_time: "" + periodic_announcement_time + "",
            periodic_announcement_prompt: "" + req.body.periodic_announcement_prompt + "",
            play_position_on_call: "" + play_position_on_call + "",
            play_position_periodically: "" + play_position_periodically + "",
            is_extension: "" + is_extension + "",
            is_pstn: "" + is_pstn + "",
            unauthorized_fail : "" + unauthorized_fail + "",
            active_feature : "" + req.body.active_feature + "",
            active_feature_value : "" + req.body.active_feature_value + ""
        })
        .where('id', '=', "" + req.body.id + "");

    sql.then((response) => {
        let tcId = req.body.id ? req.body.id : 0;
        if (response) {
            let sql2 = knex(table.tbl_pbx_tc_mapping).where('tc_id', '=', "" + tcId + "")
            sql2.del();
            sql2.then((response) => {
                console.log('>>>>>>=====>>>', response)
                if (response) {
                    console.log('>>>>>>>>>', response)
                    let managedArray = [];
                    let extensionList = req.body.extension;
                    let pstnList = req.body.pstn;
                    let userList = req.body.user_ids;
                    console.log('>>>>>>>>>', extensionList)
                    console.log('>>>>>>>>>', pstnList)
                    console.log('>>>>>>>>>', userList)

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
                    for (let i = 0; i < userList.length; i++) {
                        let obj = {};
                        obj.id = userList[i];
                        obj.type = "U";
                        managedArray.push(obj);
                    }
                    console.log('>>>>>>>>>', managedArray)

                    if (userList.length != 0 && (extensionList.length != 0 || pstnList.length != 0)) {
                        const contactsToInsert = managedArray.map(contact =>
                            ({ tc_id: req.body.id, type: contact.type, ref_id: contact.id }));
                        console.log(contactsToInsert);
                        let sql3 = knex(table.tbl_pbx_tc_mapping).insert(contactsToInsert);
                        sql3.then((response) => {
                            if (response) {
                                res.send({
                                    response: response,
                                    message: 'Update TC successfully',
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
    }).catch((err) => {
        console.log(err);
        res.status(200).send({
            code: err.errno,
            error: 'error', message: 'DB Error: ' + err.message
        }); throw err
    });
}

function deleteTC(req, res) {
    knex.raw("Call pbx_delete_tc(" + req.query[Object.keys(req.query)[0]] + ")")
    .then((response) => {
        if (response) {
            res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
        }
    }).catch((err) => {
        res.send({ code: err.errno, message: err.sqlMessage });
    });
}

function deleteTCMinuteMapping(req, res) {
    var mappingID = req.query[Object.keys(req.query)[0]];
    console.log(mappingID)
    let sql = knex(table.tbl_pbx_tc_plan_mapping).where('id', '=', "" + mappingID + "")
    sql.del();
    sql.then((response) => {
        if (response) {
            res.json({
                response: response,
                message: 'Minute Mapping deleted'
            });
        } else {
            res.status(200).send({ error: 'error', message: 'DB Error' });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function deleteTCPlan(req, res) {
    var tcPlanID = req.query[Object.keys(req.query)[0]];
    console.log(tcPlanID)
    let sql = knex(table.tbl_pbx_tc_plan_mapping).where('tc_plan_id', '=', "" + tcPlanID + "");
    sql.then((response) => {
        if (response.length == 0) {
            let sql2 = knex(table.tbl_pbx_tc_plan).where('id', '=', "" + tcPlanID + "");
            sql2.del();
            sql2.then((response) => {
                if (response) {
                    res.json({
                        response: response,
                        message: 'TC Plan deleted'
                    });
                } else {
                    res.status(200).send({ error: 'error', message: 'DB Error' });
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        } else {
            res.send({ code: 400, message: 'TC Plan already associate with customer assign minutes' })
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function viewTCPlanAssociateUsers(req, res) {
    var body = req.body;
    let tcId = parseInt(req.query.tcPlan_id);
    var sql = knex.from(table.tbl_pbx_tc_plan_mapping + ' as tc')
        .select('tc.user_id','cl.name','cl.email', 'cl.phone_number1','cl.phone_number2')
        .leftJoin(table.tbl_Contact_list + ' as cl', 'cl.id', 'tc.user_id')
        .where('tc.tc_plan_id', '=', tcId);
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function viewAssignMinuteUsers(req, res) {
    var data = req.body;
    let userId = data['user_ID'];
    let planId = data['tc_PlanID'];
    console.log(data)
    var sql = knex.from(table.tbl_pbx_tc_plan_mapping + ' as tcp')
        .select('*')
        .where('tcp.tc_plan_id', '=', planId)
        .andWhere('tcp.user_id', '=', userId)
        .whereNot('tcp.id', data['id']);
    sql.then((response) => {
        res.json({
            response:response,
            message: "User have already assign minutes"
        })
    }).catch((err) => { console.log(err); throw err });
}

function viewTC_CDR(req, res) {
    knex.raw("Call pbx_getTCCdrInfo(" + req.query.user_id+","+  req.query.limit_flag + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getTC_CdrByFilters(req, res) {
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
    data.by_tc = data.by_tc ? ("'" + data.by_tc + "'") : null;
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    //  knex.raw("Call pbx_getTCCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.customer_id + ","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause + ","+ data.by_tc +")").then((response) => {
        knex.raw("Call pbx_getTCCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.customer_id + ","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause + ","+ data.by_tc +")").then((response) => {
            if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

module.exports = { viewTCPlan, addTCPlan, updateTCPlan, getMyAssignedMinutes,deleteTCPlan,
                    assignMinuteToUser, viewAssignUsers, updateassignMinuteToUser,deleteTCMinuteMapping,viewTCPlanAssociateUsers, viewAssignMinuteUsers,
                    addTC, viewTC, viewSingleTCFullDetails, updateTC, deleteTC,
                    viewTC_CDR, getTC_CdrByFilters }
