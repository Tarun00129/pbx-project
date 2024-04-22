const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');


/**
* Returns jwt token if valid email and password is provided
* @param req
* @param res
* @returns {*}
*/
function createEmailTemplate(req, res) {
    req.body.emailTemplate.content = req.body.emailTemplate.content ? String(req.body.emailTemplate.content).replace(/'/g, "\\'") : '';

    knex.select('id').from(table.tbl_Email_template)
        .where("email_category_id", "=", "" + req.body.emailTemplate.category + "")
        .then((response) => {
            if (response.length > 0) {
                knex.raw("Call pbx_save_emailtemplate(" + req.body.emailTemplate.id + ",'" + req.body.emailTemplate.name + "','" + req.body.emailTemplate.emailTitle + "','" + req.body.emailTemplate.content + "',\
    '" + req.body.emailTemplate.image + "'," + req.body.emailTemplate.category + "," + req.body.emailTemplate.product + ", '0')")
                    .then((response) => {
                        if (response) {
                            res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
                        }
                    }).catch((err) => {
                        res.send({ code: err.errno, message: err.sqlMessage });
                    });
            } else {
                knex.raw("Call pbx_save_emailtemplate(" + req.body.emailTemplate.id + ",'" + req.body.emailTemplate.name + "','" + req.body.emailTemplate.emailTitle + "','" + req.body.emailTemplate.content + "',\
                '" + req.body.emailTemplate.image + "'," + req.body.emailTemplate.category + "," + req.body.emailTemplate.product + ", '1')")
                    .then((response) => {
                        if (response) {
                            res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
                        }
                    }).catch((err) => {
                        res.send({ code: err.errno, message: err.sqlMessage });
                    });
            }
        }).catch((err) => { console.log(err); throw err });

}

//  knex.raw('TRIM(LEADING ("http://119.18.55.154:3000/assets/uploads/") FROM (e.image)) as image'),
function viewEmailTemplate(req, res) {
    req.body.id = req.body.id ? req.body.id : null;

    knex.raw("Call pbx_get_emailtemplate(" + req.body.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getEmailContentUsingCategory(req, res) {

    knex.select('e.id', 'e.name', 'e.title', 'e.image', 'e.content', 'e.email_category_id',
        'c.category_name as category_name', 'e.product_id', 'p.name as product')
        .from(table.tbl_Email_template + ' as e')
        .leftOuterJoin(table.tbl_Email_Category + ' as c', 'e.email_category_id', 'c.id')
        .leftOuterJoin(table.tbl_Product + ' as p', 'e.product_id', 'p.id')
        .where('c.category_name', '=', "" + req.query.category + "")
        .andWhere('e.status', '=', '1')
        .then((response) => {
            if (response.length > 0) {
                res.json({ response });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function deleteEmailTemplate(req, res) {

    knex.raw("Call pbx_delete_emailtemplate(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });

}



function updateEmailTemplateStatus(req, res) {
    let id = parseInt(req.body.id);
    let category_id = parseInt(req.body.email_category_id);
    let status = '';

    if (req.body.status == '0') {
        status = '1'; //to change other email template status with same category (in case of multiple records)
    } else {
        status = '0';
    }

    knex(table.tbl_Email_template).where('id', '=', "" + id + "")
        .andWhere('email_category_id', '=', "" + category_id + "")
        .update({ status: "" + req.body.status + "" })
        .then((response) => {
            if (response) {
                knex(table.tbl_Email_template)
                    .whereNot("id", "=", id)
                    .andWhere('email_category_id', '=', "" + category_id + "")
                    .update({ status: "" + status + "" })
                    .then((response) => {
                        res.json({ response });
                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function checkExistedCategory(req, res) {
    let categoryId = parseInt(req.query.categoryId);
    if (req.query.id == '') {
        knex.select('id').from(table.tbl_Email_template)
            .where("email_category_id", "=", "" + categoryId + "")
            .then((response) => {
                if (response.length > 0) {
                    const category = response[0];
                    res.json({
                        category: category.id
                    });
                } else {
                    res.json({
                        category: ''
                    });
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else {
        let id = parseInt(req.query.id);

        knex.select('id').from(table.tbl_Email_template)
            .where("email_category_id", "=", "" + categoryId + "")
            .andWhere("status", "=", "1")
            .andWhereNot("id", "=", id)
            .then((response) => {
                if (response.length > 0) {
                    const category = response[0];
                    res.json({
                        category: category.id
                    });
                } else {
                    res.json({
                        category: ''
                    });
                }
            }).catch((err) => { console.log(err); throw err });
    }
}

function getEmailTemplateByFilters(req, res) {
    let data = req.body.filters;
    data.by_category = (data.by_category).length ? ("'" + data.by_category + "'") : null;
    data.by_product = data.by_product ? ("'" + data.by_product + "'") : null;
    data.by_status = data.by_status ? ("'" + data.by_status + "'") : null;

    knex.raw("Call pbx_getEmailTemplateByFilters(" + data.by_category + "," + data.by_product + "," + data.by_status + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function checkMultipleStatus(req, res) {
    let id = parseInt(req.body.id);
    let category_id = parseInt(req.body.email_category_id);
    knex(table.tbl_Email_template).where('email_category_id', '=', "" + category_id + "")
        .andWhere('status', '=', req.body.status).orderBy('id', 'desc')
        .select('id')
        .then((response) => {
            if (response.length > 1) {
                let templateId = Object.values(JSON.parse(JSON.stringify(response)));
                let lasttemplateId = templateId[0].id;

                knex(table.tbl_Email_template)
                    .whereNot("id", "=", lasttemplateId)
                    .andWhere('email_category_id', '=', "" + category_id + "")
                    .update({ status: '0' })
                    .then((response) => {
                        if (response) {
                            res.json({
                                response
                            });
                        } else {
                            res.status(401).send({ error: 'Unauthorized', message: 'Email Template status updated' });
                        }
                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
            } else {
                res.status(401).send({ error: 'Unauthorized', message: 'Email Template status updated' });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function countEmailTemplate(req, res) {
    let category_id = req.query.email_category_id;
    knex(table.tbl_Email_template).count('id', { as: 'count' }).where('email_category_id', '=', "" + category_id + "")
        .then((response) => {
            if (response.length > 0) {
                let count = response[0].count == 1 ? 1 : 0;
                res.json({
                    count: count
                });

            } else {
                res.status(401).send({ error: 'Unauthorized', message: 'Invalid Email' });
            }
        }).catch((err) => { console.log(err); throw err });
}

function getProductEmailCategory(req, res) {
    knex(table.tbl_Email_Category).select('id', 'category_name').where('product_id', '=', "" + req.query.product + "")
        .then((response) => {
            if (response) {
                res.json({
                    response
                });
            }
        }).catch((err) => { console.log(err); throw err });
}
module.exports = {
    createEmailTemplate, viewEmailTemplate, getProductEmailCategory,
    getEmailContentUsingCategory, deleteEmailTemplate,
    updateEmailTemplateStatus, checkExistedCategory, getEmailTemplateByFilters,
    checkMultipleStatus, countEmailTemplate
};
