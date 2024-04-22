const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');
const axios = require('axios').default;

function createCallQueueAPI(req, res) {
    var data = req.body;
    try{
        console.log('data',data);
        let port = '1111';
        let baseUrl = req.hostname;
        baseUrl = baseUrl.split(":")[0];
        // baseUrl = 'http://'+baseUrl + ':' +  port + '/esl_api';
        baseUrl = 'http://127.0.0.1:' +  port + '/esl_api';
        let obj = {};

        obj['application'] = data.hasOwnProperty('application') ? data['application'] : ''  //"click2call"
        obj['cust_id'] = data.hasOwnProperty('cust_id') ? data['cust_id'] : '' ;   
        obj['extension'] = data.hasOwnProperty('extension') ? data['extension'] : '' ;   
        obj['destination_number'] = data.hasOwnProperty('destination_number') ? data['destination_number'] : '' ;  
        obj['callback_url'] = data.hasOwnProperty('callback_url') ? data['callback_url'] : 'no' ;  // data['callback_url'] ? data['callback_url'] : 'no' ;
        obj['token_id'] = data.hasOwnProperty('token_id') ? data['token_id'] : 'no' ;  //data['token'];
        obj['broadcast_id'] = data.hasOwnProperty('broadcast_id') ? data['broadcast_id'] : '' ;  //data['token'];
        // broadcast_id: '233',
        obj['action'] = data.hasOwnProperty('action') ? data['action'] : ''  ;
        obj['que_typ'] = data.hasOwnProperty('que_typ') ? data['que_typ'] : '';
        obj['id'] = data.hasOwnProperty('id') ? data['id'] : ''  //"gateway";

        obj['file'] = data.hasOwnProperty('file') ? data['file'] : ''  //"recording";         

        axios.post(baseUrl, obj)
          .then(function (response) {            
            res.send(
                 response['data'] 
            );
          })
          .catch(function (err) {
            res.send({
                status_code: 400,
                message: 'C2C Status.',
                data: err
            });           
          });
    }catch (e) {
        return res.status(400).send({ error: 'Token does not exist', message: 'Authentication failed.' });
    }
}

module.exports = {
    createCallQueueAPI
}