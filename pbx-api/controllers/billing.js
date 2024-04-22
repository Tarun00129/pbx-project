const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js')
var moment = require('moment');

function getBillingInfo(req, res) {
    knex.raw("Call pbx_getBillingInfo()").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getBillingByFilters(req, res) {
    let data = req.body.filters;
    data.by_company = (data.by_company).length ? ("'" + data.by_company + "'") : null;
    data.by_number = data.by_number ? ("'" + data.by_number + "'") : null;
    data.by_country = (data.by_country).length ? ("'" + data.by_country + "'") : null;

    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
   
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;

    console.log(rangeFrom)
    console.log(rangeTo)

    // console.log(knex.raw("Call pbx_getBillingByFilters(" + rangeFrom1 + "," + rangeTo1 + "," + data.by_company + ")").toString());

    knex.raw("Call pbx_getBillingByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company + ", "+data.by_number+", "+data.by_country+")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getCustomerBillingInfo(req, res) {
    knex.raw("Call pbx_getCustomerBillingInfo(" + req.query.user_id + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getCustomerBillingByFilters(req, res) {
    let data = req.body.filters;
    data.by_company = data.by_company ? ("'" + data.by_company + "'") : null;
    // let rangeFrom = data.by_date ? data.by_date[0] : null;
    // let rangeTo = data.by_date ? data.by_date[1] : null;
    // rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    // rangeTo = rangeTo ? ("'" + moment( // if (rangeFrom) {
    //     let d = new Date(rangeFrom);
    //     var oneDayFromNow = d.setDate(d.getDate() + 1);
    //     oneDayFromNow = new Date(oneDayFromNow).toISOString();
    // }

    // if (rangeTo) {
    //     let d1 = new Date(rangeTo);
    //     var oneDayToNow = d1.setDate(d1.getDate() + 1);
    //     oneDayToNow = new Date(oneDayToNow).toISOString();
    // }
    
    // rangeFrom = rangeFrom ? '"' + oneDayFromNow.split('T')[0] + '"' : null;
    // rangeTo = rangeTo ? '"' + oneDayToNow.split('T')[0] + '"' : null;rangeTo).format('YYYY-MM-DD') + "'") : null;
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
   
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
   


    knex.raw("Call pbx_getCustomerBillingByFilters(" + rangeFrom + "," + rangeTo + "," + data.user_id + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAllBillingInfo(req, res) {
    knex.raw("Call pbx_getEBillingInfo()").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAllBillingInfoByFilters(req, res) {
    let data = req.body.filters;
    data.by_company = (data.by_company).length ? ("'" + data.by_company + "'") : null;
    data.by_invoice_number = data.by_invoice_number ? ("'" + data.by_invoice_number + "'") : null;
    data.by_status = data.by_status ? ("'" + data.by_status + "'") : null;

    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
   
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;

    console.log(rangeFrom)
    console.log(rangeTo)

    knex.raw("Call pbx_getEBillingInfoByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company + ", "+data.by_invoice_number+", "+data.by_status+")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}
module.exports = {
    getBillingInfo, getBillingByFilters, getCustomerBillingInfo, getCustomerBillingByFilters,getAllBillingInfo, getAllBillingInfoByFilters
};