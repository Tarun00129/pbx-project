const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

function getCompanyInfo(req, res){
    knex.from(table.tbl_Company_info).select('id', 'name','address','phone',
        'support_email', 'support_number', 'domain')
    .then((response) => {
        if (response.length > 0) {
            res.json({
                response
            });
        } 
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


module.exports = { getCompanyInfo };
