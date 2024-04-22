const { knex } = require('../config/knex.db');
const table = require('../config/table.macros');

function getReseller(req,res) {
    let customer_id = req.query['id'];    
    let sql = knex(table.tbl_Customer + ' as c').join(table.tbl_pbx_roles + ' as pr', 'c.role_id', 'pr.user_type')
    .select('c.*', 'c.status as status', knex.raw('CONCAT(c.first_name, " " ,c.last_name) as name, if(c.status = "1", "Active", "Inactive") as status_text'), 'pr.rolename as user_type')
    .where(knex.raw('c.role_id in("3")')).andWhere('c.status' ,'!=', "2")
    if(customer_id != "null"){
        sql.andWhere('c.id',customer_id)
    }    
    sql.then((response) => {        
        if(response) res.json({response:response});
    })
}
module.exports = {getReseller};