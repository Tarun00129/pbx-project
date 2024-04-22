const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

function getAccountManager(req, res){

    let customerId = parseInt(req.query.customerId);
    if(req.query.userType == '1'){
        
        knex.from(table.tbl_Customer).where('id', '=', "" + customerId + "")
        .select('account_manager_id')
        .then((response) => {
            if (response.length>0) {
                let accountManagerId = Object.values(JSON.parse(JSON.stringify(response)));
                let lastInsertedAccountManagerId = accountManagerId[0].account_manager_id;

                //console.log((knex.from(table.tbl_Customer).where('account_manager_id','=',""+lastInsertedAccountManagerId+"")                
                knex.from(table.tbl_Customer).where('id','=',""+lastInsertedAccountManagerId+"")
                .select('id',knex.raw('CONCAT(first_name, \' \',last_name) as name'),'mobile','email')
                .then((response) => {                  
                    if (response.length > 0) {
                        res.json({
                            response
                        });
                    }
                }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });  throw err }); 
            } 
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err }); 
    }else if(req.query.userType == '4'){
        var sql = knex.from(table.tbl_Customer).whereIn('role_id', ['5']).whereIn('status',['1'])
        .select('id',knex.raw('CONCAT(first_name, \' \',last_name) as name'),'mobile','email');
        
        sql.then((response) => {
            if (response.length > 0) {
                res.json({
                    response
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });  throw err }); 
  
    }else {
        
        var sql = knex.from(table.tbl_Customer).whereIn('role_id', ['4', '5']).whereIn('status',['1'])
        .select('id',knex.raw('CONCAT(first_name, \' \',last_name) as name'),'mobile','email');
        
        sql.then((response) => {
            if (response.length > 0) {
                res.json({
                    response
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });  throw err }); 
  
    }
    // else if(req.query.userType == '4'){
    //     var sql = knex.from(table.tbl_Customer).whereIn('role', ['5','4']).whereIn('status',['1'])
    //     .select('id',knex.raw('CONCAT(first_name, \' \',last_name) as name'),'mobile','email');
        
    //     sql.then((response) => {
    //         if (response.length > 0) {
    //             res.json({
    //                 response
    //             });
    //         } 
    //     }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });  throw err }); 
    // }
}

module.exports = { getAccountManager};
