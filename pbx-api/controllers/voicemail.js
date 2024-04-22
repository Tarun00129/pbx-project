const config = require('../config/app');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

function createVoicemail(req, res) {
    let voicemailToEmail = '';
    if (req.body.voicemail.voicemailToEmail || req.body.voicemail.voicemailToEmail === '1' || req.body.voicemail.voicemailToEmail === true || req.body.voicemail.voicemailToEmail === '') {
        voicemailToEmail = '1';
    } else {
        voicemailToEmail = '0';
    }
    let deliverVoicemailTo = '';
    if (req.body.voicemail.deliverVoicemailTo || req.body.voicemail.deliverVoicemailTo === '1' || req.body.voicemail.deliverVoicemailTo === true || req.body.voicemail.deliverVoicemailTo === '') {
        deliverVoicemailTo = '1';
    } else {
        deliverVoicemailTo = '0';
    }
    let announceCallerID = '';
    if (req.body.voicemail.announceCallerID || req.body.voicemail.announceCallerID === '1' || req.body.voicemail.announceCallerID === true || req.body.voicemail.announceCallerID === '') {
        announceCallerID = '1';
    } else {
        announceCallerID = '0';
    }
    let delVoicemailAfterEmail = '';
    if (req.body.voicemail.delVoicemailAfterEmail || req.body.voicemail.delVoicemailAfterEmail === '1' || req.body.voicemail.delVoicemailAfterEmail === true || req.body.voicemail.delVoicemailAfterEmail === '') {
        delVoicemailAfterEmail = '1';
    } else {
        delVoicemailAfterEmail = '0';
    }
    let otherEmail = '';
    if (req.body.voicemail.otherEmail) {
        otherEmail = req.body.voicemail.otherEmail;
    } else {
        otherEmail = '';
    }

    knex.raw("Call pbx_save_voicemail(" + req.body.voicemail.id + "," + voicemailToEmail + "," + delVoicemailAfterEmail + ",\
    " + deliverVoicemailTo + "," + announceCallerID + ",'" + otherEmail + "',0," + req.body.voicemail.extension_id + ",'1')")
        .then((response) => {
            if (response) {
                res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });


}


function viewVoiceMailById(req, res) {
    req.body.id = req.body.id ? req.body.id : null;

    // console.log(knex.raw("Call pbx_get_voicemail(" + req.body.id + ")").toString());

    knex.raw("Call pbx_get_voicemail(" + req.body.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}


module.exports = {
    createVoicemail, viewVoiceMailById
};
