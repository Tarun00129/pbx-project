const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

function createGatewayGroup(req, res) {
    let description = '';
    if (!req.body.gatewayGroup.description || req.body.gatewayGroup.description == '') {
        description = '';
    } else if (req.body.gatewayGroup.description) {
        description = req.body.gatewayGroup.description;
    }

    knex.raw("Call pbx_save_gatewaygroup(" + req.body.gatewayGroup.id + ",'" + req.body.gatewayGroup.name + "',\
                            '" + description + "','" + req.body.gatewayGroup.group + "','1')")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function viewGatewayGroup(req, res) {
    req.body.id = req.body.id ? req.body.id : null;
    req.body.name = req.body.name ? ("'" + req.body.name + "'") : null;
    knex.raw("Call pbx_get_gatewaygroup(" + req.body.id + "," + req.body.name + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });

}

function getGatewayGroupFilter(req, res) {
    let data = req.body.filters;
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;
    data.by_group = data.by_group ? ("'" + data.by_group + "'") : null;

// console.log(knex.raw("Call pbx_getGatewayGroupFilter(" + data.by_name + "," + data.by_group + ")").toString());

    knex.raw("Call pbx_getGatewayGroupFilter(" + data.by_name + "," + data.by_group + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function deleteGatewayGroup(req, res) {
    knex.raw("Call pbx_delete_gatewaygroup(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

module.exports = {
    createGatewayGroup, viewGatewayGroup, deleteGatewayGroup, getGatewayGroupFilter
}