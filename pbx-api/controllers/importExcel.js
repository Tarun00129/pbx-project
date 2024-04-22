const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
const importExcel = express();

importExcel.use(bodyParser.json());
console.log('inside import file');

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploadExcelImport/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

var upload = multer({ //multer settings
    storage: storage
}).single('file');

/**API path that will upload the files */
importExcel.post('/uploadCsv', function (req, res) {
    console.log('inside apiiii');
    upload(req, res, function (err) {
        var data = req.body;
        console.log(data);
        console.log(req.file);
        console.log('inside upload function');
        if (err) {
            console.log('if error occurs');
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        /** Multer gives us file info in req.file object */
        if (!req.file) {
            res.json({ error_code: 1, err_desc: "No file passed" });
            return;
        }
        /** Check the extension of the incoming file and
         *  use the appropriate module
         */
        console.log('file passed');
        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx'
            || req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'csv') {
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }

        if (data.type == 'advance') {
            console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders: true
                }, function (err, result) {
                    console.log('$$$$$$$$$$$$$$');
                    if (err) {
                        return res.json({ error_code: 1, err_desc: err, data: null });
                    }

                    console.log('data@@@@@@@@', result);
                    let validArr = []; let invalidArr = [];

                    for (let i = 0; i < result.length; i++) {
                        let email = result[i].email != '' ? validateEmailAddress(result[i].email) : false;
                        let mobile = result[i].phone_number1 != '' ? validateMobile(result[i].phone_number1) : false;
                        let mobile1 = validateMobile(result[i].phone_number2);
                        let conCode = result[i].country_code != '' ? validateCountryCode(result[i].country_code) : false;
                        if (email && (mobile && mobile1) && conCode && result[i].name != '') {
                            validArr.push(result[i]);
                        } else {
                            invalidArr.push(result[i]);
                        }
                    }
                    console.log('validArr====', validArr);
                    console.log('invalidArr====', invalidArr);
                    let count = 0;
                    for (let j = 0; j < validArr.length; j++) {
                        count = count + 1;
                        knex.select('id as country_id', 'phonecode as country_code').from(table.tbl_Country)
                            .where('phonecode', '=', "" + validArr[j].country_code + "")
                            .then((response) => {
                                console.log('ee==', response.length);
                                if (response.length > 0) {
                                    let cont = Object.values(JSON.parse(JSON.stringify(response)));
                                    console.log('cont====', cont);
                                    let countryId = cont[0].country_id;
                                    let countryCode = cont[0].country_code;
                                    let phno1 = '+' + countryCode + validArr[j].phone_number1;
                                    let phno2 = validArr[j].phone_number2 != '' ? '+' + countryCode + validArr[j].phone_number2 : '';

                                    // delete validArr[j]['country_code']; //delet bcz we dont have country code in contact table
                                    if (data.role == '1') {
                                        knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                            .where('phone_number1', '=', "" + phno1 + "").orWhere('phone_number2', '=', "" + phno1 + "")
                                            .andWhere('customer_id', '=', "" + data.customer_id + "").andWhere('extension_id', '=', 0)
                                            .then((response) => {
                                                console.log('222222222222');
                                                console.log('hhhhh=', response.length);
                                                if (response.length == 0) {
                                                    console.log('if p1 not exist');
                                                    if (phno2 != '') {
                                                        knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                                            .where('phone_number1', '=', "" + phno1 + "").orWhere('phone_number2', '=', "" + phno1 + "")
                                                            .andWhere('customer_id', '=', "" + data.customer_id + "").andWhere('extension_id', '=', 0)
                                                            .then((response1) => {
                                                                console.log('4444444444444');
                                                                console.log('rrrrrrrrr=', response1.length);
                                                                if (response1.length == 0) {
                                                                    knex(table.tbl_Contact_list).insert({
                                                                        name: "" + validArr[j].name + "", email: "" + validArr[j].email + "", phone_number1: "" + phno1 + "",
                                                                        phone_number2: "" + phno2 + "", organization: "" + validArr[j].organization + "",
                                                                        designation: "" + validArr[j].designation + "", customer_id: "" + data.customer_id + "", extension_id: "" + data.extension_id + "",
                                                                        country_id: "" + countryId + "", status: "1"
                                                                    }).then((response) => {
                                                                        if (response.length > 0) {
                                                                            res.json({
                                                                                response: response,
                                                                                notInsertedData: invalidArr
                                                                            });
                                                                        } else {
                                                                            res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists' });
                                                                        }
                                                                    }).catch((err) => { { console.log(err); throw err } });
                                                                } else {
                                                                    console.log('1no insertion- value already exists');
                                                                    invalidArr.push(validArr[j]);
                                                                    res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists', value: invalidArr });
                                                                }
                                                            }).catch((err) => { { console.log(err); throw err } });
                                                    } else {
                                                        knex(table.tbl_Contact_list).insert({
                                                            name: "" + validArr[j].name + "", email: "" + validArr[j].email + "", phone_number1: "" + phno1 + "",
                                                            phone_number2: "" + phno2 + "", organization: "" + validArr[j].organization + "",
                                                            designation: "" + validArr[j].designation + "", customer_id: "" + data.customer_id + "", extension_id: "" + data.extension_id + "",
                                                            country_id: "" + countryId + "", status: "1"
                                                        }).then((response) => {
                                                            if (response.length > 0) {
                                                                res.json({
                                                                    response: response,
                                                                    notInsertedData: invalidArr
                                                                });
                                                            } else {
                                                                console.log('2no insertion- value already exists');
                                                                invalidArr.push(validArr[j]);
                                                                res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists', value: invalidArr });
                                                            }
                                                        }).catch((err) => { { console.log(err); throw err } });
                                                    }
                                                } else {
                                                    console.log('3no insertion- value already exists');
                                                    console.log(validArr[j]);
                                                    invalidArr.push(validArr[j]);
                                                    console.log(invalidArr);
                                                    console.log(invalidArr.length);
                                                    console.log('count========', count);
                                                    if (count == invalidArr.length) {
                                                        res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists', value: invalidArr });
                                                    }
                                                }
                                            }).catch((err) => { { console.log(err); throw err } });
                                    } else if (data.role == '6') {
                                        knex(table.tbl_Extension_master).select('customer_id').where('id', '=', "" + data.extension_id + "")
                                            .then((response) => {
                                                if (response.length >= 0) {
                                                    let cust = Object.values(JSON.parse(JSON.stringify(response)));
                                                    console.log('cust====', cust);
                                                    let custId = cust[0].customer_id;
                                                    knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                                        .where('phone_number1', '=', "" + phno1 + "").orWhere('phone_number2', '=', "" + phno1 + "")
                                                        .andWhere('customer_id', '=', "" + custId + "").andWhere('extension_id', '=', "" + data.extension_id + "")
                                                        .then((response) => {
                                                            console.log('222222222222');
                                                            console.log('hhhhh=', response.length);
                                                            if (response.length == 0) {
                                                                console.log('if p1 not exist');
                                                                if (phno2 != '') {
                                                                    knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                                                        .where('phone_number1', '=', "" + phno2 + "").orWhere('phone_number2', '=', "" + phno2 + "")
                                                                        .andWhere('customer_id', '=', "" + custId + "").andWhere('extension_id', '=', "" + data.extension_id + "")
                                                                        .then((response1) => {
                                                                            console.log('4444444444444');
                                                                            console.log('rrrrrrrrr=', response1.length);
                                                                            if (response1.length == 0) {
                                                                                knex(table.tbl_Contact_list).insert({
                                                                                    name: "" + validArr[j].name + "", email: "" + validArr[j].email + "", phone_number1: "" + phno1 + "",
                                                                                    phone_number2: "" + phno2 + "", organization: "" + validArr[j].organization + "",
                                                                                    designation: "" + validArr[j].designation + "", customer_id: "" + custId + "", extension_id: "" + data.extension_id + "",
                                                                                    country_id: "" + countryId + "", status: "1"
                                                                                }).then((response) => {
                                                                                    if (response.length > 0) {
                                                                                        res.json({
                                                                                            response: response,
                                                                                            notInsertedData: invalidArr
                                                                                        });
                                                                                    } else {
                                                                                        res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists' });
                                                                                    }
                                                                                }).catch((err) => { { console.log(err); throw err } });
                                                                            } else {
                                                                                console.log('1no insertion- value already exists');
                                                                                invalidArr.push(validArr[j]);
                                                                                res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists', value: invalidArr });
                                                                            }
                                                                        }).catch((err) => { { console.log(err); throw err } });
                                                                } else {
                                                                    knex(table.tbl_Contact_list).insert({
                                                                        name: "" + validArr[j].name + "", email: "" + validArr[j].email + "", phone_number1: "" + phno1 + "",
                                                                        phone_number2: "" + phno2 + "", organization: "" + validArr[j].organization + "",
                                                                        designation: "" + validArr[j].designation + "", customer_id: "" + custId + "", extension_id: "" + data.extension_id + "",
                                                                        country_id: "" + countryId + "", status: "1"
                                                                    }).then((response) => {
                                                                        if (response.length > 0) {
                                                                            res.json({
                                                                                response: response,
                                                                                notInsertedData: invalidArr
                                                                            });
                                                                        } else {
                                                                            console.log('2no insertion- value already exists');
                                                                            invalidArr.push(validArr[j]);
                                                                            res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists', value: invalidArr });
                                                                        }
                                                                    }).catch((err) => { { console.log(err); throw err } });
                                                                }
                                                            } else {
                                                                console.log('3no insertion- value already exists');
                                                                console.log(validArr[j]);
                                                                invalidArr.push(validArr[j]);
                                                                console.log(invalidArr);
                                                                console.log(invalidArr.length);
                                                                res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists', value: invalidArr });
                                                            }
                                                        }).catch((err) => { { console.log(err); throw err } });
                                                } else {
                                                    invalidArr.push(validArr[j]);
                                                    res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists', value: invalidArr });
                                                }
                                            }).catch((err) => { { console.log(err); throw err } });
                                    }
                                } else {
                                    invalidArr.push(validArr[j]);
                                    res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists', value: invalidArr });
                                }
                            }).catch((err) => { { console.log(err); throw err } });
                    }
                    if(invalidArr.length == result.length){
                        res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                    }
                });
            } catch (e) {
                res.json({ error_code: 1, err_desc: "Corupted excel file" });
            }
        } else if (data.type == 'basic') {
            console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
            let customer_id = data['role'] == '1' ? data['customer_id'] : data['extension_id'];
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders: true
                }, function (err, result) {
                    console.log('$$$$$$$$$$$$$$');
                    if (err) {
                        return res.json({ error_code: 1, err_desc: err, data: null });
                    }

                    console.log('data@@@@@@@@', result);
                    let validArr = []; let invalidArr = [];
                    for (let i = 0; i < result.length; i++) {
                        let email = result[i].email != '' ? validateEmailAddress(result[i].email) : false;
                        let mobile = result[i].phone_number1 != '' ? validateMobile(result[i].phone_number1) : false;
                        let mobile1 = validateMobile(result[i].phone_number2);
                        if (email && (mobile && mobile1) && result[i].name != '') {
                            validArr.push(result[i]);
                        } else {
                            invalidArr.push(result[i]);
                        }
                    }
                    console.log('validArr====', validArr);
                    console.log('invalidArr====', invalidArr);
                   if(data['type'] == '1'){  // customer contact
                    knex.select('country_id', 'country_code').from(table.tbl_Customer)
                        .where('id', '=', "" + data.customer_id + "")
                        .then((response) => {
                            console.log('response')
                            console.log(response)
                            if (response.length > 0) {
                                let customer = Object.values(JSON.parse(JSON.stringify(response)));
                                let countryId = customer[0].country_id;
                                let countryCode = customer[0].country_code;
                                let validArr1 = validArr.map(function (el) {
                                    var o = Object.assign({}, el);
                                    o.name = el.name;
                                    o.email = el.email;
                                    o.customer_id = data.customer_id;
                                    o.extension_id = data.extension_id;
                                    o.country_id = countryId;
                                    o.phone_number1 = countryCode + el.phone_number1;
                                    o.phone_number2 = el.phone_number2 != '' ? countryCode + el.phone_number2 : '';
                                    o.organization = el.organization;
                                    o.designation = el.designation;
                                    return o;
                                });
                                console.log('1111111111111');
                                for (let i = 0; i < validArr1.length; i++) {
                                    console.log(knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                        .where('phone_number1', '=', validArr1[i].phone_number1)
                                        .orWhere('phone_number2', '=', validArr1[i].phone_number1).toString());
                                    knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                        .where('phone_number1', '=', validArr1[i].phone_number1)
                                        .orWhere('phone_number2', '=', validArr1[i].phone_number1)
                                        .then((response) => {
                                            console.log('222222222222');
                                            console.log('hhhhh=', response.length);
                                            if (response.length == 0) {
                                                console.log('if p1 not exist');
                                                if (validArr1[i].phone_number2 != '') {
                                                    knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                                        .where('phone_number1', '=', validArr1[i].phone_number2)
                                                        .orWhere('phone_number2', '=', validArr1[i].phone_number2)
                                                        .then((response1) => {
                                                            console.log('4444444444444');
                                                            console.log('rrrrrrrrr=', response1.length);
                                                            if (response1.length == 0) {
                                                                knex(table.tbl_Contact_list).insert(validArr1[i])
                                                                    .then((response) => {
                                                                        if (response.length > 0) {
                                                                            res.json({
                                                                                response
                                                                            });
                                                                        } else {
                                                                            res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error' });
                                                                        }
                                                                    }).catch((err) => { { console.log(err); throw err } });
                                                            } else {
                                                                console.log('no insertion');
                                                                invalidArr.push(validArr1[i]);
                                                                res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                                                            }
                                                        }).catch((err) => { { console.log(err); throw err } });
                                                } else {
                                                    knex(table.tbl_Contact_list).insert(validArr1[i])
                                                        .then((response) => {
                                                            if (response.length > 0) {
                                                                res.json({
                                                                    response
                                                                });
                                                            } else {
                                                                res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error' });
                                                            }
                                                        }).catch((err) => { { console.log(err); throw err } });
                                                }
                                            } else {
                                                console.log('no insertion- value already exists');
                                                invalidArr.push(validArr1[i]);
                                                res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                                            }
                                        }).catch((err) => { { console.log(err); throw err } });
                                }
                                if(invalidArr.length == result.length){
                                    res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                                }
                            } else {
                                res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error',  value: invalidArr });
                            }
                        }).catch((err) => { { console.log(err); throw err } });
                    }else{  //  extension contact
                        knex.select('c.country_id', 'c.country_code', 'c.id').from(table.tbl_Extension_master + ' as ext')
                        .leftJoin(table.tbl_Customer + ' as c','c.id','ext.customer_id')
                        .where('ext.id', '=', "" + data.extension_id + "")
                        .then((response) => {
                            if (response.length > 0) {
                                let customer = Object.values(JSON.parse(JSON.stringify(response)));
                                let countryId = customer[0].country_id;
                                let countryCode = customer[0].country_code;
                                let validArr1 = validArr.map(function (el) {
                                    var o = Object.assign({}, el);
                                    o.name = el.name;
                                    o.email = el.email;
                                    o.customer_id = customer[0].id;
                                    o.extension_id = data.extension_id;
                                    o.country_id = countryId;
                                    o.phone_number1 = countryCode + el.phone_number1;
                                    o.phone_number2 = el.phone_number2 != '' ? countryCode + el.phone_number2 : '';
                                    o.organization = el.organization;
                                    o.designation = el.designation;
                                    return o;
                                });
                                console.log('1111111111111');
                                for (let i = 0; i < validArr1.length; i++) {
                                    console.log(knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                        .where('phone_number1', '=', validArr1[i].phone_number1)
                                        .orWhere('phone_number2', '=', validArr1[i].phone_number1).toString());
                                    knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                        .where('phone_number1', '=', validArr1[i].phone_number1)
                                        .orWhere('phone_number2', '=', validArr1[i].phone_number1)
                                        .then((response) => {
                                            console.log('222222222222');
                                            console.log('hhhhh=', response.length);
                                            if (response.length == 0) {
                                                console.log('if p1 not exist');
                                                if (validArr1[i].phone_number2 != '') {
                                                    knex(table.tbl_Contact_list).select('phone_number1', 'phone_number2')
                                                        .where('phone_number1', '=', validArr1[i].phone_number2)
                                                        .orWhere('phone_number2', '=', validArr1[i].phone_number2)
                                                        .then((response1) => {
                                                            console.log('4444444444444');
                                                            console.log('rrrrrrrrr=', response1.length);
                                                            if (response1.length == 0) {
                                                                knex(table.tbl_Contact_list).insert(validArr1[i])
                                                                    .then((response) => {
                                                                        if (response.length > 0) {
                                                                            res.json({
                                                                                response
                                                                            });
                                                                        } else {
                                                                            res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error' });
                                                                        }
                                                                    }).catch((err) => { { console.log(err); throw err } });
                                                            } else {
                                                                console.log('no insertion');
                                                                invalidArr.push(validArr1[i]);
                                                                res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                                                            }
                                                        }).catch((err) => { { console.log(err); throw err } });
                                                } else {
                                                    knex(table.tbl_Contact_list).insert(validArr1[i])
                                                        .then((response) => {
                                                            if (response.length > 0) {
                                                                res.json({
                                                                    response
                                                                });
                                                            } else {
                                                                res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error' });
                                                            }
                                                        }).catch((err) => { { console.log(err); throw err } });
                                                }
                                            } else {
                                                console.log('no insertion- value already exists');
                                                invalidArr.push(validArr1[i]);
                                                res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                                            }
                                        }).catch((err) => { { console.log(err); throw err } });
                                }
                                if(invalidArr.length == result.length){
                                    res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                                }
                            } else {
                                res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error',  value: invalidArr });
                            }
                        }).catch((err) => { { console.log(err); throw err } });
                    }
                });
            } catch (e) {
                res.json({ error_code: 1, err_desc: "Corupted excel file" });
            }
        } else if (data.type == "advanceCallPlanRate") {
            console.log('callllllllllllllllllllllllllllllll');
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders: true
                }, async function (err, result) {
                    console.log('$$$$$$$$$$$$$$');
                    if (err) {
                        return res.json({ error_code: 1, err_desc: err, data: null });
                    }

                    console.log('data@@@@@@@@', result);
                    var validArr = []; var invalidArr = [];
                    for (let i = 0; i < result.length; i++) {
                        let dialP = result[i].dial_prefix != '' ? validateCountryCode(result[i].dial_prefix) : false;
                        let sellingDur = result[i].selling_min_duration != 0 ? validateSellingDur(result[i].selling_min_duration) : true;
                        let sellingBill = validateSellingBill(result[i].selling_billing_block) ? true : false;
                        let callPlan =   result[i]['call_plan'] != '' ? await validateCallPlan(result[i]['call_plan']) : false;
                        let planType =   result[i]['plan_type'] != '' ? result[i]['plan_type'] == '0' ? true : false : false;
                        var phonecode =   result[i].dial_prefix != '' ? await getCountryIdUsingdialPrefix(result[i]['dial_prefix']) : false;
                        
                        console.log('planType====', planType);
                        console.log('dialP====', dialP);
                        console.log('sellingDur====', sellingDur);
                        console.log('sellingBill====', sellingBill);
                        console.log('callPlan====', callPlan);
                        console.log('result[i].buying_rate != ====', result[i].buying_rate != '' );
                        console.log('result[i].gateway != ====', result[i].gateway != '');
                        console.log('phonecode====', (phonecode != '' && phonecode != false));
                        console.log('result[i].selling_rate != ====', result[i].selling_rate != '');

                        if (planType && dialP && sellingDur && sellingBill && callPlan && result[i].buying_rate != '' && result[i].selling_rate != '' && result[i].gateway != '' && (phonecode != '' && phonecode != false)) {
                            validArr.push(result[i]);
                        } else {
                            invalidArr.push(result[i]);
                        }
                    }
                    console.log('validArr====', validArr);
                    console.log('invalidArr====', invalidArr);
                    // console.log(knex.raw("Call pbx_save_callplanrate(" + validArr + ")").toString());
                    for (let i = 0; i < validArr.length; i++) {
                        validArr[i].dial_prefix = '+' + validArr[i].dial_prefix ;
                        knex.select('id').from(table.tbl_Call_Plan)
                            .where('name', '=', "" + validArr[i].call_plan + "")
                            .then((response) => {
                                if (response.length > 0) {
                                    console.log(' inside callPlanidddddddddd');
                                    let callPlan = Object.values(JSON.parse(JSON.stringify(response)));
                                    let callPlanId = callPlan[0].id
                                    knex.select('g.id').from(table.tbl_Gateway + ' as g')
                                        .leftOuterJoin(table.tbl_Provider + ' as p', 'p.id', 'g.provider_id')
                                        .where('provider', '=', "" + validArr[i].gateway + "")
                                        .then((response) => {
                                            if (response.length > 0) {
                                                console.log(' inside gidddddddatewayddd');
                                                let gateway = Object.values(JSON.parse(JSON.stringify(response)));
                                                let gatewayId = gateway[0].id

                                                knex.select('id').from(table.tbl_Call_Plan_Rate)
                                                    .where('dial_prefix', '=', "" + validArr[i].dial_prefix + "")
                                                    .andWhere('gateway_id', '=', "" + gatewayId + "")
                                                    .then((response) => {
                                                        if (response.length == 0) {
                                                            console.log(' inside if dial prefix exist');
                                                            console.log(knex(table.tbl_Call_Plan_Rate).insert({
                                                                call_plan_id: "" + callPlanId + "", dial_prefix: "" + validArr[i].dial_prefix + "", buying_rate: "" + validArr[i].buying_rate + "",
                                                                selling_rate: "" + validArr[i].selling_rate + "", selling_min_duration: "" + validArr[i].selling_min_duration + "",
                                                                selling_billing_block: "" + validArr[i].selling_billing_block + "", gateway_id: "" + gatewayId + "", status: "1",  plan_type : ""+validArr[i].plan_type + "",
                                                                phonecode : phonecode}).toString());

                                                            knex(table.tbl_Call_Plan_Rate).insert({
                                                                call_plan_id: "" + callPlanId + "", dial_prefix: "" + validArr[i].dial_prefix + "", buying_rate: "" + validArr[i].buying_rate + "",
                                                                selling_rate: "" + validArr[i].selling_rate + "", selling_min_duration: "" + validArr[i].selling_min_duration + "",
                                                                selling_billing_block: "" + validArr[i].selling_billing_block + "", gateway_id: "" + gatewayId + "", status: "1", plan_type : ""+validArr[i].plan_type + "",
                                                                phonecode : phonecode
                                                            }).then((response) => {
                                                                if (response.length > 0) {
                                                                    res.json({
                                                                        response: response
                                                                    });
                                                                } else {
                                                                    res.status(401).send({ error: 'Unauthorized', message: 'No insertion- value already exists' });
                                                                }
                                                            }).catch((err) => {
                                                                 res.status(401).send({ error: 'Unauthorized', message: 'No insertion- error get during insert call plan rate data' });
                                                                 console.log(err); throw err 
                                                                 });
                                                        } else {
                                                            console.log(' inside not if dial prefix exist');
                                                            console.log('validArrrrr', validArr[i]);
                                                            invalidArr.push(validArr[i]);
                                                            console.log('invalidrrrrrrrrrArr', invalidArr);
                                                            res.status(401).send({ error: 'Unauthorized', message: 'Call Plan Rate Creation error1', value: invalidArr });
                                                        }
                                                    }).catch((err) => { { console.log(err); throw err } });
                                            } else {
                                                console.log(' ggggggggggginside not if dial prefix exist');
                                                console.log('gggggggggvalidArrrrr', validArr[i]);
                                                invalidArr.push(validArr[i]);
                                                console.log('gggggginvalidrrrrrrrrrArr', invalidArr);
                                                res.status(401).send({ error: 'Unauthorized', message: 'Call Plan Rate Creation error2', value: invalidArr });
                                            }
                                        }).catch((err) => { { console.log(err); throw err } });
                                } else {
                                    console.log(' cccccccccccccccggggggggggginside not if dial prefix exist');
                                    console.log('ccccccccccccgggggggggvalidArrrrr', validArr[i]);
                                    invalidArr.push(validArr[i]);
                                    console.log('ccccccccccccccgggggginvalidrrrrrrrrrArr', invalidArr);
                                    res.status(401).send({ error: 'Unauthorized', message: 'Call Plan Rate Creation error3', value: invalidArr });
                                }
                            }).catch((err) => { { console.log(err); throw err } });
                            console.log(' 1111111cccccccccccccccggggggggggginside not if dial prefix exist');
                            console.log('1111111111ccccccccccccgggggggggvalidArrrrr', validArr[i]);
                          //  invalidArr.push(validArr[i]);
                            console.log('1111111111ccccccccccccccgggggginvalidrrrrrrrrrArr', invalidArr);
                            //res.status(401).send({ error: 'Unauthorized', message: 'Call Plan Rate Creation error4', value: invalidArr });
                    }
                    
                    if(invalidArr.length == result.length){
                        res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                    }
                });
            } catch (e) {
                res.json({ error_code: 1, err_desc: "Corrupted excel file" });
            }
        } else if(data.type == 'basicDID'){   // DID IMPORT CODE
            console.log('sssssssssssssssss');
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders: true
                }, async function  (err, result) {
                    console.log('$$$$$$$$$$$$$$');
                    if (err) {
                        return res.json({ error_code: 1, err_desc: err, data: null });
                    }

                    console.log('data@@@@@@@@', result);
                    let validArr = []; let invalidArr = [];
                     for (let i = 0; i < result.length; i++) {
                       let didNumber =   result[i]['did number'] != ''? await validateDIDNumber(result[i]['did number']):false;
                       let billingType =   result[i]['billing type'] != ''? await validateBillingType(result[i]['billing type']):false;
                       let didGroup =   result[i]['did group'] != ''? await validateDIDgroup(result[i]['did group']):false;
                       let provider =   result[i]['provider'] != ''? await validateProvider(result[i]['provider']):false;
                       let country =  result[i]['country'] != ''? await validateCountry(result[i]['country']):false;
                       let maxConcurrentCall =  result[i]['max cc'] != ''? await validatemaxConcurrentCall(result[i]['max cc']):false;
                       let connectCharge =  result[i]['connect charge'] != ''? await validatemaxConcurrentCall(result[i]['connect charge']):false;
                       let monthlyRate =  result[i]['monthly rate'] != ''? await validatemaxConcurrentCall(result[i]['monthly rate']):false;
                       let sellingRate =  result[i]['selling rate'] != ''? await validatemaxConcurrentCall(result[i]['selling rate']):false;
                        
                        console.log(didNumber,billingType,didGroup,provider,country,maxConcurrentCall,connectCharge,monthlyRate,sellingRate);
                        if (didNumber && billingType && didGroup && provider && country &&  maxConcurrentCall && connectCharge && (result[i]['billing type'] == '1'? (monthlyRate && sellingRate) : result[i]['billing type'] == '2' ? monthlyRate:result[i]['billing type'] == '3'? sellingRate: true )) {
                            validArr.push(result[i]);
                        } else {
                            invalidArr.push(result[i]);
                        }
                    }
                    console.log('validArr====', validArr);
                    console.log('invalidArr====', invalidArr);
                    var count = 0;
                   //point need to be clear activated, did type(tollfree, number)

                        for (let i = 0; i < validArr.length; i++) {
                            let providerId = await getProviderId(validArr[i]['provider']);
                            let countryId = await getCountryId(validArr[i]['country']);
                            let sellingRate = validArr[i]['selling rate'] ? validArr[i]['selling rate']: 0;
                            let monthlyRate = validArr[i]['monthly rate'] ? validArr[i]['monthly rate']: 0;
                           
                            console.log('providerId====', providerId);
                            console.log('countryId====', countryId);
                         await knex(table.tbl_DID).insert({
                                did: "" + validArr[i]['did number'] + "", billingtype: "" + validArr[i]['billing type'] + "", provider_id: "" + providerId + "",
                                country_id: "" + countryId + "", max_concurrent: validArr[i]['max cc'], activated: "" + "1" + "",
                                customer_id: data.customer_id, fixrate: monthlyRate, connection_charge: validArr[i]['connect charge'],
                                selling_rate: sellingRate, did_type: "" + "1" + "", create_method: "2", did_group: validArr[i]['did group']
                            }).then((response) => {
                                count ++;
                                console.log('count',count)
                                if(count == result.length){
                                    res.json({  response });
                                    return; 
                                }
                                if(count == validArr.length){
                                    res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                                }
                            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message,status:'409' }); throw err });
                        }
                        if(invalidArr.length == result.length){
                            res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                        }
                });
            } catch (e) {
                res.json({ error_code: 1, err_desc: "Corupted excel file" });
            }
        } else if(data.type  == 'basicCallPlanRate'){ //advanceCallPlanRate basicCallPlanRate
            console.log('basicCallPlanRate');
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders: true
                }, async function (err, result) {
                    console.log('$$$$$$$$$$$$$$');
                    if (err) {
                        return res.json({ error_code: 1, err_desc: err, data: null });
                    }

                    console.log('data@@@@@@@@', result);
                    var validArr = []; var invalidArr = [];
                    for (let i = 0; i < result.length; i++) {
                        let dialP = result[i].dial_prefix != '' ? validateCountryCode(result[i].dial_prefix) : false;
                        let sellingDur = '';
                        let sellingBill = '';
                        let callPlan =   result[i]['call_plan'] != '' ? await validateCallPlan(result[i]['call_plan']) : false;
                        let planType =   result[i]['plan_type'] != '' ? result[i]['plan_type'] != '0' ? true : false : false;
                        var phonecode =   result[i].dial_prefix != '' ? await getCountryIdUsingdialPrefix(result[i]['dial_prefix']) : false;
                        var is_group =   result[i].is_group != '' ? result[i].is_group == 1 ? 1 : 0 : 0;
                        var group_name =   is_group == true ? await getGroupId(result[i]['group_name'])  : 0;
                        var talktime_minutes =  is_group == true ? 0 : result[i].talktime_minutes != '' ? result[i].talktime_minutes  : 0;

                        console.log('planType====', planType);
                        console.log('dialP====', dialP);
                        console.log('sellingDur====', sellingDur);
                        console.log('sellingBill====', sellingBill);
                        console.log('callPlan====', callPlan);
                        console.log('result[i].buying_rate != ====', result[i].buying_rate != '' );
                        console.log('result[i].gateway != ====', result[i].gateway != '');
                        console.log('phonecode====', (phonecode != '' && phonecode != false));
                        console.log('result[i].selling_rate != ====', result[i].selling_rate != '');
                        console.log('group_name', group_name);

                        if (planType && dialP && callPlan && result[i].buying_rate != '' && result[i].selling_rate != '' && result[i].gateway != '' && (phonecode != '' && phonecode != false) && (group_name != '' && group_name != false)) {
                            validArr.push(result[i]);
                        } else {
                            invalidArr.push(result[i]);
                        }
                    }
                    console.log('validArr====', validArr);
                    console.log('invalidArr====', invalidArr);
                    // console.log(knex.raw("Call pbx_save_callplanrate(" + validArr + ")").toString());
                    for (let i = 0; i < validArr.length; i++) {
                        validArr[i].dial_prefix = '+' + validArr[i].dial_prefix ;
                        knex.select('id').from(table.tbl_Call_Plan)
                            .where('name', '=', "" + validArr[i].call_plan + "")
                            .then((response) => {
                                if (response.length > 0) {
                                    console.log(' inside callPlanidddddddddd');
                                    let callPlan = Object.values(JSON.parse(JSON.stringify(response)));
                                    let callPlanId = callPlan[0].id
                                    knex.select('g.id').from(table.tbl_Gateway + ' as g')
                                        .leftOuterJoin(table.tbl_Provider + ' as p', 'p.id', 'g.provider_id')
                                        .where('provider', '=', "" + validArr[i].gateway + "")
                                        .then((response) => {
                                            if (response.length > 0) {
                                                console.log(' inside gidddddddatewayddd');
                                                let gateway = Object.values(JSON.parse(JSON.stringify(response)));
                                                let gatewayId = gateway[0].id

                                                knex.select('id').from(table.tbl_Call_Plan_Rate)
                                                    .where('dial_prefix', '=', "" + validArr[i].dial_prefix + "")
                                                    .andWhere('gateway_id', '=', "" + gatewayId + "")
                                                    .then((response) => {
                                                        if (response.length == 0) {
                                                            console.log(' inside if dial prefix exist');
                                                            
                                                            let areaCode = '';
                                                            console.log(knex.raw("Call pbx_save_callplanrate(" + null + "," + callPlanId + ",'" + validArr[i].dial_prefix + "'," + validArr[i].buying_rate + ",\
                                                            " + validArr[i].selling_rate + "," + 0 + "," + 0 + ",'1', " + gatewayId +  "," + phonecode +  ",'" + areaCode + "','" + is_group + "'," + group_name + "," + talktime_minutes  + "," + 0 + ",'" + validArr[i].plan_type +"')").toString());
                                                           
                                                            knex.raw("Call pbx_save_callplanrate(" + null + "," + callPlanId + ",'" + validArr[i].dial_prefix + "'," + validArr[i].buying_rate + ",\
                                                            " + validArr[i].selling_rate + "," + 0 + "," + 0 + ",'1', " + gatewayId +  "," + phonecode +  ",'" + areaCode + "','" + is_group + "'," + group_name + "," + talktime_minutes  + "," + 0 + ",'" + validArr[i].plan_type +"')")
                                                                .then((response) => {
                                                                    if (response) {
                                                                        res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
                                                                    }
                                                                }).catch((err) => {
                                                                    res.send({ code: err.errno, message: err.sqlMessage });
                                                                });
                                                        } else {
                                                            console.log(' inside not if dial prefix exist');
                                                            console.log('validArrrrr', validArr[i]);
                                                            invalidArr.push(validArr[i]);
                                                            console.log('invalidrrrrrrrrrArr', invalidArr);
                                                            res.status(401).send({ error: 'Unauthorized', message: 'Call Plan Rate Creation error1', value: invalidArr });
                                                        }
                                                    }).catch((err) => { { console.log(err); throw err } });
                                            } else {
                                                console.log(' ggggggggggginside not if dial prefix exist');
                                                console.log('gggggggggvalidArrrrr', validArr[i]);
                                                invalidArr.push(validArr[i]);
                                                console.log('gggggginvalidrrrrrrrrrArr', invalidArr);
                                                res.status(401).send({ error: 'Unauthorized', message: 'Call Plan Rate Creation error2', value: invalidArr });
                                            }
                                        }).catch((err) => { { console.log(err); throw err } });
                                } else {
                                    console.log(' cccccccccccccccggggggggggginside not if dial prefix exist');
                                    console.log('ccccccccccccgggggggggvalidArrrrr', validArr[i]);
                                    invalidArr.push(validArr[i]);
                                    console.log('ccccccccccccccgggggginvalidrrrrrrrrrArr', invalidArr);
                                    res.status(401).send({ error: 'Unauthorized', message: 'Call Plan Rate Creation error3', value: invalidArr });
                                }
                            }).catch((err) => { { console.log(err); throw err } });
                            console.log(' 1111111cccccccccccccccggggggggggginside not if dial prefix exist');
                            console.log('1111111111ccccccccccccgggggggggvalidArrrrr', validArr[i]);
                          //  invalidArr.push(validArr[i]);
                            console.log('1111111111ccccccccccccccgggggginvalidrrrrrrrrrArr', invalidArr);
                            //res.status(401).send({ error: 'Unauthorized', message: 'Call Plan Rate Creation error4', value: invalidArr });
                    }
                    
                    if(invalidArr.length == result.length){
                        res.status(401).send({ error: 'Unauthorized', message: 'Contact List Creation error', value: invalidArr });
                    }
                });
            } catch (e) {
                res.json({ error_code: 1, err_desc: "Corrupted excel file" });
            }
        }
        console.log('successflllllllll');
    });
});

