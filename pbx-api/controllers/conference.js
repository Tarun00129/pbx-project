const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');
/**
* Returns jwt token if valid email and password is provided
* @param req
* @param res
* @returns {*}
*/

function createConference(req, res) {
    let recording = '';
    let end_conf  = '';
    let name_record = '';
    let wait_moderator = '';
    if (!req.body.conference.recording || req.body.conference.recording == '0' || req.body.conference.recording == false || req.body.conference.recording == '') {
        recording = '0';
    } else if (req.body.conference.recording == '1' || req.body.conference.recording == true || req.body.conference.recording != '') {
        recording = '1';
    }

    // let welcome_prompt = '0';
    // if (!req.body.conference.welcome_prompt || req.body.conference.welcome_prompt == '' || req.body.conference.welcome_prompt == 0) {
    //     welcome_prompt = '0';
    // } else if (req.body.conference.welcome_prompt != '') {
    //     welcome_prompt = req.body.conference.welcome_prompt;
    // }

    let moh = '';
    if (!req.body.conference.moh || req.body.conference.moh == '' || req.body.conference.moh == 0) {
        moh = '0';
    } else if (req.body.conference.moh != '') {
        moh = req.body.conference.moh;
    }

    if (!req.body.conference.end_conf || req.body.conference.end_conf == '0' || req.body.conference.end_conf == false || req.body.conference.end_conf == '') {
        end_conf = '0';
    } else if (req.body.conference.end_conf == '1' || req.body.conference.end_conf == true || req.body.conference.end_conf != '') {
        end_conf = '1';
    }
    if (!req.body.conference.name_record || req.body.conference.name_record == '0' || req.body.conference.name_record == false || req.body.conference.name_record == '') {
        name_record = '0';
    } else if (req.body.conference.name_record == '1' || req.body.conference.name_record == true || req.body.conference.name_record != '') {
        name_record = '1';
    }
    if (!req.body.conference.wait_moderator || req.body.conference.wait_moderator == '0' || req.body.conference.wait_moderator == false || req.body.conference.wait_moderator == '') {
        wait_moderator = '0';
    } else if (req.body.conference.wait_moderator == '1' || req.body.conference.wait_moderator == true || req.body.conference.wait_moderator != '') {
        wait_moderator = '1';
    }

    if (!req.body.conference.id) {
        let start_date = req.body.conference.conf_join_start_date;
        let conf_join_start_date = moment(start_date).format('YYYY-MM-DD HH:mm:ss');
        let end_date = req.body.conference.conf_join_end_date;
        let conf_join_end_date = moment(end_date).format('YYYY-MM-DD HH:mm:ss');

        knex.raw("Call pbx_save_conference(" + req.body.conference.id + ",'" + req.body.conference.name + "'," + req.body.conference.conf_ext + ",'" + conf_join_start_date + "',\
    '" + conf_join_end_date + "'," + req.body.conference.admin_pin + "," + req.body.conference.participant_pin + "," + req.body.conference.welcome_prompt + "," + moh + ",\
    '" + recording + "','1'," + req.body.conference.customer_id + ",'" + req.body.conference.participant + "','"  + wait_moderator + "','" + name_record + "','" + end_conf + "')")
            .then((response) => {
                if (response) {
                    res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
                }
            }).catch((err) => {
                res.send({ code: err.errno, message: err.sqlMessage });
            });
    } else {
        let start_date = req.body.conference.conf_join_start_date;
        let end_date = req.body.conference.conf_join_end_date;
        knex.from(table.tbl_PBX_conference).where('id', '=', "" + req.body.conference.id + "")
            .select('conf_join_start_date', 'conf_join_end_date')
            .then((response) => {
                if (response.length > 0) {
                    let conf = Object.values(JSON.parse(JSON.stringify(response)));
                    let lastStartDate = conf[0].conf_join_start_date;
                    let lastEndDate = conf[0].conf_join_end_date;
                    let conf_join_start_date = '';
                    let conf_join_end_date = '';
                    if (lastStartDate == start_date) {
                        conf_join_start_date = start_date;
                    } else {
                        conf_join_start_date = moment(start_date).format('YYYY-MM-DD HH:mm:ss');
                    }

                    if (lastEndDate == end_date) {
                        conf_join_end_date = end_date;
                    } else {
                        conf_join_end_date = moment(end_date).format('YYYY-MM-DD HH:mm:ss');
                    }

                    if (conf_join_start_date == 'Invalid date') {
                        conf_join_start_date = lastStartDate;
                    }

                    if (conf_join_end_date == 'Invalid date') {
                        conf_join_end_date = lastEndDate;
                    }

                    // console.log(knex.raw("Call pbx_save_conference(" + req.body.conference.id + ",'" + req.body.conference.name + "'," + req.body.conference.conf_ext + ",'" + conf_join_start_date + "',\
                    // '" + conf_join_end_date + "'," + req.body.conference.admin_pin + "," + req.body.conference.participant_pin + "," + welcome_prompt + "," + moh + ",\
                    // '" + recording + "','1'," + req.body.conference.customer_id + ",'" + req.body.conference.participant + "')").toString());


                    knex.raw("Call pbx_save_conference(" + req.body.conference.id + ",'" + req.body.conference.name + "'," + req.body.conference.conf_ext + ",'" + conf_join_start_date + "',\
                        '" + conf_join_end_date + "'," + req.body.conference.admin_pin + "," + req.body.conference.participant_pin + "," + req.body.conference.welcome_prompt + "," + moh + ",\
                        '" + recording + "','1'," + req.body.conference.customer_id + ",'" + req.body.conference.participant + "','"  + wait_moderator + "','" + name_record + "','" + end_conf + "')")
                        .then((response) => {
                            if (response) {
                                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
                            }
                        }).catch((err) => {
                            res.send({ code: err.errno, message: err.sqlMessage });
                        });
                }
            }).catch((err) => { console.log(err); throw err });
    }

}


