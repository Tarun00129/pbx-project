const config = require('../config/app');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const nodeCCAvenue = require('node-ccavenue');
const ccav = new nodeCCAvenue.Configure({
    merchant_id: config.test_merchant_id || config.prod_merchant_id,
    working_key: config.test_working_key || config.prod_working_key
});

function payHere(req, res) {
    console.log(req.body);
    const encResp = req.body.credentials;
    console.log('encResp=',encResp);
    const output = ccav.redirectResponseToJson(encResp);
    console.log('output=',output);

    console.log(output.order_status);
    //   logger.log(output);
    // The 'output' variable is the CCAvenue Response in JSON Format

    //   if(output.order_status === 'Failure') {
    //      // DO YOUR STUFF
    //     res.writeHead(301,
    //       {Location: 'https://yoururlgoeshere.com/client-side-failureroute'}
    //     );
    //     res.end();
    //   } else if (output.order_status === 'Success') {
    //       // DO YOUR STUFF
    //       res.writeHead(301,
    //         {Location: 'https://yoururlgoeshere.com/client-side-successroute'}
    //       );
    //       res.end();
    //     }
    //   }

    /////////////////////////////////////////////////////////////////
    // req.body.id = req.body.id ? req.body.id : null;

    // // console.log(knex.raw("Call pbx_get_voicemail(" + req.body.id + ")").toString());

    // knex.raw("Call pbx_get_voicemail(" + req.body.id + ")")
    //     .then((response) => {
    //         if (response) {
    //             res.send({ response: response[0][0] });
    //         }
    //     }).catch((err) => {
    //         res.send({ response: { code: err.errno, message: err.sqlMessage } });
    //     });
}


module.exports = {
    payHere
};
