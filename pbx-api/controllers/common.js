const { knex } = require('../config/knex.db');
const table = require('../config/table.macros');

function getCountryList(req, res) {
    let id = req.query.id;
    if (typeof id == 'undefined' || typeof id == '') {
        knex.select().table(table.tbl_Country)
            .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else {
        knex.from(table.tbl_Country).where('id', "" + id + "")
            .select('*')
            .then((response) => {
                res.json({
                    response
                });
            }).catch((err) => { res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
}

function getTimeZone(req, res) {
    knex.select().table(table.tbl_Time_Zone)
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


function customerWiseCountry(req, res) {
    let id = parseInt(req.query.id);
    knex.select('s.id', 's.name', 's.phonecode')
        .from(table.tbl_Country + ' as s')
        .leftOuterJoin(table.tbl_Customer + ' as t', 's.id', 't.country_id')
        .leftOuterJoin(table.tbl_Extension_master + ' as e', 'e.customer_id', 't.id')
        .where('e.id', '=', "" + id + "")
        .then((response) => {
            if (response.length > 0) {
                res.json({
                    response
                });
            } 
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getProviders(req, res) {
    knex.select().table(table.tbl_Provider).orderBy('provider','asc')
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getIndiaStates(req, res){
    knex.select().table(table.tbl_indian_states).orderBy('id','asc')
    .then((response) => {
        res.json({
            response
        });
    }).catch((err) => { res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getCustomerCountry(req, res) {
    let id = parseInt(req.query.id);
   let sql= knex.select('s.id', 's.name', 's.phonecode')
        .from(table.tbl_Country + ' as s')
        .leftOuterJoin(table.tbl_Customer + ' as t', 's.id', 't.country_id')
        .where('t.id', '=', "" + id + "")
        console.log(sql.toQuery(),"------------country query");
        sql.then((response) => {
            if (response.length > 0) {
                res.json({
                    response
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

module.exports = { getCountryList, getTimeZone, customerWiseCountry, getProviders, getCustomerCountry, getIndiaStates };