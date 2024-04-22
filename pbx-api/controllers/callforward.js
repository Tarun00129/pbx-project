const config = require('../config/app');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

function createCallForward(req, res) {
    // console.log(req.body);
    let universal_external = ''
    if (req.body.callforward.universal_external) {
        universal_external = req.body.callforward.country_code + req.body.callforward.universal_external;
    } else if (req.body.callforward.universal_extension) {
        universal_external = req.body.callforward.universal_extension;
    } else {
        universal_external = '';
    }

    let busy_external = ''
    if (req.body.callforward.busy_external) {
        busy_external = req.body.callforward.country_code + req.body.callforward.busy_external;
    } else if (req.body.callforward.busy_extension) {
        busy_external = req.body.callforward.busy_extension;
    } else {
        busy_external = '';
    }

    let noanswer_external = ''
    if (req.body.callforward.noanswer_external) {
        noanswer_external = req.body.callforward.country_code + req.body.callforward.noanswer_external;
    } else if (req.body.callforward.noanswer_extension) {
        noanswer_external = req.body.callforward.noanswer_extension;
    } else {
        noanswer_external = '';
    }

    let unavailable_external = ''
    if (req.body.callforward.unavailable_external) {
        unavailable_external = req.body.callforward.country_code + req.body.callforward.unavailable_external;
    } else if (req.body.callforward.unavailable_extension) {
        unavailable_external = req.body.callforward.unavailable_extension;
    } else {
        unavailable_external = '';
    }

    let country = ''
    if (req.body.callforward.universal_country) {
        country = req.body.callforward.universal_country;
    } else if (req.body.callforward.busy_country) {
        country = req.body.callforward.busy_country;
    } else if (req.body.callforward.noanswer_country) {
        country = req.body.callforward.noanswer_country;
    } else if (req.body.callforward.unavailable_country) {
        country = req.body.callforward.unavailable_country;
    } else {
        country = 0;
    }
 
    req.body.callforward.universal_country = req.body.callforward.universal_country ? req.body.callforward.universal_country : 0;
    req.body.callforward.busy_country = req.body.callforward.busy_country ? req.body.callforward.busy_country : 0;
    req.body.callforward.noanswer_country = req.body.callforward.noanswer_country ? req.body.callforward.noanswer_country : 0;
    req.body.callforward.unavailable_country = req.body.callforward.unavailable_country ? req.body.callforward.unavailable_country : 0;
    req.body.callforward.universal_country_code = req.body.callforward.universal_country_code ? req.body.callforward.universal_country_code : 0;
    req.body.callforward.busy_country_code = req.body.callforward.busy_country_code ? req.body.callforward.busy_country_code : 0;
    req.body.callforward.noanswer_country_code = req.body.callforward.noanswer_country_code ? req.body.callforward.noanswer_country_code : 0;
    req.body.callforward.unavailable_country_code = req.body.callforward.unavailable_country_code ? req.body.callforward.unavailable_country_code : 0;
        console.log(knex.raw("Call pbx_save_callforward(" + req.body.callforward.id + ",'" + req.body.callforward.universal_type + "','" + universal_external + "',\
        '" + req.body.callforward.busy_type + "','" + busy_external + "','" + req.body.callforward.noanswer_type + "','" + noanswer_external + "',\
        '" + req.body.callforward.unavailable_type + "','" + unavailable_external + "',0," + req.body.callforward.extension_id + "," + country + ","+ req.body.callforward.universal_country + ",'" + req.body.callforward.universal_country_code  + "',\
        " +  req.body.callforward.busy_country + ",'" + req.body.callforward.busy_country_code + "'," +  req.body.callforward.noanswer_country + ",'" + req.body.callforward.noanswer_country_code + "'," +  req.body.callforward.unavailable_country + ",'" + req.body.callforward.unavailable_country_code  +  "','1')").toString());

    knex.raw("Call pbx_save_callforward(" + req.body.callforward.id + ",'" + req.body.callforward.universal_type + "','" + universal_external + "',\
    '" + req.body.callforward.busy_type + "','" + busy_external + "','" + req.body.callforward.noanswer_type + "','" + noanswer_external + "',\
    '" + req.body.callforward.unavailable_type + "','" + unavailable_external + "',0," + req.body.callforward.extension_id + "," + country + ","+ req.body.callforward.universal_country + ",'" + req.body.callforward.universal_country_code + "',\
    " +  req.body.callforward.busy_country + ",'" + req.body.callforward.busy_country_code + "'," +  req.body.callforward.noanswer_country + ",'" + req.body.callforward.noanswer_country_code + "'," +  req.body.callforward.unavailable_country + ",'" + req.body.callforward.unavailable_country_code  +  "','1')")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}