function viewConference(req, res) {
    req.body.id = req.body.id ? req.body.id : null;
    req.body.name = req.body.name ? ("'" + req.body.name + "'") : null;
    req.body.adminPin = req.body.adminPin ? ("" + req.body.adminPin + "") : null;
    req.body.participantPin = req.body.participantPin ? ("" + req.body.participantPin + "") : null;

    knex.raw("Call pbx_get_conference(" + req.body.id + "," + req.body.name + "," + req.body.adminPin + "," + req.body.participantPin + "," + req.body.customer_id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });

}


function getConferenceByFilters(req, res) {
    let data = req.body.credentials;
    let start_date = data.by_range ? data.by_range[0] : null;
    let end_date = data.by_range ? data.by_range[1] : null;
    start_date = start_date ? ("'" + moment(start_date).format('YYYY-MM-DD') + "'") : null;
    end_date = end_date ? ("'" + moment(end_date).format('YYYY-MM-DD') + "'") : null;

    data.name = data.name ? ("'" + data.name + "'") : null;
    data.admin_pin = data.admin_pin ? ("" + data.admin_pin + "") : null;
    data.participant_pin = data.participant_pin ? ("" + data.participant_pin + "") : null;
    data.conf_ext = data.conf_ext ? ("" + data.conf_ext + "") : null;

    // console.log(knex.raw("Call pbx_getConferenceByFilters(" + req.body.id + "," + data.name + "," + data.admin_pin + "," + data.participant_pin + "," + data.conf_ext + "," + start_date + "," + end_date + ")").toString())

    knex.raw("Call pbx_getConferenceByFilters(" + req.body.id + "," + data.name + "," + data.admin_pin + "," + data.participant_pin + "," + data.conf_ext + "," + start_date + "," + end_date + ")")
        .then((response) => {
            knex.raw("Call pbx_getConferenceByFiltersForRange(" + req.body.id + "," + data.name + "," + data.admin_pin + "," + data.participant_pin + "," + data.conf_ext + "," + start_date + "," + end_date + ")")
             .then((response2) => {
                let arr = [...response[0][0], ...response2[0][0]];
                let uniqArray = [...new Set(arr.map(({ id }) => id))].map(e => arr.find(({ id }) => id == e));
                res.send({ response: uniqArray });
            }).catch((err) => {
                res.send({ response: { code: err.errno, message: err.sqlMessage } });
            });
            // if (response) {
            //     res.send({ response: response[0][0] });
            // }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function deleteConference(req, res) {
    knex.raw("Call pbx_delete_conference(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });

}


function getTotalConference(req, res) {
    let customerId = parseInt(req.query.customerId);
    knex(table.tbl_PBX_conference).count('id as count').where('status', '=', "1").andWhere('customer_id', '=', "" + customerId + "")
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getConferenceCount(req, res) {
    let conf_id = req.query.conference_id;
    let conf_feature_type = '3';
    knex.raw("Call pbx_get_feature_mapping(" + conf_id + ",'" + conf_feature_type + "')")
    .then((response) => {
        if (response) {
            res.send(response[0][0][0]);
        }
    }).catch((err) => {
        res.send({ code: err.errno, message: err.sqlMessage });
    });

    // var conf_id = req.query.conference_id;
    //     var countQuery = knex.select(knex.raw('COUNT(dd.customer_id) as conference_count'))
    //         .from(table.tbl_DID_Destination + ' as dd')
    //         .where('dd.destination_id', conf_id);

    // countQuery.then((response) => {
    //     if (response) {
    //         res.json({
    //             response
    //         });
    //     } else {
    //         res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
    //     }
    // }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


module.exports = {
    createConference, viewConference, getConferenceByFilters, deleteConference, getTotalConference, getConferenceCount
}
