const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');
const { response } = require('express');


function viewCallDateHourWise(req, res) {
    knex.raw("Call pbx_get_calls_date_hour_wise()")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}


function getCallDateHourWiseByFilters(req, res) {
    let data = req.body.filters;
    let rangeFrom = data.by_range ? data.by_range[0] : null;
    let rangeTo = data.by_range ? data.by_range[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_company = (data.by_company).length ? ("'" + data.by_company + "'") : null;
     console.log(knex.raw("Call pbx_getCallsDateHourWiseByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company  +")").toString())
     knex.raw("Call pbx_getCallsDateHourWiseByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company  +")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function viewCallChargesDateWise(req, res) {
    knex.raw("Call pbx_get_calls_charge_date_wise()")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getCallChargesDateWiseByFilters(req, res) {
    let data = req.body.filters;
    let rangeFrom = data.by_range ? data.by_range[0] : null;
    let rangeTo = data.by_range ? data.by_range[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_company = (data.by_company).length ? ("'" + data.by_company + "'") : null;
     console.log(knex.raw("Call pbx_getCallChargesDateWiseByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company  +")").toString())
     knex.raw("Call pbx_getCallChargesDateWiseByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company  +")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function viewCustomersChargesDateWise(req, res) {
    knex.raw("Call pbx_get_customers_charge_date_wise()")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getCustomersChargesDateWiseByFilters(req, res) {
    let data = req.body.filters;
    let rangeFrom = data.by_range ? data.by_range[0] : null;
    let rangeTo = data.by_range ? data.by_range[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_company = (data.by_company).length ? ("'" + data.by_company + "'") : null;
     console.log(knex.raw("Call pbx_getCustomersChargesDateWiseByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company  +")").toString())
     knex.raw("Call pbx_getCustomersChargesDateWiseByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company  +")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function viewCustomersCallDetails(req, res) {
    knex.raw("Call pbx_get_customers_call_details()")  //call_type session_time
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getCustomersCallDetailsByFilters(req, res) {
    let data = req.body.filters;
    let rangeFrom = data.by_range ? data.by_range[0] : null;
    let rangeTo = data.by_range ? data.by_range[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_company = (data.by_company).length ? ("'" + data.by_company + "'") : null;
     console.log(knex.raw("Call pbx_getCustomersCallDetailsByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company  +")").toString())
     knex.raw("Call pbx_getCustomersCallDetailsByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company  +")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function viewProvidersCallChargesDateWise(req, res) {
    knex.raw("Call pbx_get_providers_calls_charge_date_wise()")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getProvidersCallChargesDateWiseByFilters(req, res) {
    let data = req.body.filters;
    let rangeFrom = data.by_range ? data.by_range[0] : null;
    let rangeTo = data.by_range ? data.by_range[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_provider = (data.by_provider).length ? ("'" + data.by_provider + "'") : null;
    console.log(knex.raw("Call pbx_getProvidersCallChargesDateWiseByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_provider  +")").toString())
    knex.raw("Call pbx_getProvidersCallChargesDateWiseByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_provider  +")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getMinutePlanCallDetails(req,res){
    knex.raw("call pbx_getMinutePlanCallD(0)")
    .then((response =>{
        if(response){
            console.log(response[0][0]);
            res.send ({response: response[0][0]});
        }
    })).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getMinutePlanCallDetailsByFilters(req,res){
    let data = req.body.filters;
    console.log(data);
    console.log(data.by_forward,"ffffffffffffffffffffffffffffffffffffffff");
    data.by_plan_type = data.by_plan_type ? ("'" + data.by_plan_type + "'") : null;
      // data.by_company = data.by_company ? ("'" + data.by_company + "'") : null;
      data.by_company = (data.by_company).length ? ("'" + data.by_company + "'") : null;
      // let rangeFrom = data.by_date ? data.by_date[0].split('T')[0] : null;
      // let rangeTo = data.by_date ? data.by_date[1].split('T')[0] : null;
      data.by_callplan = (data.by_callplan).length ? ("'" + data.by_callplan + "'") : null;
      data.by_buycost = data.by_buycost ? ("'" + data.by_buycost + "'") : null;
      data.by_forward = data.by_forward ? ("'" + data.by_forward + "'") : null;
      data.by_sellcost = data.by_sellcost ? ("'" + data.by_sellcost + "'") : null;
      data.by_trunck = (data.by_trunck).length ? ("'" + data.by_trunck + "'") : null;
      data.by_src = data.by_src ? ("'" + data.by_src + "'") : null;
      data.by_dest = data.by_dest ? ("'" + data.by_dest + "'") : null;
      data.by_destination = (data.by_destination).length ? ("'" + data.by_destination + "'") : null;
      data.by_callerid = data.by_callerid ? ("'" + data.by_callerid + "'") : null;
      data.by_terminatecause = data.by_terminatecause ? ("'" + data.by_terminatecause + "'") : null;
      // rangeFrom = rangeFrom ? '"' + rangeFrom + '"' : null;
      // rangeTo = rangeTo ? '"' + rangeTo + '"' : null;
      data.by_circle = (data.by_circle).length ? ("'" + data.by_circle + "'") : null;
      let rangeFrom = data.by_date ? data.by_date[0] : null;
      let rangeTo = data.by_date ? data.by_date[1] : null;
      rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
      rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
      // let managedArray = (data.by_company).map(item=> item.toString())
  
      data.by_call_type = data.by_call_type ? ("'" + data.by_call_type + "'") : null;
  
      console.log(knex.raw("Call pbx_getMinutePlanCallDetailByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company + "," + data.by_plan_type + ","+ data.by_callplan +","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_trunck +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause + "," + data.by_circle + "," + data.by_call_type  +"," + data.by_forward  +")").toString())
      knex.raw("Call pbx_getMinutePlanCallDetailByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company + "," + data.by_plan_type + ","+ data.by_callplan +","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_trunck +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause + "," + data.by_circle + "," + data.by_call_type  +"," + data.by_forward  +")")
      .then((response) => {
          if (response) {
            console.log(response[0][0]);

              res.send({ response: response[0][0] });
          }
      }).catch((err) => {
          res.send({ response: { code: err.Message } });
      });

}
module.exports = {
    viewCallDateHourWise,getCallDateHourWiseByFilters, viewCallChargesDateWise, getCallChargesDateWiseByFilters,
    viewCustomersChargesDateWise, getCustomersChargesDateWiseByFilters, viewCustomersCallDetails,getCustomersCallDetailsByFilters,
    viewProvidersCallChargesDateWise, getProvidersCallChargesDateWiseByFilters,getMinutePlanCallDetails,getMinutePlanCallDetailsByFilters
}