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

function viewGlobalRate(req, res)  {
    var body = req.body;
    let isFilter = Object.keys(body).length ==0?false:true;
     let sql = knex.from(table.tbl_Pbx_global_feature_rate)
        .select('*');
        if(isFilter){
            sql.where('feature_name', '=', body.feature_name)
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

    function getglobalRateById(req, res) {
        let id = parseInt(req.query.id);
        knex.select('*').from(table.tbl_Pbx_global_feature_rate + ' as gr')
        .where('gr.id', '=', id)
        .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }

function UpdateGlobalRate(req, res) {
    let data = req.body.globalRate;
    var count = 0;
    for (let i = 0; i < data.featureRateForm.length; i++) {
        count++;
        knex(table.tbl_Pbx_global_feature_rate)
            .where('id', '=', "" + data.featureRateForm[i].id + "")
            .update({
                feature_name: "" + data.featureRateForm[i].feature_name + "",
                feature_rate: "" + data.featureRateForm[i].feature_rate + "",
                feature_limit: "" + data.featureRateForm[i].feature_limit + "",
            }).then(response => {
                if (count == data.featureRateForm.length) {
                    res.send({
                        response: response,
                        message: 'Global Feature Rate update successfully',
                        code: 200
                    });
                }
            }).catch((err) => {
                res.status(400).send({
                    code: err.errno,
                    error: 'error', message: 'DB Error: ' + err.message
                }); throw err
            });
    }
}

    function deleteGlobalRate(req, res) {
        let body = req.body.globalRate
        let sql = knex(table.tbl_pbx_feature_plan).where('id', '=', "" + body.id + "")
        sql.del();
        sql.then((response) => {
        if (response) {
            res.json({
                response:response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error' });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }

    function viewGlobalFeatureMappingRate(req, res)  {
        var featurePlanRateId = req.body.featurePlanRateId;

         let sql = knex.from(table.tbl_pbx_global_feature_mapping)
            .select('*');
            sql.where('feature_plan_id', '=', featurePlanRateId)
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


module.exports = {
    viewGlobalRate,
    getglobalRateById,
    UpdateGlobalRate,
    deleteGlobalRate,
    viewGlobalFeatureMappingRate,
    // getFeatureCodeByFilters
};
