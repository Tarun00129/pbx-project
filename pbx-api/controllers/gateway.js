const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
/**
* Returns jwt token if valid email and password is provided
* @param req
* @param res
* @returns {*}
*/
function createGateway(req, res) {
    let domain = req.body.gateway.domain ? req.body.gateway.domain : '';
    let ip = req.body.gateway.ip ? req.body.gateway.ip : '';
    let register = req.body.gateway.register;
    if (register === true || register === 1) {
        register = '1';
    } else {
        register = '0';
    }

    // let callerID_header = req.body.gateway.callerID_header;
    // if (callerID_header == true || callerID_header == 1) {
    //     callerID_header = '1';
    // } else {
    //     callerID_header = '0';
    // }

    let prependDigit_dialnumber = req.body.gateway.prependDigit_dialnumber;
    // if (!prependDigit_dialnumber || prependDigit_dialnumber === '') {
    //     prependDigit_dialnumber = 0;
    // } else {
    //     prependDigit_dialnumber = req.body.gateway.prependDigit_dialnumber
    // }

    let simultaneous_call = req.body.gateway.simultaneous_call;
    if (!simultaneous_call || simultaneous_call === '') {
        simultaneous_call = 0;
    } else {
        simultaneous_call = req.body.gateway.simultaneous_call
    }

    let expiry = '0';
    if (!req.body.gateway.expiry) {
        expiry = '0';
    }
    else if (req.body.gateway.expiry) {
        expiry = req.body.gateway.expiry;
    }

    let from_user = '';
    if (!req.body.gateway.from_user) {
        from_user = '';
    }
    else if (req.body.gateway.from_user) {
        from_user = req.body.gateway.from_user;
    }

    let outbound_proxy = '';
    if (!req.body.gateway.outbound_proxy) {
        outbound_proxy = '';
    }
    else if (req.body.gateway.outbound_proxy) {
        outbound_proxy = req.body.gateway.outbound_proxy;
    }

    let register_proxy = '';
    if (!req.body.gateway.register_proxy) {
        register_proxy = '';
    }
    else if (req.body.gateway.register_proxy) {
        register_proxy = req.body.gateway.register_proxy;
    }

    let realm = '';
    if (!req.body.gateway.realm) {
        realm = '';
    }
    else if (req.body.gateway.realm) {
        realm = req.body.gateway.realm;
    }

    let auth_username = '';
    if (!req.body.gateway.auth_username) {
        auth_username = '';
    }
    else if (req.body.gateway.auth_username) {
        auth_username = req.body.gateway.auth_username;
    }

    let password = '';
    if (!req.body.gateway.password) {
        password = '';
    }
    else if (req.body.gateway.password) {
        password = req.body.gateway.password;
    }

    let is_sign = req.body.gateway.is_sign;
    if (is_sign == true || is_sign == 1) {
        is_sign = '1';
    } else {
        is_sign = '0';
    }

    let is_register_proxy = req.body.gateway.is_register_proxy;
    if (is_register_proxy == true || is_register_proxy == 1) {
        is_register_proxy = '1';
    } else {
        is_register_proxy = '0';
    }

    //akshay
    let is_realm = req.body.gateway.is_realm;
    if (is_realm == true || is_realm == 1) {
        is_realm = '1';
    } else {
        is_realm = '0';
    }


    let sofia_profile = '';
    if (!req.body.gateway.sofia_profile) {
        sofia_profile = '1';
    }
    else if (req.body.gateway.sofia_profile) {
        sofia_profile = req.body.gateway.sofia_profile;
    }

    let ping = '';
    if (!req.body.gateway.ping) {
        ping = '60';
    }
    else if (req.body.gateway.ping) {
        ping = req.body.gateway.ping;
    }

    let retry = '';
    if (!req.body.gateway.retry) {
        retry = '60';
    }
    else if (req.body.gateway.retry) {
        retry = req.body.gateway.retry;
    }

    let is_outbound_proxy = req.body.gateway.is_outbound_proxy;
    if (is_outbound_proxy == true || is_outbound_proxy == 1) {
        is_outbound_proxy = '1';
    } else {
        is_outbound_proxy = '0';
    }
    console.log(knex.raw("Call pbx_save_gateway(" + req.body.gateway.id + "," + req.body.gateway.provider + ",'" + ip + "'," + req.body.gateway.port + ",\
    '" + from_user + "','" + auth_username + "','" + password + "'," + register + "," + expiry + "," + ping + "," + retry + ",\
    '" + prependDigit_dialnumber + "','" + req.body.gateway.prependDigit_callerid + "','" + req.body.gateway.callerid + "','" + req.body.gateway.callerID_headertype + "',\
    '" + req.body.gateway.callerID_headervalue + "','" + req.body.gateway.codec + "','" + req.body.gateway.transport_type + "','" + req.body.gateway.dtmf_type + "','" + req.body.gateway.calling_profile + "',\
    1,'" + realm +  "','1'," + simultaneous_call + ",'"+ req.body.gateway.subnet +"', '"+ domain +  "','" + req.body.gateway.stripedDigit_dialnumber +  "','" + req.body.gateway.stripedDigit_callerid + "','" + is_sign +  "','" + is_register_proxy +  "','" + is_outbound_proxy  +  "','" + register_proxy +  "','" + outbound_proxy  + "','" + is_realm +  "','" + sofia_profile +  "')").toString());
    // 1,'" + req.body.gateway.realm +  "','" + req.body.gateway.status+"',"  + simultaneous_call + ",'"+ req.body.gateway.subnet +"', '"+ domain +"')")

    knex.raw("Call pbx_save_gateway(" + req.body.gateway.id + "," + req.body.gateway.provider + ",'" + ip + "'," + req.body.gateway.port + ",\
    '" + from_user + "','" + auth_username + "','" + password + "'," + register + "," + expiry + "," + ping + "," + retry + ",\
    '" + prependDigit_dialnumber + "','" + req.body.gateway.prependDigit_callerid + "','" + req.body.gateway.callerid + "','" + req.body.gateway.callerID_headertype + "',\
    '" + req.body.gateway.callerID_headervalue + "','" + req.body.gateway.codec + "','" + req.body.gateway.transport_type + "','" + req.body.gateway.dtmf_type + "','" + req.body.gateway.calling_profile + "',\
    1,'" + realm +  "','1'," + simultaneous_call + ",'"+ req.body.gateway.subnet +"', '"+ domain +  "','" + req.body.gateway.stripedDigit_dialnumber +  "','" + req.body.gateway.stripedDigit_callerid + "','" + is_sign +  "','" + is_register_proxy +  "','" + is_outbound_proxy  +  "','" + register_proxy +  "','" + outbound_proxy  + "','" + is_realm +  "','" + sofia_profile +  "')")

    // ", '1', + "," + req.body.gateway.realm + ",'1'," + simultaneous_call + ",'"+ req.body.gateway.subnet +"', '"+ domain +"')")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function viewGateway(req, res) {
    req.body.id = req.body.id ? req.body.id : null;
    req.body.ip = req.body.ip ? ("'" + req.body.ip + "'") : null;
    req.body.port = req.body.port ? req.body.port : null;
    req.body.provider_id = req.body.provider_id ? req.body.provider_id : null;
    // console.log(knex.raw("Call pbx_get_gateway(" + req.body.id + "," + req.body.ip + "," + req.body.port + "," + req.body.provider_id + ")").toString());

    knex.raw("Call pbx_get_gateway(" + req.body.id + "," + req.body.ip + "," + req.body.port + "," + req.body.provider_id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function viewGatewayById(req, res) {
    let id = parseInt(req.query.id);
    knex.select('g.id', 'codec', 'pro.provider', 'ip', 'port', 'from_user', 'auth_username',
            'password', knex.raw('IF (register = "0",false,true) as register'),
            'expiry_sec', 'ping', 'retry_sec', 'prependDigit_dialnumber', 'prependDigit__callerID',
            'callerID',
            'callerID_headertype', 'callerID_headervalue', 'transport_type', 'dtmf_type',
            'simultaneous_call', 'calling_profile', 'sofia_id', 'realm','strip_clr_id','strip_clr_num','is_sign',
            'is_outbound_proxy','is_register_proxy','outbound_proxy','register_proxy','is_realm','sofia_profile',
            knex.raw('IF (status = "0","Inactive","Active") as status'),
            knex.raw('DATE_FORMAT(g.created_at, "%d/%m/%Y %H:%i:%s") as created_at'),
            'g.provider_id',
            knex.raw('IF (status = "0","0","1") as statusDisplay'),'subnet','domain')
        .from(table.tbl_Gateway + ' as g')
        .leftJoin(table.tbl_Provider + ' as pro', 'pro.id', 'g.provider_id')
        .where('g.id', '=', "" + id + "")
        .then((response) => {
            if (response.length > 0) {
                res.json({
                    response
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}



function updateGateway(req, res) {
    console.log(req.body.gateway);
    let domain = req.body.gateway.domain ? req.body.gateway.domain : '';
    let ip = req.body.gateway.ip ? req.body.gateway.ip : '';
    let register = req.body.gateway.register;
    if (register === true || register === 1) {
        register = '1';
    } else {
        register = '0';
    }

    // let callerID_header = req.body.gateway.callerID_header;
    // if (callerID_header == true || callerID_header == 1) {
    //     callerID_header = '1';
    // } else {
    //     callerID_header = '0';
    // }

    let prependDigit_dialnumber = req.body.gateway.prependDigit_dialnumber;
    // if (!prependDigit_dialnumber || prependDigit_dialnumber === '') {
    //     prependDigit_dialnumber = 0;
    // } else {
    //     prependDigit_dialnumber = req.body.gateway.prependDigit_dialnumber
    // }

    let simultaneous_call = req.body.gateway.simultaneous_call;
    if (!simultaneous_call || simultaneous_call === '') {
        simultaneous_call = 0;
    } else {
        simultaneous_call = req.body.gateway.simultaneous_call
    }

    let expiry = '0';
    if (!req.body.gateway.expiry) {
        expiry = '0';
    }
    else if (req.body.gateway.expiry) {
        expiry = req.body.gateway.expiry;
    }


    let from_user = '';
    if (!req.body.gateway.from_user) {
        from_user = '';
    }
    else if (req.body.gateway.from_user) {
        from_user = req.body.gateway.from_user;
    }

    let sofia_profile = '';
    if (!req.body.gateway.sofia_profile) {
        sofia_profile = '1';
    }
    else if (req.body.gateway.sofia_profile) {
        sofia_profile = req.body.gateway.sofia_profile;
    }

    let outbound_proxy = '';
    if (!req.body.gateway.outbound_proxy) {
        outbound_proxy = '';
    }
    else if (req.body.gateway.outbound_proxy) {
        outbound_proxy = req.body.gateway.outbound_proxy;
    }

    let register_proxy = '';
    if (!req.body.gateway.register_proxy) {
        register_proxy = '';
    }
    else if (req.body.gateway.register_proxy) {
        register_proxy = req.body.gateway.register_proxy;
    }

    let realm = '';
    if (!req.body.gateway.realm) {
        realm = '';
    }
    else if (req.body.gateway.realm) {
        realm = req.body.gateway.realm;
    }

    let auth_username = '';
    if (!req.body.gateway.auth_username) {
        auth_username = '';
    }
    else if (req.body.gateway.auth_username) {
        auth_username = req.body.gateway.auth_username;
    }

    let password = '';
    if (!req.body.gateway.password) {
        password = '';
    }
    else if (req.body.gateway.password) {
        password = req.body.gateway.password;
    }

    let ping = '';
    if (!req.body.gateway.ping) {
        ping = '60';
    }
    else if (req.body.gateway.ping) {
        ping = req.body.gateway.ping;
    }

    let retry = '';
    if (!req.body.gateway.retry) {
        retry = '60';
    }
    else if (req.body.gateway.retry) {
        retry = req.body.gateway.retry;
    }

    let is_sign = req.body.gateway.is_sign;
    if (is_sign == true || is_sign == 1) {
        is_sign = '1';
    } else {
        is_sign = '0';
    }

    let is_register_proxy = req.body.gateway.is_register_proxy;
    if (is_register_proxy == true || is_register_proxy == 1) {
        is_register_proxy = '1';
    } else {
        is_register_proxy = '0';
    }

    let is_realm = req.body.gateway.is_realm;
    if (is_realm == true || is_realm == 1) {
        is_realm = '1';
    } else {
        is_realm = '0';
    }

    let is_outbound_proxy = req.body.gateway.is_outbound_proxy;
    if (is_outbound_proxy == true || is_outbound_proxy == 1) {
        is_outbound_proxy = '1';
    } else {
        is_outbound_proxy = '0';
    }

    console.log( knex.raw("Call pbx_save_gateway(" + req.body.gateway.id + "," + req.body.gateway.provider + ",'" + ip + "'," + req.body.gateway.port + ",\
    '" + from_user + "','" + auth_username + "','" + password + "'," + register + "," + expiry + "," + req.body.gateway.ping + "," + req.body.gateway.retry + ",\
    '" + prependDigit_dialnumber + "','" + req.body.gateway.prependDigit_callerid + "','" + req.body.gateway.callerid + "','" + req.body.gateway.callerID_headertype + "',\
    '" + req.body.gateway.callerID_headervalue + "','" + req.body.gateway.codec + "','" + req.body.gateway.transport_type + "','" + req.body.gateway.dtmf_type + "','" + req.body.gateway.calling_profile + "',\
    1,'" + realm  + "','" + req.body.gateway.status+"'," + simultaneous_call + ",'"+req.body.gateway.subnet+"', '"+domain +  "','" + req.body.gateway.stripedDigit_dialnumber +  "','" + req.body.gateway.stripedDigit_callerid + "','" + is_sign +  "','" + is_register_proxy +  "','" + is_outbound_proxy  +  "','" + register_proxy +  "','" + outbound_proxy  + "','" + is_realm +  "','" + sofia_profile +  "')"))

    knex.raw("Call pbx_save_gateway(" + req.body.gateway.id + "," + req.body.gateway.provider + ",'" + ip + "'," + req.body.gateway.port + ",\
    '" + from_user + "','" + auth_username + "','" + password + "'," + register + "," + expiry + "," + ping + "," + retry + ",\
    '" + prependDigit_dialnumber + "','" + req.body.gateway.prependDigit_callerid + "','" + req.body.gateway.callerid + "','" + req.body.gateway.callerID_headertype + "',\
    '" + req.body.gateway.callerID_headervalue + "','" + req.body.gateway.codec + "','" + req.body.gateway.transport_type + "','" + req.body.gateway.dtmf_type + "','" + req.body.gateway.calling_profile + "',\
    1,'" + realm  + "','" + req.body.gateway.status+"'," + simultaneous_call + ",'"+req.body.gateway.subnet+"', '"+domain +  "','" + req.body.gateway.stripedDigit_dialnumber +  "','" + req.body.gateway.stripedDigit_callerid + "','" + is_sign +  "','" + is_register_proxy +  "','" + is_outbound_proxy  +  "','" + register_proxy +  "','" + outbound_proxy  + "','" + is_realm +  "','" + sofia_profile +  "')")
   // 1,'" + req.body.gateway.realm +  "','1'," + simultaneous_call + ",'"+ req.body.gateway.subnet +"', '"+ domain +"')")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function deleteGateway(req, res) {

    knex.raw("Call pbx_delete_gateway(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function updateGatewayStatus(req, res) {
    let id = parseInt(req.body.id);
    knex(table.tbl_Gateway).where('id', '=', "" + id + "")
        .update({ status: "" + req.body.status + "" })
        .then((response) => {
            if (response === 1) {
                res.json({
                    response
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function filterGateway(req, res) {
    let data = req.body.filters;
    data.by_name = data.by_name ? ("'" + data.by_name + "'") : null;
    data.by_ip = data.by_ip ? ("'" + data.by_ip + "'") : null;
    data.by_status = data.by_status ? ("'" + data.by_status + "'") : null;

    knex.raw("Call pbx_filterGateway(" + data.by_name + "," + data.by_ip + "," + data.by_status + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function gatewayProvider(req, res) {

    knex
        .select(knex.raw('DISTINCT(g.id)'), 'pro.provider as gatewayName')
        .from(table.tbl_Gateway + ' as g')
        .join(table.tbl_Provider + ' as pro', 'pro.id', 'g.provider_id')
        .where('g.status', '=', '1')
        .groupBy('pro.provider')
        .orderBy('pro.provider', '=', 'asc')
        .then((response) => {
            if (response.length > 0) {
                res.json({
                    response
                });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}


function updateGatewayManipulation(req, res, next) {
    let data = req.body.data;
    let id = req.query.id;
    console.log(data,"===========old data>>>>>>>>>>");
    for(let i = 0; i<data.length; i++){
        Object.assign(data[i],{gw_id: id})
    }

    console.log(data,"--------new data>>>>>>>>>>>>>");
    // console.log(strip_clr_id,"------strip--new data>>>>>>>>>>>>>");
    console.log(data.prepend_clr_id,"------prepend_clr_id--new data>>>>>>>>>>>>>");
    let sql = knex(table.tbl_gateway_Manipulation).del().where('gw_id',id)
            sql.then((response) => {
                let sql1 = knex(table.tbl_gateway_Manipulation).insert(data);
                console.log(sql1.toQuery(),"                to query><>>>>>");
                    sql1.then((response) => {
                        res.send({
                            status_code: 200,
                            message: "Data Inserted."
                        });
                    });
            });

}
function viewGatewayialog(req, res) {
    let data = req.query;
    let sql = knex(table.tbl_Gateway + ' as g')
                .leftJoin(table.tbl_Provider + ' as p', 'g.provider_id', 'p.id')
                .select('g.ip','g.domain','p.provider')
                .where('g.id',data.id);
                sql.then((response) => {
        if(response){
            res.send(response)
        }
    })
}

function getdata(req,res){
    console.log(req.body,"---------------body");
    let id = req.body;
    console.log(id,'------here id--------');
    let sql = knex(table.tbl_gateway_Manipulation + ' as pchm')
    .select(
                knex.raw('GROUP_CONCAT(pchm.strip_clr_id) as strip_clr_id'),
                knex.raw('GROUP_CONCAT(pchm.prepend_clr_id) as prepend_clr_id'),
                knex.raw('GROUP_CONCAT(pchm.clr_id_manipulation) as clr_id_manipulation'))
                .where('gw_id',id.id)
    console.log(sql.toQuery(),"---------------------to query>>>>>>>>>>>");
    sql.then((response) =>{
            res.json({
                response
            })
    })
}

// function updateSMSApi(req, res) {
//     var data = req.body;
//     var parameterForm = data.parameterForm;
//     console.log(parameterForm)

//     let query = knex(table.tbl_Gateway)
//         .where('ip', '=', "" + data.ip + "")
//         .andWhere('gw_id','=',data.gw_id)
//         // .whereNot('id', data.id);
//     query.then((response) => {
//         if (response.length == 0) {
//             let sql = knex(table.tbl_gateway_Manipulation).update({
//                 strip_clr_id: "" + data.strip_clr_id + "",
//                 prepend_clr_id: "" + data.prepend_clr_id + "",
//                 clr_id_manipulation: "" + data.clr_id_manipulation + "",
//                 gw_id: "" + data.gw_id + "",
//             }).where('id', '=', "" + data.id + "");
//             sql.then((response) => {
//                 let smsId = data.id ? data.id : 0;
//                 if (response) {
//                     let sql2 = knex(table.tbl_pbx_sms_api_mapping).where('sms_api_id', '=', "" + smsId + "");
//                     sql2.del();
//                     sql2.then((response) => {
//                         if (response) {
//                             let managedArray = parameterForm;
//                             console.log(managedArray);
//                             const contactsToInsert = managedArray.map(contact =>
//                                 ({ sms_api_id: smsId, header: contact.header, value: contact.header_value, is_type : ((contact.isType).toString()) }));
//                             console.log(contactsToInsert);
//                             let sql3 = knex(table.tbl_pbx_sms_api_mapping).insert(contactsToInsert);
//                             sql3.then((response) => {
//                                 if (response) {
//                                     res.send({
//                                         response: response,
//                                         message: 'Update SMS API successfully !',
//                                         code: 200
//                                     });
//                                 }
//                             }).catch((err) => {
//                                 console.log(err);
//                                 res.status(401).send({
//                                     code: err.errno,
//                                     error: 'error', message: 'DB Error: ' + err.message
//                                 }); throw err
//                             });
//                         }
//                     }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
//                 }
//             }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
//         } else {
//             res.json({
//                 response: response,
//                 code: 201,
//                 message: `Provider name already exist`
//             });
//         }
//     }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
// }


module.exports = {
    createGateway, viewGateway, viewGatewayById,
    updateGateway, deleteGateway, updateGatewayStatus, filterGateway,
    gatewayProvider, updateGatewayManipulation,viewGatewayialog,getdata
};