function viewCallForwardById(req, res) {

    req.body.id = req.body.id ? req.body.id : null;

    knex.raw("Call pbx_get_callforward(" + req.body.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });

}

function extFeatureCallForward(req, res) {
    knex.select('outbound').from(table.tbl_Extension_master)
        .where('id', '=', "" + req.query.id + "")
        .then((response) => {
            let extFeature = Object.values(JSON.parse(JSON.stringify(response)));
            let outbound = extFeature[0].outbound;
            if (response.length > 0) {
                res.json({
                    outbound_call: outbound
                });
            } else {
                res.json({
                    outbound_call: 0
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Features not available' }); throw err });

    // knex.select('customer_id').from(table.tbl_Extension_master)
    //     .where('id', '=', "" + req.query.id + "")
    //     .then((response) => {
    //         if (response.length > 0) {
    //             let customerId = Object.values(JSON.parse(JSON.stringify(response)));
    //             let lastCustomerId = customerId[0].customer_id;
    //             knex.select('p.outbound_call')
    //                 .from(table.tbl_PBX_features + ' as p')
    //                 .leftOuterJoin(table.tbl_Package + ' as pac', 'pac.feature_id', 'p.id')
    //                 .leftOuterJoin(table.tbl_Map_customer_package + ' as mcp', 'mcp.package_id', 'pac.id')
    //                 .where("mcp.customer_id", "=", "" + lastCustomerId + "")
    //                 .then((response) => {
    //                     if (response.length > 0) {
    //                         let extFeature = Object.values(JSON.parse(JSON.stringify(response)));
    //                         let outbound = extFeature[0].outbound_call;
    //                         if (outbound == 1) {
    //                             knex.select('e.outbound')
    //                                 .from(table.tbl_PBX_features + ' as p')
    //                                 .leftOuterJoin(table.tbl_Package + ' as pac', 'pac.feature_id', 'p.id')
    //                                 .leftOuterJoin(table.tbl_Map_customer_package + ' as mcp', 'mcp.package_id', 'pac.id')
    //                                 .leftOuterJoin(table.tbl_Extension_master + ' as e', 'mcp.customer_id', 'e.customer_id')
    //                                 .where("e.id", "=", "" + req.query.id + "")
    //                                 .then((resp) => {                    
    //                                     if (resp.length > 0) {
    //                                         res.json({
    //                                             outbound_call: resp[0].outbound
    //                                         });
    //                                     } else {
    //                                         res.json({
    //                                             outbound_call: 0
    //                                         });
    //                                     }
    //                                 }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Features not available' }); throw err });
    //                         }else {
    //                             res.status(401).send({ error: 'error', message: 'Data not found.' });
    //                         }
    //                     }
    //                 }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Features not available' }); throw err });
    //         } else {
    //             res.status(401).send({ error: 'error', message: 'Features not available' });
    //         }
    //     }).catch((err) => {
    //         res.status(401).send({ error: 'error', message: 'Features not available' }); throw err
    //     });
}

function extVoiceMailSetting(req, res) {
    knex.select('voicemail').from(table.tbl_Extension_master)
        .where('id', '=', "" + req.query.id + "")
        .then((response) => {
            let extFeature = Object.values(JSON.parse(JSON.stringify(response)));
            let voicemail = extFeature[0].voicemail;
            if (response.length > 0) {
                res.json({
                    voicemail_setting: voicemail
                });
            } else {
                res.json({
                    voicemail_setting: 0
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Features not available' }); throw err });
}

module.exports = {
    createCallForward, viewCallForwardById, extFeatureCallForward,extVoiceMailSetting
};
