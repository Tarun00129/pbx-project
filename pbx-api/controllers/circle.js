const { knex } = require('../config/knex.db');
const table = require('../config/table.macros');
var request = require('request');
let pushEmail = require('./pushEmail');
var moment = require('moment');

var headers = {
    'Accept': 'text/xml',
    'Content-Type': 'text/xml'
};

var dataString = '<?xml version=\'1.0\'?><methodCall><methodName>address_reload</methodName></methodCall>';
var options = {
    url: 'http://127.0.0.1:8000/RPC2',
    method: 'POST',
    headers: headers,
    body: dataString
};

// Add Circle 
function addCircle(req, res) {
    let body = req.body;
    let id = parseInt(req.query.id);
    let query = knex.select('cr.name').from(table.tbl_Pbx_circle + ' as cr')
        .where('cr.name', '=', body.name);
    console.log(query.toString());
    query.then((response) => {
        if (response.length == 0) {
            let sql = knex(table.tbl_Pbx_circle).insert({
                name: "" + body.name + "", description: "" + body.description + "",
            });
            console.log(sql.toString());
            sql.then((response) => {
                if (response.length > 0) {
                    res.json({
                        response: response,
                        code: 200
                    });
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        } else {
            res.json({
                response: response,
                code: 201
            });

        }


    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });


}

//show circle list 
function getcircleList(req, res) {
    var body = req.body;
    console.log(JSON.stringify(body))
    let isFilter = Object.keys(body).length == 0 ? false : true;
    let sql = knex.from(table.tbl_Pbx_circle)
        .select('id', 'name', 'description');
    // console.log(isFilter);
    if (isFilter) {
        sql.where('name', 'like', '%' + body.name + '%')
    }
    // console.log(sql.toString());
    sql.orderBy('name','asc')
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
function getblockedIP(req, res) {
    var body = req.body;
    console.log(body,'--------body--------');
    console.log(JSON.stringify(body))
    let rangeFrom = body.created_at ? body.created_at[0] : null;
    let rangeTo = body.created_at ? body.created_at[1] : null;
    rangeFrom = rangeFrom ? ("'" + moment(rangeFrom).format('YYYY-MM-DD') + "'") : null;
    rangeTo = rangeTo ? ("'" + moment(rangeTo).format('YYYY-MM-DD') + "'") : null
       
    let sql = knex.from(table.tbl_pbx_f2b_ip)
        .select('id', 'ip', (knex.raw(`Date_format(created_at,"%d-%m-%y %h:%i:%s") as created_at`)));
    // console.log(isFilter);
    if (body.ip) {
        sql.andWhere('ip', 'like', '%' + body.ip + '%')
    }
    if(body.created_at && rangeFrom != rangeTo){
        sql.andWhere(knex.raw(`DATE(created_at) >= ${rangeFrom} and DATE(created_at) <= ${rangeTo}`));
    }else if(body.created_at && rangeFrom == rangeTo){
        sql.andWhere(knex.raw(`DATE(created_at) = ${rangeFrom}`));
    }
    console.log(sql.toString());
    // sql.orderBy('name','asc')
    sql.then((response) => {
        console.log(response,'-----------getblocked IP---------');
        if (response) {
            res.json({ 
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

//search with id
function getCircleById(req, res) {
    let id = parseInt(req.query.id);
    knex.select('cr.id', 'cr.name', 'cr.description').from(table.tbl_Pbx_circle + ' as cr')
        .where('cr.id', '=', id)
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

//update circle
function updateCircle(req, res) {
    let body = req.body.circle;
    //console.log(JSON.stringify(body));

    let sql = knex(table.tbl_Pbx_circle)
        .where('name', '=', "" + body.name + "")
        .whereNot('id', body.id);
    sql.then((response) => {

        if (response.length == 0) {
            let sql = knex(table.tbl_Pbx_circle).where('id', '=', "" + body.id + "");
            delete body.id;
            sql.update(body);
            sql.then((response) => {
                res.json({
                    response: response,
                    code: 200
                });

            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        } else {
            res.json({
                response: response,
                code: 201,
                message: `Circle name already exist`
            });

        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

//Delete Circle
function deleteCircle(req, res) {
    let body = req.body.circle;

    knex.select('cp.id').from(table.tbl_Call_Plan + ' as cp')
        .where('cp.circle_id', '=', body.id)
        .then((response) => {
            if (response.length == 0) {
                let sql = knex(table.tbl_Pbx_circle).where('id', '=', "" + body.id + "")
                sql.del();
                console.log(sql.toString());
                sql.then((response) => {
                    if (response) {
                        res.json({
                            response: response,
                            code: 200
                        });
                    } else {
                        res.status(401).send({ error: 'error', message: 'DB Error' });
                    }
                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
            } else {
                res.json({
                    response: response,
                    code: 400,
                    message: 'You can not delete this circle!'
                });
            }
        });






}

function getAllCircle(req, res) {

    let sql = knex.from(table.tbl_Pbx_circle)
        .select('*')
        .orderBy('name');
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

function getAllContactFromCircle(req, res) {
    var circleId = parseInt(req.query.id);
    console.log('circleId', circleId)
    knex.select('cr.*',
        knex.raw('GROUP_CONCAT(c.first_name) as first_name'),
        knex.raw('GROUP_CONCAT(c.last_name) as last_name'),
        knex.raw('GROUP_CONCAT(c.email) as email'),
        knex.raw('GROUP_CONCAT(c.mobile) as mobile')).from(table.tbl_Pbx_circle + ' as cr')
        .leftJoin(table.tbl_PBX_features + ' as f', 'f.circle_id', 'cr.id')
        .leftJoin(table.tbl_Package + ' as pckg', 'pckg.feature_id', 'f.id')
        .leftJoin(table.tbl_Map_customer_package + ' as mpckg', 'mpckg.package_id', 'pckg.id')
        .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'mpckg.customer_id')
        .where('cr.id', circleId)
        .orderBy('cr.id', 'desc')
        .then((response) => {
            var customerInfo = response;
            knex.select('cp.name').from(table.tbl_Call_Plan + ' as cp')
                .where('cp.circle_id', circleId)
                .orderBy('cp.id', 'desc')
                .then((response2) => {
                    var callPlanInfo = response2;
                    knex.select('p.name').from(table.tbl_Package + ' as p')
                        .leftJoin(table.tbl_PBX_features + ' as f', 'p.feature_id', 'f.id')
                        .where('f.circle_id', circleId)
                        .orderBy('p.id', 'desc')
                        .then((response3) => {
                            let obj = {
                                'contactData': customerInfo,
                                'callPlanInfo': callPlanInfo,
                                'packageInfo': response3
                            }
                            res.json({
                                response: obj
                            });
                        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function createWhiteListIP(req, res) {
    // console.log(req.body);
    if(req.body.ipDetail.status == true || req.body.ipDetail.status == '1'){
        req.body.ipDetail.status = '1';
    }else{
        req.body.ipDetail.status = '0';
    }
    console.log(knex.raw("Call pbx_save_whitelist_ip(" + req.body.ipDetail.id + ",'" + req.body.ipDetail.ip + "','" +req.body.ipDetail.status + "','"+ req.body.ipDetail.description + "')").toString());
    knex.raw("Call pbx_save_whitelist_ip(" + req.body.ipDetail.id + ",'" + req.body.ipDetail.ip + "','" +req.body.ipDetail.status + "','"+ req.body.ipDetail.description + "')")
        .then((response) => {
            if (response) {
                function callback(error, response2, body) {
                    if (!error && response2.statusCode == 200) {
                        console.log(body);
                        res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT, server_message : 'Configuration has been updated.'  }); //Requested server is running
                    }else{
                        console.log(error);
                        res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT, server_message : 'Requested server is not running at port 8000'  });
                    }
                }
                request(options, callback);
                // res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT,  });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}



function viewWhiteListIPDetails(req, res) {
    // req.body.id = req.body.id ? req.body.id : null;
    req.body.by_ip = req.body.by_ip ? ("'" + req.body.by_ip + "'") : null;
    req.body.by_status = req.body.by_status ? req.body.by_status : null;
    console.log(req.body);
    knex.raw("Call pbx_get_whiteList_IP(" + req.body.by_ip + "," + req.body.by_status + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });

}

function deleteWhiteListIP(req, res) {
    knex.raw("Call pbx_delete_whitelist_ip(" + req.query[Object.keys(req.query)[0]] + ")")
    .then((response) => {
        if (response) {
            function callback(error, response2, body) {
                if (!error && response2.statusCode == 200) {
                    console.log(body);
                    res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT, server_message : 'Configuration has been updated'  });  // server is running
                }else{
                    console.log(error);
                    res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT, server_message : 'Requested server is not running at port 8000'  });
                }
            }
            request(options, callback);
            // res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
        }
    }).catch((err) => {
        res.send({ code: err.errno, message: err.sqlMessage });
    });
}

//show dialout group list 
function getDialoutGroup(req, res) {
    var body = req.body;
    let isFilter = Object.keys(body).length == 0 ? false : true;
    let sql = knex.from(table.tbl_pbx_dialout_group).select('id', 'name', 'description');
    if (isFilter) {
        sql.where('name', 'like', '%' + body.name + '%')
    }
    sql.orderBy('name','asc')
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

function createDialOutGroup(req, res) {
    // console.log(req.body);
    let id = req.body.id ? req.body.id : null;
    knex.raw("Call pbx_save_dialoutGroup(" + id + ",'" + req.body.name + "','" + req.body.description + "')")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function createDialOutRules(req, res) {
    console.log(req.body);
    let id = req.body.id ? req.body.id : null;
    let is_sign = (req.body.is_sign == true || req.body.is_sign == '1' ) ? '1' : ''; 
    req.body.prepend_digit = req.body.prepend_digit ? req.body.prepend_digit : '';
    req.body.strip_digit = req.body.strip_digit ? req.body.strip_digit : '';
    let excpt_rules = req.body.exceptional_rule = (req.body.exceptional_rule).length ? ("'" + req.body.exceptional_rule + "'") : null;
    console.log(knex.raw("Call pbx_save_dialout_rules(" + id + "," + req.body.dialout_group_id + ",'" + req.body.rule_pattern   + "','" + req.body.prepend_digit + "','" +   req.body.strip_digit + "','"  + req.body.dialout_manipulation + "','"  + req.body.blacklist_manipulation + "'," +  excpt_rules   + ")").toString());
    knex.raw("Call pbx_save_dialout_rules(" + id + "," + req.body.dialout_group_id + ",'" + req.body.rule_pattern   + "','" + req.body.prepend_digit + "','" +   req.body.strip_digit + "','"  + req.body.dialout_manipulation + "','"  + req.body.blacklist_manipulation + "'," +  excpt_rules   + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

//show dialout rule list 
function getDialoutRule(req, res) {
    var body = req.body;
    let isFilter = Object.keys(body).length == 0 ? false : true;
    let sql = knex.from(table.tbl_pbx_dialout_rule + ' as dr').select('dr.*', 'dg.name as dialout_group_name')
              .leftJoin(table.tbl_pbx_dialout_group + ' as dg', 'dg.id','dr.dialout_group_id');
    if (isFilter) {
        sql.where('dg.id',  body.dialout_group )
    }
    sql.orderBy('dr.created_at','desc')
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

//Delete DialOutGroup
function deleteDialOutGroup(req, res) {
    let body = req.body;
    console.log(body);
//    let customer_name = "";
    knex.select('c.id', 'c.first_name').from(table.tbl_Customer + ' as c')
        .where('c.dialout_group', '=', body.id)
        .then((response) => {
          //  customer_name = response[0] ? response[0]['first_name'] : '';
            if (response.length == 0) {
                knex.select('dr.id').from(table.tbl_pbx_dialout_rule + ' as dr')
                    .where('dr.dialout_group_id', '=', body.id)
                    .then((response2) => { 
                        if (response2.length == 0) {
                            let sql = knex(table.tbl_pbx_dialout_rule).where('dialout_group_id', '=', "" + body.id + "")
                            sql.del();
                            sql.then((response) => {
                                // if (response) {
                                    let sql2 = knex(table.tbl_pbx_dialout_group).where('id', '=', "" + body.id + "")
                                    sql2.del();
                                    sql2.then((response) => {
                                        res.json({
                                        message: 'Dialout group is deleted successfully !',
                                        code: 200
                                    });
                                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
                                // } else {
                                //     res.status(401).send({ error: 'error', message: 'Associated ' });
                                // }
                            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
                        } else {
                            res.json({
                                code: 400,
                                message: 'This dialout group is exist with dialout rules'
                            });
                        }
                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });;
            } else {
                res.json({
                    code: 400,
                    message: 'This dialout group is exist with customers !' 
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });;
}

function getAllContactFromDialOutGroup(req, res) {
    var dialOutGroupId = parseInt(req.query.id);
    console.log('dialOutGroupId', dialOutGroupId)
    knex.select('c.*').from(table.tbl_Customer + ' as c')
        .where('c.dialout_group', dialOutGroupId)
        .orderBy('c.id', 'desc')
        .then((response) => {
            res.json({
                response: response
            });

        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


function getAssociatedUser(req,res){
    let data = req.query.id;
    console.log(data);
    let groupID = parseInt(req.query.id);
    let sql = knex.select('c.first_name','c.last_name','c.company_name').from(table.tbl_Customer + ' as c')
    .leftJoin(table.tbl_pbx_dialout_group + ' as d','d.id','c.dialout_group')
    .where('c.dialout_group', groupID)
    console.log(sql.toString());
    sql.then((response)=>{
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

//Delete DialOutGroup
function deleteDialOutRule(req, res) {
    let body = req.body;
    console.log(body);
        let sql2 = knex(table.tbl_pbx_dialout_rule).where('id', '=', "" + body.id + "")
        sql2.del();
        sql2.then((response) => {
            if (response) {
                res.json({
                    message: 'Dialout rule is deleted successfully !',
                    code: 200
                });
            } else {
                res.json({
                    message: 'Dialout rules does`t exist !',
                    code: 400
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

module.exports = {
    addCircle, getcircleList, getCircleById, updateCircle, deleteCircle, getAllCircle,
    getAllContactFromCircle, createWhiteListIP, viewWhiteListIPDetails, deleteWhiteListIP,getblockedIP,
    getDialoutGroup, createDialOutGroup, createDialOutRules, getDialoutRule, deleteDialOutGroup, getAllContactFromDialOutGroup, deleteDialOutRule, getAssociatedUser
}
