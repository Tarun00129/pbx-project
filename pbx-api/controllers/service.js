const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

function getServices(req, res){
    knex.from(table.tbl_Service).where('status', "1")
    .select('id', 'name' )
    .then((response) => {
        if (response.length > 0) {
            res.json({
                response
            });
        }
    }).catch((err) => { console.log(err);   res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}


module.exports = { getServices };
