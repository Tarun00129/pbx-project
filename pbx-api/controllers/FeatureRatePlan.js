const config = require('../config/app');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

const Hash = require('crypto-js/pbkdf2');
/**
* Returns jwt token if valid email and password is provided
* @param req
* @param res
* @returns {*}
*/

function viewFeaturePlan(req, res) 
 {
            var body = req.body;
            let isFilter = !body.plan_id ? false : true;
            var sql =knex.from(table.tbl_pbx_feature_plan + ' as ar') 
            // .select('rp.id as id', 'rp.name as name', 'rp.description as description', 'rp.amount as amount', 'rp.feature_name as feature_name','rp.feature_limit as feature_limit','rp.feature_rate as feature_rate', )
            .select('*')
            .orderBy('ar.name', 'asc')  
            if(isFilter){
                sql.where('rp.id', '=', body.plan_id )
            }
            console.log(sql.toString());
            sql.then((response) => {
          //  if(response.length >0 ) {
                res.json({
                    response:response,
                    code:200
                })
    
          //  }
        }).catch((err) => { console.log(err); throw err });
}

    
    function getFeaturePlanById(req, res)
    {
        let id = parseInt(req.query.id);
        knex.select('gr.id','gr.feature_name','gr.feature_limit','gr.feature_rate').from(table.tbl_pbx_feature_plan  + ' as gr')
        .where('gr.id', '=', id)
        .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }

    function updateFeaturePlan(req, res) {
        let data = req.body.featurePlan;
        let featurePlanId = data.id;
        let sql = knex(table.tbl_pbx_feature_plan ).where('id', '=', "" + data.id + "")
        .update({name: "" + data.name + "",description: "" + data.description });
       
        sql.then((response) => {
            if (response === 1) {
                // let featurePlanId = response;
                var count = 0;
                for (let i = 0; i < data.featureRateForm.length; i++) {
                    count++;
                    knex(table.tbl_pbx_global_feature_mapping)
                    .where('global_feature_id', '=', "" + data.featureRateForm[i].id + "")
                    .andWhere('feature_plan_id', '=', "" + featurePlanId + "")
                    .update({
                        // global_feature_id: "" + data.featureRateForm[i].id + "",
                        // feature_plan_id: "" + featurePlanId + "",
                        amount: "" + data.featureRateForm[i].feature_rate + "",
                        count: "" + data.featureRateForm[i].feature_limit + "",
                    }).then(response => {
                        if (count == data.featureRateForm.length) {
                            res.send({
                                response: response,
                                message: 'Feature Rate Plan update successfully',
                                code: 200
                            });
                        }
                    }).catch((err) => {
                        console.log(err);
                        res.status(400).send({
                            code: err.errno,
                            error: 'error', message: 'DB Error: ' + err.message
                        }); throw err
                    });
                }
            }
        }
        )


    }

function deleteFeaturePlan(req, res) {
    var body = req.body.featurePlan
    knex.select('f.id').from(table.tbl_PBX_features + ' as f')
        .where('f.feature_rate_id', '=', body.id)
        .then((response) => {
            if (response.length == 0) {
                let sql = knex(table.tbl_pbx_feature_plan).where('id', '=', "" + body.id + "")
                sql.del();
                sql.then((response) => {
                    if (response) {
                        let sql2 = knex(table.tbl_pbx_global_feature_mapping).where('feature_plan_id', '=', "" + body.id + "")
                        sql2.del();
                        sql2.then((response) => {
                            if (response) {
                                res.json({
                                    response: response,
                                    message: 'Feature rate plan deleted'
                                });
                            } else {
                                res.status(200).send({ error: 'error', message: 'DB Error' });
                            }
                        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

                    } else {
                        res.status(401).send({ error: 'error', message: 'DB Error' });
                    }
                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
            } else {
                res.json({
                    response: response,
                    code: 400,
                    message: 'You can not delete this feature rate!'
                });
            }
        })
}

    function addFeaturePlan(req, res)
    {
        let data = req.body;
       
        let sql = knex(table.tbl_pbx_feature_plan).insert({name: "" + data.name + "",description: "" + data.description }); 
            
            sql.then((response) =>{
                if (response) {
                    let featurePlanId = response;
                    var count = 0;
                    for (let i = 0; i < data.featureRateForm.length; i++) {                       
                        count++;
                        knex(table.tbl_pbx_global_feature_mapping).insert({
                            global_feature_id: "" + data.featureRateForm[i].id + "",
                            feature_plan_id: "" + featurePlanId + "",
                            amount: "" + data.featureRateForm[i].feature_rate + "",
                            count: "" + data.featureRateForm[i].feature_limit + "",
                        }).then(response => {
                            if (count == data.featureRateForm.length) {
                                res.send({
                                    response: response,
                                    message : 'Feature Rate Plan create successfully',
                                    code: 200
                                });
                            }
                        }).catch((err) => {
                            console.log(err);
                            res.status(400).send({
                                code: err.errno,
                                error: 'error', message: 'DB Error: ' + err.message
                            }); throw err
                        });
                    }
                }
           
        }).catch((err) => { 
            console.log(err); 
            res.status(200).send({ 
                code:err.errno,
                error: 'error', message: 'DB Error: ' + err.message }); throw err });

    }

    function getFeaturePlanPackagesById(req, res) {
        let feature_plan_id = parseInt(req.query.feature_plan_id);
        knex.select('*').from(table.tbl_Package + ' as pckg')
        .leftJoin(table.tbl_PBX_features + ' as f', 'pckg.feature_id', 'f.id' )
        .where('f.feature_rate_id', '=', feature_plan_id)
        .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }   

    function UpgradeFeatureRatePlan(req, res) {
        let data = req.body.upgradeRate;
        let featurePlanId = data.featurePlanRateId;
        var count = 0;
        for (let i = 0; i < data.featureRateForm.length; i++) {
            count++;
            knex(table.tbl_pbx_global_feature_mapping).insert({
                global_feature_id: "" + data.featureRateForm[i].id + "",
                feature_plan_id: "" + featurePlanId + "",
                amount: "" + data.featureRateForm[i].feature_rate + "",
                count: "" + data.featureRateForm[i].feature_limit + "",
            }).then(response => {
                if (count == data.featureRateForm.length) {
                    res.send({
                        response: response,
                        message: 'Feature Rate Plan upgrade successfully',
                        code: 200
                    });
                }
            }).catch((err) => {
                console.log(err);
                res.status(400).send({
                    code: err.errno,
                    error: 'error', message: 'DB Error: ' + err.message
                }); throw err
            });
        }
    }

    
module.exports = {
    viewFeaturePlan, 
    getFeaturePlanById,
    updateFeaturePlan,
    deleteFeaturePlan,
    addFeaturePlan,
    getFeaturePlanPackagesById,
    UpgradeFeatureRatePlan
};