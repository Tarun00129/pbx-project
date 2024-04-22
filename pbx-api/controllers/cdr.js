const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js')
var moment = require('moment');

function getAdminCdrInfo(req, res) {
    let limit_flag = req.query.limit_flag == '1'?req.query.limit_flag:null;
    knex.raw("Call pbx_getAdminCdrInfo("+limit_flag+")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAdminCdrByFilters(req, res) {
    let data = req.body.filters;
    // data.by_company = data.by_company ? ("'" + data.by_company + "'") : null;   
    if(data.by_company){
        data.by_company = (data.by_company).length ? ("'" + data.by_company + "'") : null;
        }else{
            data.by_company = null
            }
     // let rangeFrom = data.by_date ? data.by_date[0].split('T')[0] : null;
    // let rangeTo = data.by_date ? data.by_date[1].split('T')[0] : null;
    if(data.by_callplan){
    data.by_callplan = (data.by_callplan).length ? ("'" + data.by_callplan + "'") : null;
    }else{
        data.by_callplan = null
        }
    if(data.by_buycost){
    data.by_buycost = data.by_buycost ? ("'" + data.by_buycost + "'") : null;
    }else{
        data.by_buycost = null
        }
    if(data.by_sellcost){
    data.by_sellcost = data.by_sellcost ? ("'" + data.by_sellcost + "'") : null;
    }else{
        data.by_sellcost = null
        }
    if(data.by_trunck){
    data.by_trunck = (data.by_trunck).length ? ("'" + data.by_trunck + "'") : null;
    }else{
        data.by_trunck = null
        }
    if(data.by_src){
    data.by_src = data.by_src ? ("'" + data.by_src + "'") : null;
    }else{
        data.by_src = null
        }
    if(data.by_dest){
    data.by_dest = data.by_dest ? ("'" + data.by_dest + "'") : null;
    }else{
        data.by_dest = null
        }
    if(data.by_destination){
    data.by_destination = (data.by_destination).length ? ("'" + data.by_destination + "'") : null;
    }else{
        data.by_destination = null
        }
    if(data.by_callerid){
    data.by_callerid = data.by_callerid ? ("'" + data.by_callerid + "'") : null;
    }else{
        data.by_callerid = null
        }
    if(data.by_terminatecause){
    data.by_terminatecause = data.by_terminatecause ? ("'" + data.by_terminatecause + "'") : null;
    }else{
        data.by_terminatecause = null
        }
    // rangeFrom = rangeFrom ? '"' + rangeFrom + '"' : null;
    // rangeTo = rangeTo ? '"' + rangeTo + '"' : null;
    if(data.by_circle){
    data.by_circle = (data.by_circle).length ? ("'" + data.by_circle + "'") : null;
    }else{
        data.by_circle = null
        }
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    // let managedArray = (data.by_company).map(item=> item.toString())
    if(data.by_call_type){
    data.by_call_type = data.by_call_type ? ("'" + data.by_call_type + "'") : null;
    }else{
        data.by_call_type = null
        }
    console.log(knex.raw("Call pbx_getAdminCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company + ","+ data.by_callplan +","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_trunck +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause + "," + data.by_circle + "," + data.by_call_type  +")").toString())
    knex.raw("Call pbx_getAdminCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company + ","+ data.by_callplan +","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_trunck +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause + "," + data.by_circle + "," + data.by_call_type  +")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.Message } });
    });
}

