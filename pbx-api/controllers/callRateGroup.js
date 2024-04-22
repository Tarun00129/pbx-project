const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const requestIP = require('request-ip');

function createCallRateGroup(req, res) {
    console.log(req.body);
    console.log(   knex.raw("Call pbx_save_callrategroup(" + req.body.callRateGroup.id + ",'" + req.body.callRateGroup.name + "'," + req.body.callRateGroup.minutes + ")").toString())
    knex.raw("Call pbx_save_callrategroup(" + req.body.callRateGroup.id + ",'" + req.body.callRateGroup.name + "'," + req.body.callRateGroup.minutes + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function viewCallRateGroup(req, res) {
    knex.raw("Call pbx_get_callrategroup()")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getCallRateGroupByFilters(req, res) {
    let data = req.body.filters;
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;
    data.by_minute = data.by_minute ? ("" + data.by_minute + "") : null;
    console.log(knex.raw("Call pbx_getCallRateGroupByFilters(" + data.by_name + "," + data.by_minute + ")").toString());
    knex.raw("Call pbx_getCallRateGroupByFilters(" + data.by_name + "," + data.by_minute + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });

}

function getAllRatesFromGroup(req, res) {
    let groupId = parseInt(req.query.id);
    console.log('groupId',groupId)
    console.log(knex.raw("Call pbx_getAssociateCallRateFromGroup(" + groupId + ")").toString());
    knex.raw("Call pbx_getAssociateCallRateFromGroup(" + groupId + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}
function ViewgetCallRateGroup(req,res){
    console.log("requesttttttt",req.body);
let data =req.body.id;
console.log(data,'viewcallgroppppppdata');
let sql = knex(table.tbl_pbx_call_rate_group)
        .select('*')
        .where('id','like',data);
        console.log(sql.toString());
sql.then((response)=>{    
    res.send({
        response : response[0]
    })
})
}

function getAssociateCallRates(req, res) {    
    let data = req.body.data;        
    data.id = data.id ? data.id : null;
    data.by_call_plan = data.by_call_plan ? data.by_call_plan.length ? "'" +data.by_call_plan+ "'" : null : null;
    data.by_gateway = data.by_gateway ? data.by_gateway.length ? "'" +data.by_gateway+ "'" : null : null;
    data.by_country = data.by_country ? data.by_country.length ? "'" +data.by_country+ "'" : null : null;
    data.by_provider = data.by_provider ? data.by_provider.length ? "'" +data.by_provider+ "'" : null : null; 
             
    let sql = knex.raw("call pbx_associate_callRatesIn_Group("+ data.id +","+ data.by_call_plan +","+ data.by_gateway +","+ data.by_country +","+ data.by_provider +")");        
    sql.then((response) => {        
        if(response) {
            res.send({
                response: response[0][0]
            })
        }
    })                
}

module.exports = {
    createCallRateGroup, viewCallRateGroup, getCallRateGroupByFilters, getAllRatesFromGroup,ViewgetCallRateGroup, getAssociateCallRates
}