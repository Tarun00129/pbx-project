const { knex } = require('../config/knex.db');
const table = require('../config/table.macros');

const softphone_authorize = (req, res, next) => {
    const authorization = req.headers['token'];
    if (authorization) {
        try {
            let sql = knex.select('exm.token')
                .from(table.tbl_Extension_master + ' as exm')
                .andWhere('exm.token', authorization)
            sql.then((response) => {
                if (response.length  > 0 ) {
                    return next();
                } else {
                    return res.status(400).send({ error: 'Token does not exist', message: 'Authentication failed.' });
                }
            })
        } catch (e) {
            return res.status(400).send({ error: 'Token does not exist', message: 'Authentication failed.' });
        }

    } else {
        return res.status(400).send({ error: 'Unauthorized', message: 'Authentication failed.' });
    }
}
 module.exports =   softphone_authorize;
