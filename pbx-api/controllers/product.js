const { knex } = require('../config/knex.db');
const table = require('../config/table.macros');

function getproduct(req, res) {
    knex.from(table.tbl_Product).where('status', '=', "1")
        .select('id', 'name')
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getPbxPackage(req, res) {
    knex.from(table.tbl_Package).where('status', '=', "1").andWhere('product_id', '=', "1").orderBy('name', 'asc')
        .select('id', 'name')
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getPbxPackageForCustomerCreation(req, res) {
    knex.from(table.tbl_Package + ' as p')
         .select('p.id', 'p.name')
         .leftJoin(table.tbl_PBX_features + ' as f', 'f.id', 'p.feature_id')
         .where('p.status', '=', "1")
         .andWhere('p.product_id', '=', "1")
        //  .andWhere('f.minute_plan', '=', "0")
         .andWhere('p.mapped', '=', "0")
         .orderBy('p.name', 'asc')

        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}



function getPbxPackageForAccountManagerCustomers(req, res) {
    var accountManagerId = req.query.accountManagerId;
    knex.select(knex.raw('DISTINCT(p.id)'), 'p.name')
        .from(table.tbl_Package + ' as p')
        .leftJoin(table.tbl_Map_customer_package + ' as map', 'p.id', 'map.package_id')
        .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'map.customer_id')
        .where('p.product_id', '=', "1")
        .andWhere('p.status', '=', "1")
        .andWhere('c.account_manager_id', '=', "" + accountManagerId + "")
        .orderBy('name', 'asc')
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getOCPackageForAccountManagerCustomers(req, res) {
    var accountManagerId = req.query.accountManagerId;
    knex.select(knex.raw('DISTINCT(p.id)'), 'p.name')
        .from(table.tbl_Package + ' as p')
        .leftJoin(table.tbl_Map_customer_package + ' as map', 'p.id', 'map.package_id')
        .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'map.customer_id')
        .where('p.product_id', '=', "2")
        .andWhere('p.status', '=', "1")
        .andWhere('c.account_manager_id', '=', "" + accountManagerId + "")
        .orderBy('name', 'asc')
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getOcPackage(req, res) {
    knex.from(table.tbl_Package).where('status', '=', "1").andWhere('product_id', '=', "2")
        .select('id', 'name')
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getPackage(req, res) {
    knex.select('p.id', 'p.name', 'cp.name as plan_name', 'p.duration', 'p.created_at', 'p.status', 'pro.name as product_name', 'pro.id as product_id', 'p.feature_id', knex.raw('GROUP_CONCAT(c.id) as customers_id'))
        .from(table.tbl_Package + ' as p')
        .leftJoin(table.tbl_Product + ' as pro', 'p.product_id', 'pro.id')
        .leftJoin(table.tbl_PBX_features + ' as cfp', 'cfp.id', 'p.feature_id')
        .leftJoin(table.tbl_Call_Plan + ' as cp', 'cp.id', 'cfp.call_plan_id')
        .leftJoin(table.tbl_Map_customer_package + ' as map', 'map.package_id', 'p.id')
        .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'map.customer_id')
        .where('p.status', '=', "1")
        // .andWhere('c.status', '=', "1")
        .groupBy('p.id')
        // .having('c.status','=', "1")
        .orderBy('p.id', 'desc')
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getPackageById(req, res) {
    var productId = req.query.productId;
    var packageId = req.query.packageId;
    if (productId == '1') {
        var sql = knex.select('pf.*', 'p.id as package_id', 'p.name', 'p.duration','p.renew', knex.raw('COUNT(map.customer_id) as user_count'), 'gp.name as gateway_group',
            'cp.name as call_plan', 'cr.name as circle_name', 'sms.name as sms_plan_name','bp.name as bundle_plan_name', 'bpr.name as roaming_plan_name','bptc.name as tc_plan_name','fp.name as feature_rate_plan_name')
            .from(table.tbl_PBX_features + ' as pf')
            .leftJoin(table.tbl_Package + ' as p', 'p.feature_id', 'pf.id')
            .leftJoin(table.tbl_Map_customer_package + ' as map', 'p.id', 'map.package_id')
            .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'map.customer_id')
            .leftJoin(table.tbl_Gateway_Group + ' as gp', 'pf.gateway_group_id', 'gp.id')
            .leftJoin(table.tbl_Call_Plan + ' as cp', 'pf.call_plan_id', 'cp.id')
            .leftJoin(table.tbl_Pbx_circle + ' as cr', 'cr.id', 'pf.circle_id')
            .leftJoin(table.tbl_pbx_feature_plan + ' as fp', 'fp.id', 'pf.feature_rate_id')
            .leftJoin(table.tbl_pbx_SMS + ' as sms', 'sms.id', 'pf.sms_id')
            .leftJoin(table.tbl_pbx_bundle_plan + ' as bp', 'bp.id', 'pf.bundle_plan_id')
            .leftJoin(table.tbl_pbx_bundle_plan + ' as bpr', 'bpr.id', 'pf.roaming_plan_id')
            .leftJoin(table.tbl_pbx_bundle_plan + ' as bptc', 'bptc.id', 'pf.teleConsultancy_call_plan_id')
            .where('p.product_id', '=', "1")
            .andWhere('p.id', '=', "" + packageId + "")
            .andWhere('c.status', '=', "1");
    } else {
        var sql = knex.select('oc.*', 'p.id as package_id', 'p.name', 'p.duration','p.renew', knex.raw('COUNT(map.customer_id) as user_count'))
            .from(table.tbl_OC_features + ' as oc')
            .leftJoin(table.tbl_Package + ' as p', 'p.feature_id', 'oc.id')
            .leftJoin(table.tbl_Map_customer_package + ' as map', 'p.id', 'map.package_id')
            .where('p.product_id', '=', "2").andWhere('p.id', '=', "" + packageId + "");
    }
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

function getUserPackage(req, res) {
    var user_id = req.body.userId;
    knex.select('p.id', 'p.name', 'p.duration', 'p.created_at', 'p.status', 'pro.name as product_name', 'pro.id as product_id', 'p.feature_id')
        .from(table.tbl_Package + ' as p')
        .leftJoin(table.tbl_Product + ' as pro', 'p.product_id', 'pro.id')
        .leftJoin(table.tbl_Map_customer_package + ' as mp', 'p.id', 'mp.package_id')
        .where('p.status', '=', "1").andWhere('mp.customer_id', '=', "" + user_id + "")
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getProductByPackageId(req, res) {
    knex.from(table.tbl_Package).where('status', '=', "1").andWhere('id', '=', "" + req.body.id + "")
        .select('product_id')
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getPackageCustomers(req, res) {
    var package_id = req.body.package_id;
    var product_id = req.body.product_id;
    var sql = knex.select('map.package_id', 'map.product_id', 'c.company_name', 'map.customer_id', 'c.first_name', 'c.last_name')
        .from(table.tbl_Map_customer_package + ' as map')
        .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'map.customer_id')
        .where('c.status', '=', "1").andWhere('map.package_id', '=', "" + package_id + "")
        .andWhere('map.product_id', '=', "" + product_id + "");

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

function getProductCustomer(req, res) {
    let customer_id = req.query.customerId;
    knex.select(knex.raw('DISTINCT(p.id)'), 'p.name','c.balance','c.billing_type','c.credit_limit')
        .from(table.tbl_Product + ' as p')
        .join(table.tbl_Map_customer_package + ' as m', 'p.id', 'm.product_id')
        .join(table.tbl_Customer + ' as c', 'c.id', 'm.customer_id')
        .where('m.customer_id', '=', "" + customer_id + "")
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function verifyPackageName(req, res) {
    let keyword = req.body.package;
    let product_id = req.body.product_id;
    let sql = knex.from(table.tbl_Package).where('name', "" + keyword + "").andWhere('product_id', '=', "" + product_id + "")
        .select('id');

    sql.then((response) => {
        if (response.length > 0) {
            const package = response[0];
            res.json({
                package_id: package.id
            });
        } else {
            res.json({
                packager_id: ''
            });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getPackageByFilters(req, res) {
    let data = req.body.filters;
    let sql = knex.select('p.id', 'p.name', 'cp.name as plan_name', 'p.duration', 'p.created_at', 'p.status', 'pro.name as product_name', 'pro.id as product_id', 'p.feature_id')
        .from(table.tbl_Package + ' as p')
        .leftJoin(table.tbl_Product + ' as pro', 'p.product_id', 'pro.id')
        .leftJoin(table.tbl_PBX_features + ' as cfp', 'cfp.id', 'p.feature_id')
        .leftJoin(table.tbl_Call_Plan + ' as cp', 'cp.id', 'cfp.call_plan_id')
        .where('p.status', '=', "1")
        .orderBy('p.id', 'desc');

    if (data.by_validity != '') {
        sql = sql.andWhere('p.duration', 'like', "%" + data.by_validity + "%");
    }
     if (data.by_name != '') {
        sql = sql.andWhere('p.name', 'like', "%" + data.by_name + "%");
    }
    if (data.by_product != '') {
        sql = sql.andWhere('p.product_id', '=', "" + data.by_product + "");
    }
    if(data.by_minute_plan != ''){
        if(data.by_minute_plan == '1'){
        sql =sql.andWhere('cfp.is_bundle_type', '=', '1');
        }else if(data.by_minute_plan == '2'){
         sql =sql.andWhere('cfp.is_roaming_type', '=','1');
        }else if( data.by_minute_plan == '4'){
            sql =sql.andWhere('cfp.teleconsultation', '=', '1');
        }
    }
    if ((data.by_call_plan).length > 0) {
        sql = sql.whereIn('cfp.call_plan_id',data.by_call_plan);
    }

//     if (data.by_call_plan != '') {
//         sql = sql.andWhere('cfp.call_plan_id', '=', "" + data.by_call_plan + "");
//    }
    if (data.by_billing_type != '') {
        sql = sql.leftJoin(table.tbl_PBX_features + ' as px', 'px.id', 'p.feature_id')
        sql = sql.andWhere('px.billing_type', '=', "" + data.by_billing_type + "");
    }
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

function featureUsersCount(req, res) {
    var data = req.query;
    if (data.product_id == '1') {
        var countQuery = knex.select(knex.raw('COUNT(map.customer_id) as user_count'))
            .from(table.tbl_PBX_features + ' as pf')
            .leftJoin(table.tbl_Package + ' as p', 'p.feature_id', 'pf.id')
            .leftJoin(table.tbl_Map_customer_package + ' as map', 'map.package_id', 'p.id')
            .leftJoin(table.tbl_Customer + ' as c', 'map.customer_id', 'c.id')
            .where('p.product_id', '=', "1")
            .andWhere('p.id', '=', "" + data.package_id + "")
            .andWhere('c.status', '=', "1");
    } else {
        var countQuery = knex.select(knex.raw('COUNT(map.customer_id) as user_count'))
            .from(table.tbl_OC_features + ' as oc')
            .leftJoin(table.tbl_Package + ' as p', 'p.feature_id', 'oc.id')
            .leftJoin(table.tbl_Map_customer_package + ' as map', 'map.package_id', 'p.id')
            .leftJoin(table.tbl_Customer + ' as c', 'map.customer_id', 'c.id')
            .where('p.product_id', '=', "2")
            .andWhere('p.id', '=', "" + data.package_id + "")
            .andWhere('c.status', '=', "1");
    }
    countQuery.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function deletePackage(req, res) {
    var data = req.body;
    var sql = knex.from(table.tbl_Package).where('id', "" + data.package_id + "")
        .select('feature_id');
    sql.then((resp) => {
        var feature_id = resp[0].feature_id;
        sql2 = knex(table.tbl_Map_customer_package)
        .where('package_id', '=', "" + data.package_id + "")
        .andWhere('product_id', '=', "" + data.product_id + "")
        .del();
    sql2.then((respo) => {
        sql1 = knex(table.tbl_Package)
            .where('feature_id', '=', "" + feature_id + "")
            .andWhere('product_id', '=', "" + data.product_id + "")
            .del();
        sql1.then((respo) => {
            if (data.product_id == '1') {
                var query = knex(table.tbl_PBX_features)
                    .where('id', '=', "" + feature_id + "");
            } else {
                var query = knex(table.tbl_OC_features)
                    .where('id', '=', "" + feature_id + "");
            }
            query.del();
            query.then((respon) => {
                // if(respon)
               var sql2 = knex(table.tbl_pbx_pkg_logs).where('package_id',data.package_id)
               sql2.del()
               sql2.then((resp)=>{
                res.json({
                    resp
                });
               }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: jhgjhghgh' + err.message }); throw err });
            })
        })
    })
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: yoyoyoyoyoyoy' + err.message }); throw err });
}

function getGatewayGroup(req, res) {
    knex.select('*')
        .from(table.tbl_Gateway_Group)
        .where('status', '=', "1")
        .then((response) => {
            if (response) {
                // console.log(response);
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getCallPlan(req, res) {
    knex.select('*')
        .from(table.tbl_Call_Plan)
        .where('status', '=', "1")
        .orderBy('name')
        .then((response) => {
            if (response) {
                // console.log(response);
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


function getCallPlanbyid(req,res) {
    let data = req.query.id;
    console.log(req.query.id);
    let sql= knex.select('name')
        .from(table.tbl_Call_Plan).whereIn('id',req.query.id);
        console.log(sql.toQuery(),"-------------to query>>>>>>>>>>>>>>>>");
        sql.then((response) => {
            if (response) {
                // console.log(response);
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}


function getCircleCallPlan(req, res) {
    let data = req.body.circle_id;
    knex.select('*')
        .from(table.tbl_Call_Plan)
        .where('status', '=', "1")
        .andWhere('circle_id', '=', "" + data + "")
        .then((response) => {
            if (response) {
                // console.log(response);
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getPackageExtensionCount(req, res) {
    var sql = knex(table.tbl_Extension_master).count('id as extensionCount').where('package_id', '=', "" + req.body.package_id.package_id + "")
    console.log(sql.toQuery());
    sql.then((response) => {
        if (response) {
            console.log(response);
            // const count = response[0];
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'get extension count package wise' });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'get extension count package wise' }); throw err });
}

function getCircleBasedPackages(req, res) {
    var circleId = req.query.circleId;
    knex.select('p.id', 'p.name')
        .from(table.tbl_Package + ' as p')
        .leftJoin(table.tbl_PBX_features + ' as cfp', 'cfp.id', 'p.feature_id')
        .andWhere('cfp.circle_id',circleId)
        .andWhere('cfp.minute_plan', '=', "0")
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getCallPlanList(req, res) {
    knex.select('cp.id','cp.name')
        .from(table.tbl_Call_Plan + ' as cp')
        .where('status', '=', "1")
        .andWhere('is_minute_plan','=','0')
        .orderBy('name')
        .then((response) => {
            if (response) {
                // console.log(response);
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getTCCallPlanList(req, res) {
    knex.select('bp.id','bp.name')
        .from(table.tbl_pbx_bundle_plan + ' as bp')
        // .where('bp.status', '=', "1")
        .andWhere('bp.plan_type','=','4')
        .orderBy('bp.name')

        .then((response) => {
            if (response) {
                // console.log(response);
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function deleteBoosterDuringChangeMinutePlan(req, res) {
    var minute_plan_id = req.body.minute_plan_id;
    var sql = knex.select('cpr.id')
        .from(table.tbl_Call_Plan_Rate + ' as cpr')
        .leftJoin(table.tbl_Call_Plan + ' as cp', 'cp.id', 'cpr.call_plan_id')
        .leftJoin(table.tbl_pbx_bundle_plan + ' as bp', 'bp.call_plan', 'cp.id')
        .where('cpr.is_group', '=', "0")
        .andWhere('cpr.plan_type', '=', "3")
        .andWhere('bp.id', '=', "" + minute_plan_id + "");
    sql.then((response) => {
        if (response) {
            console.log(response);
            let minifyID = response ? response.map(item => item.id) : ['']
            let sql2 = knex(table.tbl_Call_Plan_Rate)
                .whereIn('id', minifyID)
                .del();
            console.log(sql2.toString());
            sql2.then((respo) => {
                res.json({
                    respo
                });
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + response });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

module.exports = {
    getPackageCustomers, getProductByPackageId, getproduct, getPbxPackage, getOcPackage, getPackage,
    getUserPackage, getProductCustomer, verifyPackageName, getPackageById, getPackageByFilters, deletePackage,
    featureUsersCount, getGatewayGroup, getCallPlan, getPackageExtensionCount,getPbxPackageForAccountManagerCustomers,
    getOCPackageForAccountManagerCustomers,getCircleCallPlan, getCircleBasedPackages, getCallPlanList,
    getPbxPackageForCustomerCreation, getTCCallPlanList, deleteBoosterDuringChangeMinutePlan, getCallPlanbyid
};
