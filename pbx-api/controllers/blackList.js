const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

function createBlackListContact(req, res) {
    // console.log(req.body.blacklist,"--------------------------------------------");
    req.body.blackList.name = req.body.blackList.name ? req.body.blackList.name : '';
    req.body.blackList.customer_id = req.body.blackList.customer_id ? req.body.blackList.customer_id : null;
    req.body.blackList.extension_id = req.body.blackList.extension_id ? req.body.blackList.extension_id : 0;
    req.body.blackList.blockFor = req.body.blackList.blockFor ? req.body.blackList.blockFor : '';

    let country_code = '';
    if (req.body.blackList.country_code == '' || req.body.blackList.numberFormat == 0 || req.body.blackList.numberFormat == false || req.body.blackList.numberFormat == '') {
        country_code = '';
    } else if (req.body.blackList.country_code != '' || req.body.blackList.numberFormat == 1 || req.body.blackList.numberFormat == true || req.body.blackList.numberFormat != '') {
        country_code = req.body.blackList.country_code;
    }
    let country = 0;
    let phoneNumber = '';
    if (!req.body.blackList.numberFormat || req.body.blackList.numberFormat == '0' || req.body.blackList.numberFormat == false || req.body.blackList.numberFormat == '') {
        country = 0;
        phoneNumber = req.body.blackList.phone2;
    } else if (req.body.blackList.numberFormat == '1' || req.body.blackList.numberFormat == true || req.body.blackList.numberFormat != '') {
        country = req.body.blackList.country;
        phoneNumber = req.body.blackList.phone;
    }

    let status = '1';
    if (req.body.blackList.status == '' || req.body.blackList.status == 'Active') {
        status = '1';
    } else if (req.body.blackList.status == 'Inactive') {
        status = '0'
    }
    // console.log(req.body,"-------------------------------body-------------------------")

    console.log( knex.raw("Call pbx_save_blacklist(" + req.body.blackList.id + ",'" + req.body.blackList.name + "','" + country_code + phoneNumber + "'," + req.body.blackList.customer_id +
    "," + req.body.blackList.extension_id + "," + country + ",'" + status + "'," + req.body.blackList.role + ", '"+ req.body.blackList.blockFor +"')").toString());

    knex.raw("Call pbx_save_blacklist(" + req.body.blackList.id + ",'" + req.body.blackList.name + "','" + country_code + phoneNumber + "'," + req.body.blackList.customer_id + 
    "," + req.body.blackList.extension_id + "," + country + ",'" + status + "'," + req.body.blackList.role + ", '"+ req.body.blackList.blockFor +"')")
        .then((response) => {  
            if (response) {                
                console.log(response[0][0][0],":---------resposne of black list creation----------------------------");          
                console.log(response[0][0][0].MESSAGE_TEXT,"<<<<<<<<<<<message test.................");
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });

}

function viewBlackList(req, res) {
    req.body.id = req.body.id ? req.body.id : null;
    console.log(req.body,"<<<<<<<<<><>>>>>>>>>>>>>>>");
    req.body.phone = req.body.phonenumber ? ("'" + req.body.phonenumber + "'") : null;
    req.body.customer_id = req.body.customer_id ? req.body.customer_id : null;
    req.body.country = req.body.country ? req.body.country : null;        
    console.log(knex.raw("Call pbx_get_blacklist(" + req.body.id + "," + req.body.phonenumber + "," + req.body.customer_id + "," + req.body.extension_id + ", " + req.body.role + ","+ req.body.country +")").toString()),"<<<<<<<<<<<<<,in query>>>>>>>>>>>>>>>";

    knex.raw("Call pbx_get_blacklist(" + req.body.id + "," + req.body.phonenumber + "," + req.body.customer_id + "," + req.body.extension_id + ", " + req.body.role + ","+ req.body.country +")")
        .then((response) => {   
            console.log("data print herr>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");         
            console.log(response[0][0],"---------------response of zero--------------");        
                res.send({ response: response[0][0] });    
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });

}



function updateBlackListContactStatus(req, res) {
    let id = parseInt(req.body.id);

    knex(table.tbl_Black_list).where('id', '=', "" + id + "")
        .update({ status: "" + req.body.status + "" })
        .then((response) => {
            if (response === 1) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'Black List Contact status updated' });
            }
        }).catch((err) => { console.log(err); throw err });
}

