const Knex = require('knex');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

function createCallPlan(req, res) {
    let type = '0';
    if (!req.body.callPlan.type || req.body.callPlan.type == '0' || req.body.callPlan.type == '') {
        type = '0';
    } else if (req.body.callPlan.type == '1') {
        type = '1';
    }
   
    if (req.body.callPlan.isCircle === true || req.body.callPlan.isCircle == '1') {
        req.body.callPlan.isCircle = '1';
    } else {
        req.body.callPlan.isCircle = '0';
    }
    if (req.body.callPlan.isMinutePlan === true || req.body.callPlan.isMinutePlan == '1') {
        req.body.callPlan.isMinutePlan = '1';
    } else {
        req.body.callPlan.isMinutePlan = '0';
    }
    if (req.body.callPlan.is_visible_customer === true || req.body.callPlan.is_visible_customer == '1') {
        req.body.callPlan.is_visible_customer = '1';
    } else {
        req.body.callPlan.is_visible_customer = '0';
    }
     console.log(knex.raw("Call pbx_save_callplan(" +req.body.callPlan.id + ",'" +  req.body.callPlan.name + "','" + type + "','" + req.body.callPlan.isCircle + "','" + req.body.callPlan.circle  + "','" +  req.body.callPlan.isMinutePlan  + "','" +  req.body.callPlan.isPlanType  + "','" + req.body.callPlan.is_visible_customer + "'," + "'1')").toString());
    knex.raw("Call pbx_save_callplan(" + req.body.callPlan.id + ",'" + req.body.callPlan.name + "','" + type + "','" + req.body.callPlan.isCircle + "','" + req.body.callPlan.circle  + "','" +  req.body.callPlan.isMinutePlan  + "','" +  req.body.callPlan.isPlanType  + "','" + req.body.callPlan.is_visible_customer + "'," + "'1')")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function viewCallPlan(req, res) {
    req.body.id = req.body.id ? req.body.id : null;
    req.body.name = req.body.name ? ("'" + req.body.name + "'") : null;
    // console.log(knex.raw("Call pbx_get_callplan(" + req.body.id + "," + req.body.name + ")").toString());

    knex.raw("Call pbx_get_callplan(" + req.body.id + "," + req.body.name + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function deleteCallPlan(req, res) {
    knex.raw("Call pbx_delete_callplan(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}



function getcallPlan(req, res) {
    knex.from(table.tbl_Call_Plan).where('status', "1").orderBy('name', 'asc')
        .select('id', 'name')
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function getCallPlanByFilter(req, res) {
    let data = req.body.filters;
    console.log('dataaaaaaa-----plan_type',data)
    data.by_type = data.by_type ? ("'" + data.by_type + "'") : null;
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;
    data.by_circle = (data.by_circle).length ? ("'" + data.by_circle + "'") : null;
    data.by_minute_plan_type = data.minute_paln_type ? ("'" + data.minute_paln_type + "'") : null;

     console.log(knex.raw("Call pbx_getCallPlanByFilter(" + data.by_type + "," + data.by_name + ")").toString());
        console.log(    knex.raw("Call pbx_getCallPlanByFilter(" + data.by_type + "," + data.by_name  + "," + data.by_circle +  "," + data.by_minute_plan_type + ")")
        )
    knex.raw("Call pbx_getCallPlanByFilter(" + data.by_type + "," + data.by_name  + "," + data.by_circle +  "," + data.by_minute_plan_type + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getCallPlanIsExist(req, res) {
    let callPlanId = req.body.id ? req.body.id : null;
    knex.from(table.tbl_Call_Plan).where('id', callPlanId)
        .select('*')
        .then((response) => {
            if (response.length > 0) {
                console.log('>>>>', response);
                knex.select('*').from(table.tbl_PBX_features)
                    .where('call_plan_id', '=', "" + callPlanId + "")
                    .then((response) => {
                        console.log('<<<<<', response);
                        let featureId = response[0].id;
                        console.log('<<<featureId<<', featureId);
                        if (response.length > 0) {
                            knex.select('*').from(table.tbl_Package)
                                .where('feature_id', featureId)
                                .then((response) => {
                                    console.log('======', response);
                                    let PackageId = response[0].id;
                                    if (response.length > 0) {
                                        knex.select('*').from(table.tbl_Map_customer_package)
                                            .where('package_id', PackageId)
                                            .then((response) => {
                                                console.log('======', response);
                                                if (response.length > 0) {
                                                    res.send({
                                                        code: 200,
                                                        msg: 'Call plan associate with customer'
                                                    });
                                                } else {
                                                    res.send({
                                                        code: 401,
                                                        msg: ''
                                                    });
                                                }
                                            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Call plan does not exist in package' }); throw err });

                                    } else {
                                        res.send({
                                            code: 401,
                                            msg: ''
                                        });
                                    }

                                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Call plan does not exist in package' }); throw err });
                        } else {
                            res.send({
                                code: 401,
                                msg: ''
                            });
                        }
                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Features not available' }); throw err });

            } else {
                res.send({
                    code: 401,
                    msg: ''
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getManagerCustomerscallPlan(req, res) {   // ----on progress --------
    let managerId = req.query.manager_id;
    var sql =  knex.select(knex.raw('DISTINCT(cp.id)'), 'cp.name')
        .from(table.tbl_Call_Plan + ' as cp')
       // .leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')

        // .leftJoin(table.tbl_Call_Plan_Rate + ' as cr', 'cr.call_plan_id', 'cp.id')
        .leftJoin(table.tbl_PBX_features + ' as f', 'f.call_plan_id', 'cp.id')
        .leftJoin(table.tbl_Package + ' as pc', 'pc.feature_id', 'f.id')
        .leftJoin(table.tbl_Product + ' as pr', 'pr.id', 'pc.product_id')
        .leftJoin(table.tbl_Map_customer_package + ' as mp', 'mp.product_id', 'pr.id')
        .leftJoin(table.tbl_Customer + ' as cus', 'cus.id', 'mp.customer_id')
        .where('cp.status', "1")
        .andWhere('cus.account_manager_id', managerId)
        .orderBy('cp.name', 'asc');

        sql.then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function deleteCallRateGroup(req, res) {
    knex.raw("Call pbx_delete_callrate_group(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

// function getCallRateGroupCount(req, res) {
//     console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
//     console.log(req.query)
//     var bc_id = req.query.callRateGroup_id;//broabcast_id: 
//         var countQuery = knex.select(knex.raw('COUNT(dd.customer_id) as broadcast_count'))
//             .from(table.tbl_DID_Destination + ' as dd')
//             .where('dd.destination_id', bc_id);
//     countQuery.then((response) => {
//         if (response) {
//             res.json({
//                 response
//             });
//         } else {
//             res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
//         }
//     }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
// }


module.exports = {
    createCallPlan, viewCallPlan,
    deleteCallPlan, getcallPlan, getCallPlanByFilter, getCallPlanIsExist, getManagerCustomerscallPlan,
    deleteCallRateGroup
};