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


function createHoliday(req, res) {
    // console.log(req.body);
    let date = req.body.holiday.date;
    let start_time = '';
    let end_time = '';
    let fullDay = '0';
    if (!req.body.holiday.fullDay || req.body.holiday.fullDay == '0' || req.body.holiday.fullDay == false || req.body.holiday.fullDay == '' || req.body.holiday.fullDay == 0) {
        fullDay = '0';
        start_time = req.body.holiday.start_time;
        end_time = req.body.holiday.end_time;

    } else if (req.body.holiday.fullDay == '1' || req.body.holiday.fullDay == true || req.body.holiday.fullDay != '' || req.body.holiday.fullDay == 1) {
        fullDay = '1';
        start_time = "00:00";
        end_time = "00:00";
    }

    if (!req.body.holiday.id) {
        let holidayDate = moment(date).format('YYYY-MM-DD');
//         console.log(knex.raw("Call pbx_save_holiday(" + req.body.holiday.id + ",'" + req.body.holiday.holiday + "','" + holidayDate + "','" + fullDay + "',\
// '" + start_time + "','" + end_time + "','1', " + req.body.holiday.customer_id + ")").toString());

        knex.raw("Call pbx_save_holiday(" + req.body.holiday.id + ",'" + req.body.holiday.holiday + "','" + holidayDate + "','" + fullDay + "',\
    '" + start_time + "','" + end_time + "','1', " + req.body.holiday.customer_id + ")")
            .then((response) => {
                if (response) {
                    res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
                }
            }).catch((err) => {
                res.send({ code: err.errno, message: err.sqlMessage });
            });

    } else {
        let holidayDate = "";
        let gettingDate = moment(date).format('YYYY-MM-DD');
        if (gettingDate == "Invalid date") {
            holidayDate = date;
        } else {
            holidayDate = moment(date).format('YYYY-MM-DD');
        }

        knex.raw("Call pbx_save_holiday(" + req.body.holiday.id + ",'" + req.body.holiday.holiday + "','" + holidayDate + "','" + fullDay + "',\
                    '" + start_time + "','" + end_time + "','1', " + req.body.holiday.customer_id + ")")
            .then((response) => {
                if (response) {
                    res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
                }
            }).catch((err) => {
                res.send({ code: err.errno, message: err.sqlMessage });
            });
    }
}

function createHolidayFromExcel(req, res) {
    
     for(let i=0; i<req.body.holiday.length; i++){
         req.body.holiday[i]['holiday'] =req.body.holiday[i]['Holiday'];
         let darr = (req.body.holiday[i]['Date']).split("/"); 
         let dobj = new Date(parseInt(darr[2]),parseInt(darr[1])-1,parseInt(darr[0]));
         req.body.holiday[i]['date'] = (dobj).toISOString();
         req.body.holiday[i]['start_time'] =req.body.holiday[i]['Start Time'];
         req.body.holiday[i]['end_time'] =req.body.holiday[i]['End Time'];
         req.body.holiday[i]['fullDay'] = (req.body.holiday[i]['Full Day'] == 'On'  || req.body.holiday[i]['Full Day'] == 'on'|| req.body.holiday[i]['Full Day'] == 'ON') ? '1':'0';
         req.body.holiday[i]['customer_id'] = req.body.customer_id;
         req.body.holiday[i].id = null; 
         delete req.body.holiday[i]['Holiday'];
         delete req.body.holiday[i]['Date'];
         delete req.body.holiday[i]['Start Time'];
         delete req.body.holiday[i]['End Time'];
         delete req.body.holiday[i]['Full Day'];
       //  console.log(req.body.holiday)

         let date = req.body.holiday[i].date;
         let start_time = '';
         let end_time = '';
         let fullDay = '0';
         if (!req.body.holiday[i].fullDay || req.body.holiday[i].fullDay == '0' || req.body.holiday[i].fullDay == false || req.body.holiday[i].fullDay == '' || req.body.holiday[i].fullDay == 0) {
             fullDay = '0';
             start_time = req.body.holiday[i].start_time;
             end_time = req.body.holiday[i].end_time;

         } else if (req.body.holiday[i].fullDay == '1' || req.body.holiday[i].fullDay == true || req.body.holiday[i].fullDay != '' || req.body.holiday[i].fullDay == 1) {
             fullDay = '1';
             start_time = "00:00";
             end_time = "00:00";
         }

         let holidayDate = "";
         let gettingDate = moment(date).format('YYYY-MM-DD');
         if (gettingDate == "Invalid date") {
             holidayDate = date;
         } else {
             holidayDate = moment(date).format('YYYY-MM-DD');
         }
         console.log( req.body.holiday[i].id + ",'" + req.body.holiday[i].holiday + "','" + holidayDate + "','" + fullDay + "',\
         '" + start_time + "','" + end_time + "','1', " + req.body.holiday[i].customer_id );



         knex.raw("Call pbx_save_holiday(" + req.body.holiday[i].id + ",'" + req.body.holiday[i].holiday + "','" + holidayDate + "','" + fullDay + "',\
                    '" + start_time + "','" + end_time + "','1', " + req.body.holiday[i].customer_id + ")")
             .then((response) => {
                 if (response) {
                     res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
                 }
             }).catch((err) => {
                 res.send({ code: err.errno, message: err.sqlMessage });
             });
             
      }
   
}

function viewHoliday(req, res) {
    // console.log(req.body);
    req.body.id = req.body.id ? req.body.id : null;
    req.body.holiday = req.body.holiday ? ("'" + req.body.holiday + "'") : null;
    let data = req.body.date;
    let holidayDate = '';
    if (data) {
        holidayDate = data;
        holidayDate = moment(holidayDate).format('YYYY-MM-DD');
    } else {
        holidayDate = null;
    }

    holidayDate = holidayDate ? ("'" + holidayDate + "'") : null;

    // console.log( knex.raw("Call pbx_get_holiday(" + req.body.id + "," + req.body.holiday + " ," + holidayDate + ", " + req.body.customer_id + ")").toString());

    knex.raw("Call pbx_get_holiday(" + req.body.id + "," + req.body.holiday + " ," + holidayDate + ", " + req.body.customer_id + "," + req.body.role + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}


function deleteHoliday(req, res) {
    knex.raw("Call pbx_delete_holiday(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}


function getHolidayFilters(req, res) {
    let data = req.body.filters;
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;
    let start_date = data.by_range ? data.by_range[0] : null;
    let end_date = data.by_range ? data.by_range[1] : null;
   
    start_date = start_date ? ("'" + moment(start_date).format('YYYY-MM-DD') + "'") : null;
    end_date = end_date ? ("'" + moment(end_date).format('YYYY-MM-DD') + "'") : null;
 

     console.log(  knex.raw("Call pbx_getHolidayFilters(" + data.by_name + "," + start_date + ", " + end_date +"," + data.customer_id +")").toString());

    knex.raw("Call pbx_getHolidayFilters(" + data.by_name + "," + start_date + ","+ end_date +", " + data.customer_id + ","+ data.role +")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}


module.exports = {
    createHoliday, viewHoliday, deleteHoliday, getHolidayFilters, createHolidayFromExcel
};