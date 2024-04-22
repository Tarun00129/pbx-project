const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');

function viewAllInvoice(req, res) {
    req.query.id = req.query.id ? req.query.id : null;
    knex.raw("Call pbx_get_invoice(" + req.query.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
                console.log(response[0][0]);
            }
        });
}


function getInvoiceDetail(req, res) {
    req.body.id = req.query.id;

    // console.log(knex.raw("Call pbx_get_callplan(" + req.body.id + "," + req.body.name + ")").toString());

    knex.raw("Call pbx_get_invoice_item(" + req.query.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getInvoiceCdrDetail(req, res){
    knex.raw("Call pbx_get_cdr_records_by_customer(" + req.query.id + ")")
    .then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAllInvoicesOfCustomer(req, res){
    req.query.id = req.query.id ? req.query.id : null;
    knex.raw("Call pbx_get_customer_invoice(" + req.query.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getAllInvoicesOfManagerCustomer(req, res){
    req.query.id = req.query.id ? req.query.id : null;
    knex.raw("Call pbx_get_manager_customer_invoice(" + req.query.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getInvoicesOfManagerCustomerByFilters(req, res) {
    let data = req.body.filters;
    data.by_company = (data.by_company).length ? ("'" + data.by_company + "'") : null;
    data.reference_num = data.reference_num  ? ("'" + data.reference_num + "'") : null;
    data.by_country = data.by_country  ? ("'" + data.by_country + "'") : null;
    data.paid_status = data.paid_status  ? ("'" + data.paid_status + "'") : null;
    data.customer_status = data.customer_status  ? ("'" + data.customer_status + "'") : null;
    data.amount = data.amount ? ("'" + data.amount + "'") : null;
    data.by_product = data.by_product ? ("'" + data.by_product + "'") : null;
    data.account_manager_id = data.account_manager_id ? ("'" + data.account_manager_id + "'") : null;

    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    console.log(rangeFrom)
    console.log(rangeTo)
    knex.raw("Call getAccountManagerInvoiceByFilter(" + rangeFrom + "," + rangeTo + "," + data.paid_status + ", " + data.by_company + ", " + data.by_country + ", " + data.reference_num+", " + data.amount + ", " + data.by_product + ", " + data.account_manager_id + "," + data.customer_status + ")").then((response) => {
        if (response) {
            // console.log(response);
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        // console.log(err);
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
} 

function getInvoiceByFilters(req, res) {
    let data = req.body.filters;
    // data.by_company = data.by_company  ? ("'" + data.by_company + "'") : null;
    data.by_company = (data.by_company).length ? ("'" + data.by_company + "'") : null;
    // let rangeFrom = data.by_date  ? data.by_date[0].split('T')[0] : null;
    // let rangeTo = data.by_date  ? data.by_date[1].split('T')[0] : null;
    data.reference_num = data.reference_num  ? ("'" + data.reference_num + "'") : null;
    data.by_country = data.by_country  ? ("'" + data.by_country + "'") : null;
    data.paid_status = data.paid_status  ? ("'" + data.paid_status + "'") : null;
    data.customer_status = data.customer_status  ? ("'" + data.customer_status + "'") : null;
    data.amount = data.amount ? ("'" + data.amount + "'") : null;
    data.by_product = data.by_product ? ("'" + data.by_product + "'") : null;
    data.customer_id = data.customer_id ? ("'" + data.customer_id + "'") : null;
    let start_date = data.by_date ? data.by_date[0] : null;
    let end_date = data.by_date ? data.by_date[1] : null;
    rangeFrom = start_date ? ("'" + moment(start_date).format('YYYY-MM-DD') + "'") : null;
    rangeTo = end_date ? ("'" + moment(end_date).format('YYYY-MM-DD') + "'") : null;

    knex.raw("Call getInvoiceFilter(" + rangeFrom + "," + rangeTo + "," + data.paid_status + ", " + data.by_company + ", " + data.by_country + ", " + data.reference_num+", " + data.amount + ", " + data.by_product + ", " + data.customer_id + "," + data.customer_status + ")").then((response) => {
        if (response) {
            // console.log(response);
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        // console.log(err);
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

module.exports = { viewAllInvoice, getInvoiceDetail, getInvoiceCdrDetail, getInvoicesOfManagerCustomerByFilters, getInvoiceByFilters, getAllInvoicesOfCustomer, getAllInvoicesOfManagerCustomer }
