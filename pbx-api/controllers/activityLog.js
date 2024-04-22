const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');

function getActivityLog(req, res) {
    knex.raw("Call pbx_getActivityLog(" + req.query.user_type + "," + req.query.user_id + ")").then((response) => {
        console.log(response[0][0],"-----------------response");
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getActivityLogByFilter(req, res) {
    let data = req.body.filters;
    data.by_ip = data.by_ip ? ("'" + data.by_ip + "'") : null; 
    data.by_username = data.by_username ? ("'" + data.by_username + "'") : null;
    // let byDate = data.by_date ? moment(data.by_date).format('YYYY-MM-DD') : null;
    user_type = req.body.user_type ? ("'" + req.body.user_type + "'") : null;
    user_id = req.body.user_id ? ("'" + req.body.user_id + "'") : null;
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_logs = data.by_logs ? ("'" + data.by_logs + "'") : null;

    knex.raw("Call pbx_getActivityLogByFilter(" + data.by_ip + "," + data.by_username + ", " + rangeFrom + "," + rangeTo  + ", "+user_type+", "+user_id   + "," + data.by_logs +")").then((response) => {
       
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
       // console.log("data.by_date", byDate);
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAllBackendAPILog(req, res) {
    let sql = knex.from(table.tbl_api_logs + ' as l')
        .select('l.*','c.company_name',knex.raw('DATE_FORMAT(l.created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
        knex.raw('IF (l.application = "pbx","Web User",IF (l.application = "sp","Mobile",IF (l.application = "crm","CRM",""))) AS application'))
        .leftJoin(table.tbl_Customer + ' as c', 'c.id','l.customer_id');
    sql.orderBy('id','desc')
    sql.then((response) => {        
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getAllBackendAPILogByFilter(req, res) {
    let data = req.body.filters;
    data.by_username = data.by_username ? ("'" + data.by_username + "'") : null;
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_responsecode = data.by_responsecode ? ("'" + data.by_responsecode + "'") : null;
  console.log(knex.raw("Call pbx_getBackendAPILogByFilter(" + data.by_username + ", " + rangeFrom + "," + rangeTo + "," + data.by_responsecode +")").toString());
    knex.raw("Call pbx_getBackendAPILogByFilter(" + data.by_username + ", " + rangeFrom + "," + rangeTo + "," + data.by_responsecode +")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
       // console.log("data.by_date", byDate);
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}


// api for dialog
function auditbyId(req,res) {
    let id = req.query.id;
    let sql = knex(table.tbl_api_logs).where('id',id).select('params');
    sql.then((response)=>{    
        res.send({
            status_code : 200,
            data : response[0]['params']
        });
    })
}
function getC2CStatus(req, res) {
    let uuid = (req.query.uuid) ? req.query.uuid : 0;
    console.log(req.query);
    console.log(uuid);
    let sql = knex.from('live_calls' + ' as r')
        .select('r.uuid', 'r.destination', 'r.current_status', 'r.src','r.call_disposition',knex.raw('CONVERT(r.terminatecause,UNSIGNED INTEGER) AS terminatecause'),'c.description')
        .leftJoin(table.tbl_Pbx_TerminateCause + ' as c','c.digit','r.terminatecause')
        .where('r.uuid', '=', uuid );
        // .where('r.uuid', 'like', "%" + uuid + "%");
        console.log(sql.toQuery());
    sql.then((response) => {
        if (response) {
            res.json({
                status_code: 200,
                message: 'crc current status.',
                data: response
            });
        } else {
            res.status(201).send({ status_code: 201, message: 'No Data found' });
        }
    })
}

function getAllPackageAuditLog(req, res) {
    let sql = knex.from(table.tbl_pbx_pkg_logs + ' as l')
        .select('l.*','p.name as package_name',knex.raw('DATE_FORMAT(l.created_at, "%d/%m/%Y %H:%i:%s") as created_at'))
        .leftJoin(table.tbl_Package + ' as p','p.id','l.package_id')

    sql.orderBy('id','desc')
    sql.groupBy('p.id')
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getAllPackageAuditLogByFilter(req, res) {
    let data = req.body.filters;
    data.by_username = data.by_username ? ("'" + data.by_username + "'") : null;
    data.by_pckg = data.by_pckg ?  data.by_pckg  : null;
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
//   console.log(knex.raw("Call pbx_getPackageAuditLogByFilter(" + data.by_username + ", " + rangeFrom + "," + rangeTo + "," + data.by_responsecode +")").toString());
    knex.raw("Call pbx_getPackageAuditLogByFilter(" + rangeFrom + "," + rangeTo  + "," +  data.by_pckg + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
       // console.log("data.by_date", byDate);
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

module.exports = {
    getActivityLog, getActivityLogByFilter, getAllBackendAPILog, getAllBackendAPILogByFilter, getC2CStatus,
    getAllPackageAuditLog, getAllPackageAuditLogByFilter, auditbyId
};