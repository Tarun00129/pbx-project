const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

function createProvider(req, res) {
    var data = req.body.provider;
    knex(table.tbl_Provider).insert({
        provider: "" + data.provider + ""
    }).then((response) => {
        res.json({
            response
        });
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}

function updateProvider(req, res) {
    var data = req.body.provider;
    knex(table.tbl_Provider).where('id', '=', "" + data.id + "")
        .update({ provider: "" + data.provider + "" })
        .then((response) => {
            if (response === 1) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'Success', message: 'Provider updated' });
            }
        }).catch((err) => { console.log(err); throw err });
}

function verifyProvider(req, res) {
    let provider = req.body.provider;
    knex.from(table.tbl_Provider).where('provider', "" + provider + "")
        .select('id')
        .then((response) => {
            if (response.length >= 1) {
                res.json({
                    provider: response[0].id
                });
            } else {
                res.json({
                    provider: ''
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function deleteProvider(req, res) {
    let id = parseInt(req.query.id);
    knex.raw('Call pbx_delete_providers(' + id + ')').then((response) => {
        console.log(response[0][0][0]);
        if (response) {
            res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
        }
    }).catch((err) => {
        console.log('err=',err);
        res.send({ code: err.errno, message: err.sqlMessage });
    });
}

function isProviderInUse(req, res) {
    let id = parseInt(req.query.id);
    knex.select(knex.raw('count("p.id") as ids')).from(table.tbl_Provider + ' as p')
        .join(table.tbl_Gateway + ' as g', 'p.id', 'g.provider_id')
        .where('p.id', '=', id)
        .then((response) => {
            res.json({
                response
            });
        })
}

function getProviderById(req, res) {
    let id = parseInt(req.query.id);
    knex.select('provider').from(table.tbl_Provider)
        .where('id', '=', id)
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function viewDIDDetailsBasedOnDID(req, res) {
    let id = parseInt(req.query.id);
    var sql = knex.select('d.id', 'pro.provider','d.product_id', 'c.name as country', 'd.activated', 'd.reserved', 'd.customer_id', 'd.did', knex.raw('CONCAT((CONCAT("+",c.phonecode)), \' \',d.did) as didDisplay'), 'd.secondusedreal',
    'd.billingtype', 'd.fixrate', 'd.connection_charge', 'd.selling_rate', 'd.max_concurrent',knex.raw('IF (d.did_group = "0","General", IF (d.did_group = "1","Premium", IF (d.did_group = "2","Private","Parked"))) as did_group'), knex.raw('IF (d.did_type = "1","DID Number", IF (d.did_type = "2","DID Number","Tollfree Number")) as did_type'),
    knex.raw('IF (d.status = "0","Inactive","Active") as status'), 'u.company_name as company', 'd.customer_id','af.active_feature','dest.active_feature_id')
        .from(table.tbl_DID + ' as d')
        .leftJoin(table.tbl_Provider + ' as pro','d.provider_id','pro.id')
        .leftJoin(table.tbl_Country + ' as c', 'c.id', 'd.country_id')
        .leftJoin(table.tbl_Customer + ' as u', 'u.id', 'd.customer_id')
        .leftJoin(table.tbl_DID_Destination + ' as dest', 'd.id', 'dest.did_id')
        .leftJoin(table.tbl_DID_active_feature + ' as af', 'dest.active_feature_id', 'af.id')
        .where('d.provider_id',id)
        .orderBy('d.id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function viewProviderDetails(req, res) {
    var sql = knex.select('p.id', 'p.provider', knex.raw('GROUP_CONCAT(d.id) as did_id'), knex.raw('GROUP_CONCAT(d.status) as did_status'))
        .from(table.tbl_Provider + ' as p')
        .leftJoin(table.tbl_DID + ' as d','d.provider_id','p.id')
        .orderBy('p.id', 'desc')
        .groupBy('p.id');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

module.exports = {
    createProvider, verifyProvider, getProviderById, viewProviderDetails, deleteProvider, updateProvider, isProviderInUse, 
    viewDIDDetailsBasedOnDID
};
