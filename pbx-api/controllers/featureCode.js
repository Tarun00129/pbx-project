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

function viewFeatureCode(req, res) {
    knex.raw("Call pbx_get_featureCode()")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getFeatureCodeByFilters(req, res) {
    let data = req.body.filters;
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;
    data.by_type = data.by_type ? ("'" + data.by_type + "'") : null;

    knex.raw("Call pbx_getFeatureCodeByFilters(" + data.by_name + "," + data.by_type + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

module.exports = {
    viewFeatureCode, getFeatureCodeByFilters
};