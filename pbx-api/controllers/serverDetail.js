const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var request = require('request');
var headers = {
    'Accept': 'text/xml',
    'Content-Type': 'text/xml'
};

var dataString = '<?xml version=\'1.0\'?><methodCall><methodName>address_reload</methodName></methodCall>';
var options = {
    url: 'http://127.0.0.1:8000/RPC2',
    method: 'POST',
    headers: headers,
    body: dataString
};

/*
* @param req
* @param res
* @returns {*}
*/
function createServer(req, res) {
    
    let password = req.body.serverDetail.pswd;
    if (!password || password == '' && req.body.serverDetail.service  == '1') {
        password = '';
    } else {
        password = req.body.serverDetail.pswd;
    }

    let username = req.body.serverDetail.user;
    if ((!username || username == '') || req.body.serverDetail.service  == '1')  {
        username = '';
    } else {
        username = req.body.serverDetail.user;
    }
    

    // console.log(req.body);
    if(req.body.serverDetail.status == ''){
        req.body.serverDetail.status = '1';
    }


    knex.raw("Call pbx_save_serverdetail(" + req.body.serverDetail.id + ",'" + req.body.serverDetail.ip + "'," + req.body.serverDetail.port + ",'" + username + "',\
    '" + password + "'," + req.body.serverDetail.service + ",'"+req.body.serverDetail.status +"')")
        .then((response) => {
            if (response) {
                function callback(error, response2, body) {
                    if (!error && response2.statusCode == 200) {
                        console.log(body);
                        res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT, server_message : 'Configuration has been updated.'}); //Requested server is running
                    }else{
                        console.log(error);
                        res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT, server_message : 'Requested server is not running at port 8000'  });
                    }
                }
                request(options, callback);
                // res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });

            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}



function viewServerDetails(req, res) {
    req.body.id = req.body.id ? req.body.id : null;
    req.body.ip = req.body.ip ? ("'" + req.body.ip + "'") : null;
    req.body.port = req.body.port ? req.body.port : null;

    knex.raw("Call pbx_get_serverdetail(" + req.body.id + "," + req.body.ip + "," + req.body.port + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });

}

function updateServerStatus(req, res) {
    let id = parseInt(req.body.id);
    knex(table.tbl_Server_detail).where('id', '=', "" + id + "")
        .update({ status: "" + req.body.status + "" })
        .then((response) => {
            if (response === 1) {
                res.json({
                    response
                });
            } 
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function deleteServerDetail(req, res) {
    knex.raw("Call pbx_delete_serverdetail(" + req.query[Object.keys(req.query)[0]] + ")")
        .then((response) => {
            if (response) {
                function callback(error, response2, body) {
                    if (!error && response2.statusCode == 200) {
                        console.log(body);
                        res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT, server_message : 'Configuration has been updated.'}); //Requested server is running
                    }else{
                        console.log(error);
                        res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT, server_message : 'Requested server is not running at port 8000'  });
                    }
                }
                request(options, callback);
                // res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function getServerByFilters(req, res) {
    let data = req.body.filters;
    // console.log(req.body);
    data.by_service = data.by_service ? ("'" + data.by_service + "'") : null;
    data.by_ip = data.by_ip ? ("'" + data.by_ip + "'") : null;
    data.by_username = data.by_username ? ("'" + data.by_username + "'") : null;
    data.by_status = data.by_status ? ("'" + data.by_status + "'") : null;

    // console.log(knex.raw("Call pbx_getServerByFilters(" + data.by_service + "," + data.by_ip + "," + data.by_username + "," + data.by_status + ")").toString());

    knex.raw("Call pbx_getServerByFilters(" + data.by_service + "," + data.by_ip + "," + data.by_username + "," + data.by_status + ")").then((response) => {
        if (response) {
            res.send({ response: response[0][0] });
        }
    }).catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function verifyPort(req, res) {
    let port = parseInt(req.body.port);

    if (req.body.id) {      
        knex.from(table.tbl_Server_detail).whereNot('id', '=', "" + req.body.id + "")
            .select(
                knex.raw('SUM(CASE WHEN (port =' + port + ' AND ip="' + req.body.ip + '") AND service_id = "1" THEN 1 ELSE 0 END) as opensip'),
                knex.raw('SUM(CASE WHEN (port =' + port + ' AND ip="' + req.body.ip + '") AND service_id = "2" THEN 1 ELSE 0 END) as freeswitch'))
            .then((response) => {
                if (response.length > 0) {
                    const server = response[0];
                    res.json({
                        opensip: server.opensip,
                        freeswitch: server.freeswitch
                    });
                } else {
                    res.json({
                        server_ip: ''
                    });
                }
            }).catch((err) => { console.log(err);  res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    } else {
      knex.from(table.tbl_Server_detail)
            .select(knex.raw('SUM(CASE WHEN (port =' + port + ' AND ip="' + req.body.ip + '") AND service_id = "1" THEN 1 ELSE 0 END) as opensip'),
                knex.raw('SUM(CASE WHEN (port =' + port + ' AND ip="' + req.body.ip + '") AND service_id = "2" THEN 1 ELSE 0 END) as freeswitch'))
            .then((response) => {
                if (response.length > 0) {
                    const server = response[0];
                    res.json({
                        opensip: server.opensip,
                        freeswitch: server.freeswitch
                    });
                } else {
                    res.json({
                        server_ip: ''
                    });
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    }
}

module.exports = {
    createServer, viewServerDetails,verifyPort,
    deleteServerDetail, updateServerStatus, getServerByFilters
};