function deleteBlackListContact(req, res) {
    knex.raw("Call pbx_delete_blacklist(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}



//when u copy any number to black list then to check number exist in black or not thwen this api call
function checkNumberExistInBlackList(req, res) {
    let data = req.body.data;    
    // console.log(data,"--------------------------------datas");
    data.extension_id = data.extension_id ? data.extension_id : 0;
    data.phone_number2 = data.phone_number2 ? data.phone_number2 : null;
    let arr = [];
    arr.push(data.country_code + data.phoneNumber1Display);
    if(data.phone_number2) arr.push(data.country_code + data.phoneNumber2Display);
    data.phoneArr = arr;
    data.phoneArr = data.phoneArr ? ("'" + data.phoneArr + "'") : null;

    // console.log(knex.raw("Call pbx_checknumberexistinblacklist(" + data.phoneArr + "," + data.customer_id + "," + data.extension_id + ")").toString());
    knex.raw("Call pbx_checknumberexistinblacklist(" + data.phoneArr + "," + data.customer_id + "," + data.extension_id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });    
}



//when u add any number fron black list form
function verifyNumberExistInBlackList(req, res) {
    if (req.query.id != '') {

        knex(table.tbl_Black_list).count('id', { as: 'id' })
            .where('phone_number', 'like', `%${req.query.phone}%`)
            .andWhere('customer_id', '=', req.query.id)
            .then((response) => {
                if (response.length > 0) {                    
                    const blackList = response[0];
                    res.json({
                        blackList: blackList.id
                    });
                } else {
                    res.json({
                        blackList: ''
                    });
                }
            }).catch((err) => { console.log(err); throw err });
            console.log((knex(table.tbl_Black_list).count('id', { as: 'id' })
            .where('phone_number', 'like', `%${req.query.phone}%`)
            .andWhere('id', 'like', req.query.id)).toQuery(),"----------number exis0t------------------------");
    } else {

        knex(table.tbl_Black_list).count('id', { as: 'id' })
            .where('phone_number', '=', "" + req.query.phone + "")
            .then((response) => {
                if (response.length > 0) {
                    const blackList = response[0];
                    res.json({
                        blackList: blackList.id
                    });
                } else {
                    res.json({
                        blackList: ''
                    });
                }
            }).catch((err) => { console.log(err); throw err });

    }
}

function getBlackListByFilters(req, res) { 
    let data = req.body.filters;
    
    data.by_number = data.by_number ? ("'" + data.by_number + "'") : null;
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;

    data.by_country = (data.by_country).length  ? ("'" + data.by_country + "'") : null;
    // data.by_country = data.by_country ?  Number(data.by_country) : null; 
    data.by_status = data.by_status ? ("'" + data.by_status + "'") : null;
    data.by_blocked_for = data.by_blocked_for ? ("'" + data.by_blocked_for + "'") : null;
    console.log(data.by_country);
    knex.raw("Call pbx_getBlackListByFilters(" + req.body.id + "," + req.body.role + "," + data.by_number + ","+ data.by_name  + ","+ data.by_country +", "+ data.by_status +"," + data.by_blocked_for +")").then((response) => {
        if (response) {
            
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });    
}

module.exports = {
    createBlackListContact, viewBlackList, verifyNumberExistInBlackList,
    updateBlackListContactStatus, deleteBlackListContact,
    checkNumberExistInBlackList, getBlackListByFilters
};