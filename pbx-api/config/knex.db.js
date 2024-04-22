// var knex = require('knex')({
//     client: 'mysql2',
//     connection: {
//         host: process.env.DB_WRITE_HOST || '192.168.3.125',
//         user: process.env.DB_USERNAME || 'ccuser',
//         password: process.env.DB_PASSWORD || '123456',
//         database: process.env.DB_DATABASE || 'cc_master',
//         port: process.env.DB_PORT || 3306
//     },
//     pool: { min: 5, max: 50 }
// });

// module.exports = { knex };
var knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: process.env.DB_WRITE_HOST || '119.18.55.154',
        // host: process.env.DB_WRITE_HOST || '192.168.4.10',
        user: process.env.DB_USERNAME || 'ccuser',
        password: process.env.DB_PASSWORD || 'cloudVirAmiNag119',
        // database: process.env.DB_DATABASE || 'cc_new_master',
        database: process.env.DB_DATABASE || 'cc_master',
        port: process.env.DB_PORT || 3306,
        connectTimeout: 90000

    },
    pool: { min: 5, max: 50 }
});
// var knex = require('knex')({
//     client: 'mysql2',
//     connection: {
//         host: process.env.DB_WRITE_HOST || '127.0.0.1',
//         user: process.env.DB_USERNAME || 'root',
//         password: process.env.DB_PASSWORD || '',
//         database: process.env.DB_DATABASE || 'cc_master',
//         port: process.env.DB_PORT || 3306
//     },
//     pool: { min: 5, max: 50 }
// });


module.exports = { knex };
