const config = require('../config/app');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

function createContact(req, res) {
    // console.log(req.body.contactList);
    req.body.contactList.customer_id = req.body.contactList.customer_id ? req.body.contactList.customer_id : 0;
    req.body.contactList.extension_id = req.body.contactList.extension_id ? req.body.contactList.extension_id : 0;
    let phone2 = ''
    if (!req.body.contactList.phone2 || req.body.contactList.phone2 == '') {
        phone2 = '';
    } else {
        phone2 = req.body.contactList.country_code + req.body.contactList.phone2;
    }
    
    let designation = '';
    if (!req.body.contactList.designation || req.body.contactList.designation == '') {
        designation = '';
    } else {
        designation = req.body.contactList.designation;
    }

    let organization = '';
    if (!req.body.contactList.organization || req.body.contactList.organization == '') {
        organization = '';
    } else {
        organization = req.body.contactList.organization;
    }

    knex.raw("Call pbx_save_contactlist(" + req.body.contactList.id + ",'" + req.body.contactList.name + "','" + req.body.contactList.email + "','" + req.body.contactList.country_code + req.body.contactList.phone1 + "',\
                    '" + phone2 + "','" + organization + "','" + designation + "'," + req.body.contactList.customer_id + "," + req.body.contactList.extension_id + "," + req.body.contactList.country + ",'1'," + req.body.contactList.role + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}


function viewContactList(req, res) {
    req.body.id = req.body.id ? req.body.id : null;
    req.body.phonenumber1 = req.body.phonenumber1 ? ("'" + req.body.phonenumber1 + "'") : null;
    req.body.phonenumber2 = req.body.phonenumber2 ? ("'" + req.body.phonenumber2 + "'") : null;
    req.body.customer_id = req.body.customer_id ? req.body.customer_id : 0;
    req.body.extension_id = req.body.extension_id ? req.body.extension_id : 0;    

    knex.raw("Call pbx_get_contactlist(" + req.body.id + "," + req.body.phonenumber1 + "," + req.body.phonenumber2 + "," + req.body.customer_id + "," + req.body.extension_id + ", " + req.body.role + " )")
        .then((response) => {            
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });

}




function deleteContact(req, res) {
    knex.raw("Call pbx_delete_contactlist(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });

}



function copyToBlackList(req, res) {
    let data = req.body.data;
    data.phone_number2 = data.phone_number2 ? data.phone_number2 : null;
    let arr = [];
    arr.push(data.country_code + data.phoneNumber1Display);
    if(data.phone_number2) arr.push(data.country_code + data.phoneNumber2Display);
    data.phoneArr = arr;
    data.phoneArr = data.phoneArr ? ("'" + data.phoneArr + "'") : null;

    console.log(knex.raw("Call pbx_copyToBLackList('" + data.name + "'," + data.country_id + "," + data.customer_id + "," + data.extension_id + "," + data.phoneArr + ",'1')").toString());
    knex.raw("Call pbx_copyToBLackList('" + data.name + "'," + data.country_id + "," + data.customer_id + "," + data.extension_id + "," + data.phoneArr + ",'1')")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });

}

function getContactListByFilters(req, res) {    
    let data = req.body.filters;
    data.by_number = data.by_number ? ("'" + data.by_number + "'") : null;
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;
    data.by_email = data.by_email ? ("'" + data.by_email + "'") : null;    
    let sql = knex.raw("Call pbx_getContactListByFilters(" + req.body.id + "," + req.body.role + "," + data.by_number + "," + data.by_name + "," + data.by_email + ")");    
    sql.then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getCustomerEmailContact(req, res) {
    knex.select('id', 'email', 'name')
        .from(table.tbl_Contact_list + ' as t')
        .where('t.customer_id', '=', "" + req.query.customerId + "")
        .andWhere('t.extension_id', '=', 0)
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Contact list ' }); throw err });

}

function deleteContactGroup(req, res) {
    let groupId = req.query[Object.keys(req.query)[0]];
      knex(table.tbl_pbx_broadcast).where('group_ids', 'Like', "%" + groupId + "%")
         .then((response) => {
            if (response.length == 0) {
                let sql = knex(table.tbl_pbx_contact_group).where('id', '=', "" + groupId + "")
                sql.del();
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
                    response: '',
                    code: 202,
                    message: "This Contact Group is associated with Broadcast!"
                });

            }
        });

}

function checkNumberExistInBlackList(req, res) {
    let data = req.body.data;        
    data.phone_number2 = data.phone_number2 ? data.phone_number2 : null;
    let arr = [];
    arr.push(data.country_code + data.phoneNumber1Display);
    if (data.phone_number2) arr.push(data.country_code + data.phoneNumber2Display);
    data.phoneArr = arr;
    console.log(data.phoneArr);
    let sql = knex(table.tbl_Black_list)
        .select('*')
        .whereIn('phone_number', data.phoneArr)
        .andWhere('customer_id',data.customer_id);
       // .andWhere('extension_id',data.extension_id)
        sql.then((response) => {
            if (response.length) {
                console.log(response,"------------response of exist>>>>>>>>>>>>>>>>>>>>>");
                res.json({
                    response: response,
                    code: 200,
                    message: "This Contact associated with BlackList!"
                });
            } else {
                console.log(".............in else condition>>>>>>>>>>>>>>>>>>>>>>>>>>");
                res.json({
                    response: '',
                    code: 202,
                    message: "This Contact not associated with BlackList!"
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

module.exports = {
    createContact, viewContactList, deleteContact, copyToBlackList,
    getContactListByFilters, getCustomerEmailContact, deleteContactGroup, checkNumberExistInBlackList
};
