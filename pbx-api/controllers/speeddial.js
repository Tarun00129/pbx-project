const { knex } = require('../config/knex.db');

function createSpeedDial(req, res) {
    //let v = req.body.arr_val
    // console.log("Call pbx_save_speeddial('" + req.body.extid + "','" + req.body.arr_val + "')")
    knex.raw("Call pbx_save_speeddial('" + req.body.extid + "','" + req.body.arr_val + "')")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}


function viewSpeedDialById(req, res) {
    req.body.id = req.body.id ? req.body.id : null;

    // console.log(  knex.raw("Call pbx_get_speeddial(" + req.body.id + ")").toString());

    knex.raw("Call pbx_get_speeddial(" + req.body.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}





module.exports = {
    createSpeedDial, viewSpeedDialById
};
