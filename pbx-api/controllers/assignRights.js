const { knex } = require('../config/knex.db');

function getUserPackageDetails(req, res) {

    req.body.pkgid = req.body.pkgid ? req.body.pkgid : null;
    req.body.prodid = req.body.prodid ? req.body.prodid : null;
    knex.raw("Call user_package_details(" + req.body.pkgid + "," + req.body.prodid + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });

}

function saveAssignRights(req, res) {
    let request = req.body;
    knex.raw("Call pbx_save_assignrights('" + request.userName + "','" + request.pkgName + "','" + JSON.stringify(request.griddata) + "')")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function getAssignRights(req, res) {
    knex.raw("Call pbx_get_assignrights()")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getSavedAssignRights(req, res) {
    let request = req.body;
    knex.raw("Call pbx_get_savedassignrights('" + request.userid + "','" + request.pkgid + "')")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function deleteAssignRights(req, res) {
    let request = req.body;
    knex.raw("Call pbx_delete_assignrights('" + request.userid + "','" + request.pkgid + "')")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}


function getAssignRightsFilter(req, res) {
    let data = req.body.filters;
    data.by_company = data.by_company ? ("'" + data.by_company + "'") : null;
    data.by_package = data.by_package ? ("'" + data.by_package + "'") : null;

    knex.raw("Call pbx_getAssignRightsFilter(" + data.by_company + "," + data.by_package + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}


module.exports = {
    getUserPackageDetails, saveAssignRights, getAssignRights,
    getSavedAssignRights, deleteAssignRights, getAssignRightsFilter
}