function getCustomerCdrInfo(req, res) {
    knex.raw("Call pbx_getCustomerCdrInfo(" + req.query.user_id+","+  req.query.limit_flag + ")").then((response) => {
        if (response) {
            console.log(response[0][0],"------------------response of cdr>>>>>>>>>>>>>>>>>>>>SSSSSS");
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getCustomerCdrByFilters(req, res) {
    let data = req.body.filters;
    data.by_buycost = null;
    data.by_sellcost = data.by_sellcost ? ("'" + data.by_sellcost + "'") : null;
    data.by_src = data.by_src ? ("'" + data.by_src + "'") : null;
    data.by_dest = data.by_dest ? ("'" + data.by_dest + "'") : null;
    // data.by_destination = data.by_destination ? ("'" + data.by_destination + "'") : null;
    data.by_callerid = data.by_callerid ? ("'" + data.by_callerid + "'") : null;
    terminatecause = data.by_terminatecause ? ("'" + data.by_terminatecause + "'") : null;
if(typeof terminatecause !== "object"){
    data.by_terminatecause = (data.by_terminatecause).length ? ("'" + data.by_terminatecause + "'") : null;
    }else{
        data.by_terminatecause = null
        }  
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_call_type = data.by_call_type ? ("'" + data.by_call_type + "'") : null;
    destination = data.by_destination ? data.by_destination : null;
    if(typeof destination != "object"){
    let destination_data = (data.by_destination).length ? (data.by_destination).map(item => '+'+item) : "";
    data.by_destination = destination_data ? ("'" + destination_data + "'") : null;
    }else{
        data.by_destination = null
    }

    data.page_per_size = data.page_per_size ? ("'" + data.page_per_size + "'") : null; 
    data.page_number = data.page_number ? ("'" + data.page_number + "'") : null;

  console.log( knex.raw("Call pbx_getCustomerCdrByFilters_temp(" + rangeFrom + "," + rangeTo + "," + data.customer_id + ","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause  + "," + data.by_call_type + "," + data.page_per_size + "," + data.page_number  +")").toString());
     knex.raw("Call pbx_getCustomerCdrByFilters_temp(" + rangeFrom + "," + rangeTo + "," + data.customer_id + ","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause  + "," + data.by_call_type + "," + data.page_per_size + "," + data.page_number  +")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAccountManagerCdrInfo(req, res) {
    let limit_flag = req.query.limit_flag == 1 ?req.query.limit_flag:null;
    knex.raw("Call pbx_getAccountManagerCdrInfo(" + req.query.user_id+","+  req.query.limit_flag + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAccountManagerCdrByFilters(req, res) {
    let data = req.body.filters;
    console.log(req,"-------------------------");
    if(data.by_company){
        data.by_company = (data.by_company).length ? ("'" + data.by_company + "'") : null;
    }else{
        data.by_company = null;
    }  
    if(data.by_callplan){
        data.by_callplan = (data.by_callplan).length ? ("'" + data.by_callplan + "'") : null;
    }else{
        data.by_callplan = null;
    } 
    data.by_buycost =null;
    data.by_sellcost = data.by_sellcost ? ("'" + data.by_sellcost + "'") : null;
    data.by_trunck = data.by_trunck ? ("'" + data.by_trunck + "'") : null;
    data.by_src = data.by_src ? ("'" + data.by_src + "'") : null;
    data.by_dest = data.by_dest ? ("'" + data.by_dest + "'") : null;
    // data.by_destination = data.by_destination ? ("'" + data.by_destination + "'") : null;
    data.by_callerid = data.by_callerid ? ("'" + data.by_callerid + "'") : null;
    terminatecause = data.by_terminatecause ? data.by_terminatecause : null;// changed bcz when we selcet first cause which has value 0  is creating problem ...

    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_call_type = data.by_call_type ? ("'" + data.by_call_type + "'") : null;
    if(data.by_destination){
        let destination_data = (data.by_destination).length ? (data.by_destination).map(item => '+'+item) : "";
        data.by_destination = destination_data ? ("'" + destination_data + "'") : null;
    }else{
        data.by_destination = null;
    }    
   console.log('>>>>>>>>???>>>',data.by_terminatecause)
   console.log((knex.raw("Call pbx_getAccountManagerCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company + ","+ data.by_callplan +","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_trunck +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ terminatecause +","+ req.body.account_id + "," + data.by_call_type + ")").toString()));
    knex.raw("Call pbx_getAccountManagerCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company + ","+ data.by_callplan +","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_trunck +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ terminatecause +","+ req.body.account_id + "," + data.by_call_type + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getSupportCdrInfo(req, res) {
    let limit_flag = req.query.limit_flag == '1'?req.query.limit_flag:null;
    knex.raw("Call pbx_getSupportCdrInfo(" + req.query.user_id+ "," +limit_flag+ ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getSupportCdrByFilters(req, res) {
    let data = req.body.filters;       
    if(data.by_company){
    data.by_company = (data.by_company).length ? ("'" +data.by_company+ "'") : null;
    }else{
        data.by_company = null
    }
    data.by_uuid = data.by_uuid ? ("'" + data.by_uuid + "'") : null;
    // let rangeFrom = data.by_date ? data.by_date[0].split('T')[0] : null;
    // let rangeTo = data.by_date ? data.by_date[1].split('T')[0] : null;
    data.by_callplan = data.by_callplan ? ("'" + data.by_callplan + "'") : null;
    data.by_buycost = null;
    data.by_sellcost = data.by_sellcost ? ("'" + data.by_sellcost + "'") : null;
    if(data.by_trunck){
    data.by_trunck = (data.by_trunck).length ? ("'" + data.by_trunck + "'") : null;
    }else{
        data.by_trunck = null;
    }
    data.by_src = data.by_src ? ("'" + data.by_src + "'") : null;
    data.by_dest = data.by_dest ? ("'" + data.by_dest + "'") : null;
    // data.by_destination = data.by_destination ? ("'" + data.by_destination + "'") : null;
    data.by_callerid = data.by_callerid ? ("'" + data.by_callerid + "'") : null;            
    data.by_terminatecause = (data.by_terminatecause).length ? ("'" + data.by_terminatecause + "'") : null;     
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_call_type = data.by_call_type ? ("'" + data.by_call_type + "'") : null;
    
    if(data.by_destination){
        let destination_data = (data.by_destination).length ? (data.by_destination).map(item => '+'+item) : "";
        data.by_destination = destination_data ? ("'" + destination_data + "'") : null;
        }else{
            data.by_destination = null
        }

    console.log( knex.raw("Call pbx_getSupportCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company + ","+ data.by_uuid +","+ data.by_callplan +","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_trunck +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause + "," + data.by_call_type +")"))
    
    knex.raw("Call pbx_getSupportCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.by_company + ","+ data.by_uuid +","+ data.by_callplan +","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_trunck +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause + "," + data.by_call_type +")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getExtensionCdrInfo(req, res) {
    knex.raw("Call pbx_getExtensionCdrInfo(" + req.query.user_id + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getExtensionCdrByFilters(req, res) {
    let data = req.body.filters;
    data.by_company = data.by_company ? ("'" + data.by_company + "'") : null;
    // let rangeFrom = data.by_date ? data.by_date[0].split('T')[0] : null;
    // let rangeTo = data.by_date ? data.by_date[1].split('T')[0] : null;
    data.by_callcost = data.by_callcost ? ("'" + data.by_callcost + "'") : null;
    data.by_sellcost = data.by_sellcost ? ("'" + data.by_sellcost + "'") : null;
    data.by_src = data.by_src ? ("'" + data.by_src + "'") : null;
    data.by_dest = data.by_dest ? ("'" + data.by_dest + "'") : null;
   // data.by_destination = data.by_destination ? ("'" + data.by_destination + "'") : null;
    data.by_callerid = data.by_callerid ? ("'" + data.by_callerid + "'") : null;
    data.by_terminatecause = (data.by_terminatecause).length ? ("'" + data.by_terminatecause + "'") : null;

    // rangeFrom = rangeFrom ? '"' + rangeFrom + '"' : null;
    // rangeTo = rangeTo ? '"' + rangeTo + '"' : null;

    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
   
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_call_type = data.by_call_type ? ("'" + data.by_call_type + "'") : null;

    let destination_data = (data.by_destination).length ? (data.by_destination).map(item => '+' + item) : "";
    data.by_destination = destination_data ? ("'" + destination_data + "'") : null;  
    
    data.page_per_size = data.page_per_size ? ("'" + data.page_per_size + "'") : null; 
    data.page_number = data.page_number ? ("'" + data.page_number + "'") : null;
    data.uuid = data.uuid ? ("'" + data.uuid + "'") : null;

    console.log(knex.raw("Call pbx_getExtensionCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.id + ","+ data.by_callcost +","+ data.by_sellcost +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause  + "," + data.by_call_type + "," + data.page_per_size + "," + data.page_number +  "," + data.uuid +")").toString())
    // console.log(rangeTo)
    knex.raw("Call pbx_getExtensionCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.id + ","+ data.by_callcost +","+ data.by_sellcost +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause  + "," + data.by_call_type + "," + data.page_per_size + "," + data.page_number +  "," + data.uuid +")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getTerminateCause(req,res){
    knex(table.tbl_Pbx_TerminateCause).select('id', 'digit','description').orderBy('id','asc')
    .then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
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

function viewFeedback_Report(req, res) {
    knex.raw("Call pbx_getFeedbackReportInfo(" + req.query.user_id+","+  req.query.limit_flag + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getFeedback_ReportByFilters(req, res) {
    let data = req.body.filters;
    data.by_buycost = null;
    data.by_sellcost = data.by_sellcost ? ("'" + data.by_sellcost + "'") : null;
    data.by_src = data.by_src ? ("'" + data.by_src + "'") : null;
    data.by_dest = data.by_dest ? ("'" + data.by_dest + "'") : null;
    // data.by_destination = data.by_destination ? ("'" + data.by_destination + "'") : null;
    data.by_callerid = data.by_callerid ? ("'" + data.by_callerid + "'") : null;
    // data.by_terminatecause = data.by_terminatecause ? ("'" + data.by_terminatecause + "'") : null;
    data.by_terminatecause = (data.by_terminatecause).length ? ("'" + data.by_terminatecause + "'") : null;

    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_call_type = data.by_call_type ? ("'" + data.by_call_type + "'") : null;

    let destination_data = (data.by_destination).length ? (data.by_destination).map(item => '+'+item) : "";
    data.by_destination = destination_data ? ("'" + destination_data + "'") : null;

    //  knex.raw("Call pbx_getTCCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.customer_id + ","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause + ","+ data.by_tc +")").then((response) => {
        knex.raw("Call pbx_getFeebackCdrByFilters(" + rangeFrom + "," + rangeTo + "," + data.customer_id + ","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause + "," + data.by_call_type   +")").then((response) => {
            if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getCustomerStickyAgentInfo(req, res) {
    knex.raw("Call pbx_getCustomerStickyAgentInfo(" + req.query.user_id+","+  req.query.limit_flag + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getCustomerStickyAgentByFilters(req, res) {
    let data = req.body.filters;
    
    data.by_buycost = null;
    data.by_sellcost = data.by_sellcost ? ("'" + data.by_sellcost + "'") : null;
    data.by_src = data.by_src ? ("'" + data.by_src + "'") : null;
    data.by_dest = data.by_dest ? ("'" + data.by_dest + "'") : null;
    // data.by_destination = data.by_destination ? ("'" + data.by_destination + "'") : null;
    data.by_callerid = data.by_callerid ? ("'" + data.by_callerid + "'") : null;
    // data.by_terminatecause = data.by_terminatecause ? ("'" + data.by_terminatecause + "'") : null;
    data.by_terminatecause = (data.by_terminatecause).length ? ("'" + data.by_terminatecause + "'") : null;
    let rangeFrom = data.by_date ? data.by_date[0] : null;
    let rangeTo = data.by_date ? data.by_date[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null;
    data.by_call_type = data.by_call_type ? ("'" + data.by_call_type + "'") : null;

    let destination_data = (data.by_destination).length ? (data.by_destination).map(item => '+'+item) : "";
    data.by_destination = destination_data ? ("'" + destination_data + "'") : null;

    data.page_per_size = data.page_per_size ? ("'" + data.page_per_size + "'") : null; 
    data.page_number = data.page_number ? ("'" + data.page_number + "'") : null;


     knex.raw("Call pbx_getCustomerStickyAgentByFilters(" + rangeFrom + "," + rangeTo + "," + data.customer_id + ","+ data.by_buycost +","+ data.by_sellcost +","+ data.by_src +","+ data.by_dest +","+  data.by_destination +","+ data.by_callerid +","+ data.by_terminatecause  + "," + data.by_call_type + "," + data.page_per_size + "," + data.page_number  +")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}
module.exports = {
    getAdminCdrInfo, getAdminCdrByFilters, getCustomerCdrInfo, getCustomerCdrByFilters,
    getAccountManagerCdrInfo,getAccountManagerCdrByFilters,getSupportCdrInfo,getSupportCdrByFilters,
    getExtensionCdrInfo,getExtensionCdrByFilters,getTerminateCause,
    viewFeedback_Report, getFeedback_ReportByFilters, getCustomerStickyAgentInfo, getCustomerStickyAgentByFilters
};