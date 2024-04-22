const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

function getProductWiseCustomer(req, res) {
    console.log('req.query.limit_flag',req.body.limit_flag)
    let id = parseInt(req.body.productId);
   let query= knex.select('c.id', knex.raw('CONCAT(c.first_name, \' \', c.last_name) as "name"'), 'c.company_name',
            'c.mobile', 'c.email', knex.raw('IF (c.status = "0","Inactive", IF (c.status = "1","Active", IF (c.status = "2","Deleted", IF (c.status = "3","Expired", IF (c.status = "4","Suspended for Underpayment", "Suspended for Litigation"))))) as status'),
            'pac.name as package_name',knex.raw('CONCAT(c.country_code, \' \', c.mobile) as "mobileDisplay"'))
        .from(table.tbl_Customer + ' as c')
        .leftJoin(table.tbl_Map_customer_package + ' as map', 'map.customer_id', 'c.id')
        .leftJoin(table.tbl_Product + ' as pro', 'pro.id', 'map.product_id')
        .leftJoin(table.tbl_Package + ' as pac', 'pac.id', 'map.package_id')
        .where("pro.id", "=", "" + id + "")
        .andWhere("c.role_id", "1") 
        .whereNotIn('c.status', ['2'])
        .orderBy('c.id', 'desc')
        if(req.query.limit_flag == 1){
            query.limit(10);
        }
        if(req.body.limit_flag == 1){
            query.limit(10);
        }
        query.then((response) => {
                res.json({
                    response
                });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


function getProductWiseDid(req, res) {
    let id = parseInt(req.body.productId);


   let query= knex.select('d.id', 'pro.provider', 'c.name as country', 'd.activated', 'd.reserved', 'd.customer_id', 'd.did', knex.raw('CONCAT((CONCAT("+",c.phonecode)), \' \',d.did) as didDisplay'), 'd.secondusedreal',
        'd.billingtype', 'd.fixrate', 'd.connection_charge', 'd.selling_rate', 'd.max_concurrent', 'd.did_type',
        'd.status', 'af.active_feature', 'd.customer_id', 'cus.company_name','dest.destination',
        knex.raw('IF (d.activated = "1", "Active","Inactive") as activatedDisplay'),
        knex.raw('IF (d.did_type = "1","DID Number",if(d.did_type = "2", "DID Number","Tollfree Number")) as didTypeDisplay'),
        knex.raw('IF (dest.active_feature_id = "1",ext.ext_number, IF (dest.active_feature_id = "2",ivr.name, IF (dest.active_feature_id = "3",conf.name,IF (dest.active_feature_id = "4",que.name,IF (dest.active_feature_id = "5",call.name, ""))))) as destination_name'))
        .from(table.tbl_DID + ' as d')
        .leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
        .leftJoin(table.tbl_Country + ' as c', 'c.id', 'd.country_id')
        .leftJoin(table.tbl_DID_Destination + ' as dest', 'd.id', 'dest.did_id')
        .leftJoin(table.tbl_DID_active_feature + ' as af', 'dest.active_feature_id', 'af.id')
        .leftJoin(table.tbl_Customer + ' as cus', 'd.customer_id', 'cus.id')
        .leftJoin(table.tbl_Map_customer_package + ' as map', 'map.customer_id', 'cus.id')
        .leftJoin(table.tbl_Product + ' as prod', 'prod.id', 'map.product_id')
        .leftJoin(table.tbl_Extension_master + ' as ext', 'dest.destination_id', 'ext.id')
        .leftJoin(table.tbl_PBX_IVR + ' as ivr', 'dest.destination_id', 'ivr.id')
        .leftJoin(table.tbl_PBX_conference + ' as conf', 'dest.destination_id', 'conf.id')
        .leftJoin(table.tbl_PBX_queue + ' as que', 'dest.destination_id', 'que.id')
        .leftJoin(table.tbl_PBX_CALLGROUP + ' as call', 'dest.destination_id', 'call.id')
        .where('prod.id', "=", "" + id + "")
        .andWhere('d.status', '!=', "2")
        .orderBy('d.id', 'desc')
        if(req.body.limit_flag == 1){
            query.limit(10);
        }
        query.then((response) => {
            // console.log(response);
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

module.exports = { getProductWiseCustomer, getProductWiseDid };