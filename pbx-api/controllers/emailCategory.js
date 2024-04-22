
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
/**
* Returns jwt token if valid email and password is provided
* @param req
* @param res
* @returns {*}
*/


function createEmailCategory(req, res) {

    knex.raw("Call pbx_save_emailcategory(" + req.body.emailCategory.id + ",'" + req.body.emailCategory.category + "',\
    " + req.body.emailCategory.product + ",'1')")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });

}

function viewEmailCategory(req, res) {
    knex.raw("Call pbx_get_emailcategory()")
    .then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });

}

function getEmailCategory(req, res) {

    knex.from(table.tbl_Email_Category).where('status', '=', "1").orderBy('category_name','asc')
        .select('id', 'category_name')
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

function getEmailCatgeoryByFilters(req, res) {
    let data = req.body.filters;
    data.by_category = (data.by_category).length ? ("'" + data.by_category + "'") : null;
    data.by_product = data.by_product ? ("'" + data.by_product + "'") : null;
    data.by_status = data.by_status ? ("'" + data.by_status + "'") : null;

    knex.raw("Call pbx_getEmailCatgeoryByFilters(" + data.by_category + "," + data.by_product + "," + data.by_status + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}


module.exports = {
    createEmailCategory, viewEmailCategory, getEmailCategory,getEmailCatgeoryByFilters
};
