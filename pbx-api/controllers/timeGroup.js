const config = require('../config/app');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');
/**
* Returns jwt token if valid email and password is provided
* @param req
* @param res
* @returns {*}
*/


function createTimeGroup(req, res) {
    // console.log(req.body.timeGroup);
    let date = req.body.timeGroup.month_day_start_finish;
    let mStartDay = date[0].split('T')[0];
    let mFinishDay = date[1].split('T')[0];
    // console.log('mFinishDay=', mFinishDay);
    // console.log('mStartDay=', mStartDay);
    let month_start_day = moment(mStartDay).format('DD/MM/YYYY');
    let month_finish_day = moment(mFinishDay).format('DD/MM/YYYY');
    let month_start = moment(month_start_day, 'YYYY-MM-DD').format('MM');
    let month_finish = moment(month_finish_day, 'YYYY-MM-DD').format('MM');
    req.body.timeGroup.customer_id = req.body.timeGroup.customer_id ? req.body.timeGroup.customer_id : null;
    req.body.timeGroup.extension_id = req.body.timeGroup.extension_id ? req.body.timeGroup.extension_id : 0;

    let holiday = '';
    if (!req.body.timeGroup.holidays || req.body.timeGroup.holidays == '0' || req.body.timeGroup.holidays == false || req.body.timeGroup.holidays == '') {
        holiday = '0';
    } else if (req.body.timeGroup.holidays == '1' || req.body.timeGroup.holidays == true || req.body.timeGroup.holidays != '') {
        holiday = '1';
    }

    if(!req.body.timeGroup.prompt){
        req.body.timeGroup.prompt = 0;
    }

    let description = '';
    if (!req.body.timeGroup.description) {
        description = '';
    } else if (req.body.timeGroup.description) {
        description = req.body.timeGroup.description;
    }

    let schedule_weekly_custom = '';
    if (req.body.timeGroup.schedule_weekly_custom) {
        schedule_weekly_custom = req.body.timeGroup.schedule_weekly_custom;
    } else {
        schedule_weekly_custom = '';
    }

  

    let failover_destination = '';
    if (!req.body.timeGroup.failover_destination || req.body.timeGroup.failover_destination == '0' || req.body.timeGroup.failover_destination == false || req.body.timeGroup.failover_destination == '') {
        failover_destination = '0';
    } else if (req.body.timeGroup.failover_destination == '1' || req.body.timeGroup.failover_destination == true || req.body.timeGroup.failover_destination != '') { 
        failover_destination = '1';
    }
   

    console.log( knex.raw("Call pbx_save_timegroup(" + req.body.timeGroup.id + "," + req.body.timeGroup.customer_id + "," + req.body.timeGroup.extension_id + ","+ req.body.timeGroup.prompt +",'" + req.body.timeGroup.name + "',\
    '" + description + "','" + req.body.timeGroup.time_start + "','" + req.body.timeGroup.time_finish + "','" + mStartDay + "','" + mFinishDay + "','" + month_start + "',\
    '" + month_finish + "','" + req.body.timeGroup.sch_duration + "','" + req.body.timeGroup.sch_weekly + "','" + schedule_weekly_custom + "','" + holiday + "'," + req.body.timeGroup.role + ",'1','" + failover_destination + "','" + req.body.timeGroup.active_feature + "','" + req.body.timeGroup.active_feature_value + "')").toString()
    )
    if (!req.body.timeGroup.id) {
        knex.raw("Call pbx_save_timegroup(" + req.body.timeGroup.id + "," + req.body.timeGroup.customer_id + "," + req.body.timeGroup.extension_id + ","+ req.body.timeGroup.prompt +",'" + req.body.timeGroup.name + "',\
                    '" + description + "','" + req.body.timeGroup.time_start + "','" + req.body.timeGroup.time_finish + "','" + mStartDay + "','" + mFinishDay + "','" + month_start + "',\
                    '" + month_finish + "','" + req.body.timeGroup.sch_duration + "','" + req.body.timeGroup.sch_weekly + "','" + schedule_weekly_custom + "','" + holiday + "'," + req.body.timeGroup.role + ",'1','" + failover_destination + "','" + req.body.timeGroup.active_feature + "','" + req.body.timeGroup.active_feature_value + "')")
            .then((response) => {
                if (response) {
                    res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
                }
            }).catch((err) => {
                res.send({ code: err.errno, message: err.sqlMessage });
            });
    } 
    else {
        knex.from(table.tbl_Time_Group).where('id', '=', "" + req.body.timeGroup.id + "")
            .select('month_start_day', 'month_finish_day', knex.raw('DATE_FORMAT(time_start, "%H:%i") as time_start'),
                knex.raw('DATE_FORMAT(time_finish, "%H:%i") as time_finish'))
            .then((response) => {
                if (response.length > 0) {
                    let tm = Object.values(JSON.parse(JSON.stringify(response)));
                    let monthStartDay = tm[0].month_start_day;
                    // console.log('monthStartDay',monthStartDay);
                    let monthFinishDay = tm[0].month_finish_day;
                    // console.log('monthFinishDay',monthFinishDay);
                    let date = req.body.timeGroup.month_day_start_finish;
                    let mStartDay = date[0];
                    // console.log('mStartDay',mStartDay);
                    let mFinishDay = date[1];
                    // console.log('mFinishDay',mFinishDay);
                    let month_start_day = "";
                    if (monthStartDay == mStartDay || mStartDay.length == 1) {
                        month_start_day = monthStartDay.split('T')[0];                        
                    } else {
                        month_start_day = date[0].split('T')[0];
                        // month_start_day = moment(mStartDay).format('DD/MM/YYYY');
                    }
                    let d = new Date(month_start_day);
                        var oneDayFromNow = d.setDate(d.getDate() + 1);
                        oneDayFromNow = new Date(oneDayFromNow).toISOString();
                        month_start_day = oneDayFromNow.split('T')[0];

                    let month_finish_day = "";
                    if (monthFinishDay == mFinishDay || mFinishDay.length == 1) {
                        month_finish_day = monthFinishDay.split('T')[0];                        
                    } else {
                        month_finish_day = date[1].split('T')[0];
                        // month_finish_day = moment(mFinishDay).format('DD/MM/YYYY');
                    }
                    let d1 = new Date(month_finish_day);
                    var oneDayFromNow = d1.setDate(d1.getDate() + 1);
                    oneDayFromNow = new Date(oneDayFromNow).toISOString();
                    month_finish_day = oneDayFromNow.split('T')[0];

                    let month_start = moment(month_start_day, 'YYYY-MM-DD').format('MM');
                    let month_finish = moment(month_finish_day, 'YYYY-MM-DD').format('MM');
//                     console.log('month_start_day', month_start_day);
//                     console.log('month_finish_day', month_finish_day);
//                     console.log(knex.raw("Call pbx_save_timegroup(" + req.body.timeGroup.id + "," + req.body.timeGroup.customer_id + "," + req.body.timeGroup.extension_id + ",'" + req.body.timeGroup.name + "',\
// '" + description + "','" + req.body.timeGroup.time_start + "','" + req.body.timeGroup.time_finish + "','" + month_start_day + "','" + month_finish_day + "','" + month_start + "',\
// '" + month_finish + "','" + req.body.timeGroup.sch_duration + "','" + req.body.timeGroup.sch_weekly + "','" + schedule_weekly_custom + "','" + holiday + "'," + req.body.timeGroup.role + ",'1')").toString()
//                     )

                    knex.raw("Call pbx_save_timegroup(" + req.body.timeGroup.id + "," + req.body.timeGroup.customer_id + ", " + req.body.timeGroup.extension_id + ","+ req.body.timeGroup.prompt +",'" + req.body.timeGroup.name + "',\
                                    '" + description + "','" + req.body.timeGroup.time_start + "','" + req.body.timeGroup.time_finish + "','" + month_start_day + "','" + month_finish_day + "','" + month_start + "',\
                                    '" + month_finish + "','" + req.body.timeGroup.sch_duration + "','" + req.body.timeGroup.sch_weekly + "','" + schedule_weekly_custom + "','" + holiday + "'," + req.body.timeGroup.role + ",'1','" + failover_destination + "','" + req.body.timeGroup.active_feature + "','" + req.body.timeGroup.active_feature_value + "')")
                        .then((response) => {
                            if (response) {
                                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
                            }
                        }).catch((err) => {
                            res.send({ code: err.errno, message: err.sqlMessage });
                        });
                        
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}
function viewTimeGroup(req, res) {
    req.body.id = req.body.id ? req.body.id : null;
    req.body.name = req.body.name ? ("'" + req.body.name + "'") : null;
    req.body.customer_id = req.body.customer_id ? req.body.customer_id : null;

    knex.raw("Call pbx_get_timegroup(" + req.body.id + "," + req.body.name + "," + req.body.customer_id + "," + req.body.extension_id + "," + req.body.role + ")")
        .then((response) => {
            if (response) {
            // setTimeout({TimeOut:4000});
                res.send({ response: response[0][0] });
            }
        
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });

}

function getTimeGroupFilters(req, res) {
    let data = req.body.filters;
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;
    data.by_custom = data.by_custom ? ("'" + data.by_custom + "'") : null;
    let rangeFrom = data.by_range ? data.by_range[0] : null;
    let rangeTo = data.by_range ? data.by_range[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    console.log(rangeFrom)
    console.log(rangeTo)
    knex.raw("Call pbx_getTimeGroupFilters(" + req.body.id + "," + req.body.role + "," + rangeFrom + "," + rangeTo + "," + data.by_name + "," + data.by_custom + ")").then((response) => {
        knex.raw("Call pbx_getTimeGroupFilterForRange(" + req.body.id + "," + req.body.role + "," + rangeFrom + "," + rangeTo + "," + data.by_name + "," + data.by_custom + ")").then((response2) => {
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


function deleteTimeGroup(req, res) {
    knex.raw("Call pbx_delete_timegroup(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

module.exports = {
    createTimeGroup, viewTimeGroup, getTimeGroupFilters, deleteTimeGroup
};