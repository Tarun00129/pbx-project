const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');

function createAddBalance(req, res) {
    // let paymentDate =  req.body.payment_date.split('T');
    // let paymentDate1 = paymentDate[1].split('Z');
    // let datestring = paymentDate[0] + ' ' + paymentDate1[0] ; // just commented bcz we are getting current time 
    let paymentDate = moment(req.body.payment_date).format('YYYY-MM-DD HH:mm:ss');
    req.body.agent_commission = req.body.agent_commission ? 1 : 0;
    console.log(req.body.payment_date); 
    console.log(paymentDate); 

    knex.raw("Call pbx_save_logpayment(" + req.body.id + "," + req.body.customer_id + ",'" + paymentDate +  "'," + req.body.amount + ",\
    '" + req.body.description + "'," + req.body.agent_commission + ",'" + req.body.payment_type + "',0,0,0,0,'1')")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function viewAddBalance(req, res) {
    req.body.id = req.body.id ? req.body.id : null;
    knex.raw("Call pbx_get_addBlanace(" + req.body.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });

}

function deleteAddBalance(req, res) {
    knex.raw("Call pbx_delete_addBalance(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}


function getAddBalanceByFilters(req, res) {
    let data = req.body.filters;
    data.by_company = (data.by_company).length ? ("'" + data.by_company + "'") : null;
    data.by_paymentType = data.by_paymentType ? ("'" + data.by_paymentType + "'") : null;

    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;

    knex.raw("Call pbx_getAddBalanceByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company + "," + data.by_paymentType + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}


module.exports = {
    createAddBalance, viewAddBalance, deleteAddBalance,getAddBalanceByFilters
};