function validateEmailAddress(email) {
    var expression = /^(("[\w-\s]+")|([a-zA-Z0-9]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[a-zA-Z0-9-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/;
    if (expression.test(String(email).toLowerCase())) {
        return true;
    } else {
        return false;
    }
}

function validateMobile(mobilenumber) {
    var regmm = /^([1-9][0-9]{9})*$/;
    var regmob = new RegExp(regmm);
    if (regmob.test(mobilenumber)) {
        return true;
    } else {
        return false;
    }
}

function validateCountryCode(code) {
    var regmm = /^[1-9][\d]{0,4}$/;
    var regmob = new RegExp(regmm);
    if (regmob.test(code)) {
        return true;
    } else {
        return false;
    }
}

function validateSellingDur(code) {
    var regmm = /^[0-9][\d]{0,1}$/;
    var regmob = new RegExp(regmm);
    if (regmob.test(code)) {
        return true;
    } else {
        return false;
    }
}

function validateSellingBill(code) {
    var regmm = /^[1-9][\d]{0,2}$/;
    var regmob = new RegExp(regmm);
    if (regmob.test(code)) {
        return true;
    } else {
        return false;
    }
}

function validateDIDNumber(number) {
    console.log(number);
    console.log(typeof number);
    if (number.length >= 5) {
        return true;
    } else {
        return false;
    }
}

function validateBillingType(type) {
    if (type == 1 || type == 2 || type == 3 || type == 4) { // 1 = fixed per month + dialroute, 2 = fixed per month,  3 = dialroute, 4 = free
        return true;
    } else {
        return false;
    }
}

function validateDIDgroup(type) {
    if (type == 0 || type == 1 || type == 2 ) { // 0 = general, 1 = premium , 2 = private
        return true;
    } else {
        return false;
    }
}

function validatemaxConcurrentCall(data) {
    if (data >= 0  ) { 
        return true;
    } else {
        return false;
    }
}

async function  validateProvider(name) {
    console.log('comeeeee')
    var providerId = "";
    var returnResponse = false;
   await  knex.from(table.tbl_Provider).where('provider', "" + name + "")
        .select('id')
        .then((response) => {
            if (response.length === 1) {
                const providerData = response[0];
                providerId = providerData['id'];
                console.log(providerId);    
                console.log(providerId);  
                if (providerId == '' || providerId == undefined || providerId == null) { 
                  return  returnResponse =  false;
                } else {
                    return returnResponse =  true;
                    // return true;
                }  
            } else {

            }
        }).catch((err) => { console.log(err); throw err });   
    return returnResponse;
}

async function  getProviderId(name) {
    console.log('comeeeee')
    var providerId = "";
   await  knex.from(table.tbl_Provider).where('provider', "" + name + "")
        .select('id')
        .then((response) => {
            if (response.length === 1) {
                const providerData = response[0];
                providerId = providerData['id'];
                console.log(providerId);    
                if (providerId == '' || providerId == undefined || providerId == null) { 
                  return  providerId ;
                }
            } else {

            }
        }).catch((err) => { console.log(err); throw err });   
    return providerId;
}

async function  validateCountry(name) {
    var countryId = "";
    var returnResponse = false;
   await  knex.from(table.tbl_Country).where('name', "" + name + "")
        .select('id')
        .then((response) => {
            if (response.length === 1) {
                const providerData = response[0];
                countryId = providerData['id'];
                console.log(countryId);    
                if (countryId == '' || countryId == undefined || countryId == null) { 
                  return  returnResponse =  false;
                } else {
                    return returnResponse =  true;
                    // return true;
                }  
            } else {

            }
        }).catch((err) => { console.log(err); throw err });   
    return returnResponse;
}

async function  getCountryId(name) {
    var countryId = "";
   await  knex.from(table.tbl_Country).where('name', "" + name + "")
        .select('id')
        .then((response) => {
            if (response.length === 1) {
                const providerData = response[0];
                countryId = providerData['id'];
                console.log(countryId);    
                if (countryId == '' || countryId == undefined || countryId == null) { 
                  return  countryId ;
                } 
            } else {
               return null;
            }
        }).catch((err) => { console.log(err); throw err });   
    return countryId;
}

async function  validateCallPlan(call_plan) {
    var callPlanId = "";
    var returnResponse = false;
   await  knex.from(table.tbl_Call_Plan)
        .where('name', '=', "" + call_plan + "")
        .select('id')
        .then((response) => {
            if (response.length === 1) {
                const countryData = response[0];
                callPlanId = countryData['id'];
                if (callPlanId == '' || callPlanId == undefined || callPlanId == null) { 
                  return  returnResponse =  false;
                } else {
                    return returnResponse =  true;
                }  
            } else {

            }
        }).catch((err) => { console.log(err); throw err });   
    return returnResponse;
}

async function  getCountryIdUsingdialPrefix(dp) {
    var countryId = "";
   await  knex.from(table.tbl_Country).where('phonecode', "" + dp + "")
        .select('id')
        .then((response) => {
            if (response.length === 1) {
                const providerData = response[0];
                countryId = providerData['id'];
                console.log(countryId);    
                if (countryId == '' || countryId == undefined || countryId == null) { 
                  return  countryId = false;
                } 
            } else {
               return null;
            }
        }).catch((err) => { console.log(err); throw err });   
    return countryId;
}

async function  getGroupId(gname) {
    var gId = "";
    // var returnResponse = false;
   await knex.from(table.tbl_pbx_call_rate_group)
        .where('name', '=', "" + gname + "")
        .select('id')
        .then((response) => {
            console.log('||||||||||||||||||||||||||||',gname);
            console.log('||||||||||||||||||||||||||||',response);
            if (response.length === 1) {
                const groupData = response[0];
                gId = groupData['id'];
                if (gId == '' || gId == undefined || gId == null) { 
                  return  gId =  false;
                } 
            } else {
                gId =  false;
            }
        }).catch((err) => { console.log(err); throw err });   
    return gId;
}



module.exports = importExcel;