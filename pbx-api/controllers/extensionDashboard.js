const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

function getExtensionDashboardSpeeddial(req, res) {
    let id = parseInt(req.query.extensionId);
    knex.select('s.id', 's.digit',
    knex.raw('IF (s.country_id = 0,s.number,CONCAT(CONCAT("+",c.phonecode), space(1),TRIM(LEADING (CONCAT("+",c.phonecode)) FROM (s.number)))) as phoneNumber'))
        .from(table.tbl_Speed_Dial + ' as s')
        .leftOuterJoin(table.tbl_Country + ' as c', 's.country_id', 'c.id')
        .leftOuterJoin(table.tbl_Extension_master + ' as e', 's.extension_id', 'e.id')
        .where('s.extension_id', '=', "" + id + "")
        .orderBy('s.digit', 'asc')
        .then((response) => {
            // if (response.length > 0) {
            res.json({
                response

            });

        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Speed Dial error' }); throw err });
}

function getExtensionDashboardCallForward(req, res) {
    // console.log('req=', req.query.extensionId);
    let id = parseInt(req.query.extensionId);

    knex.select('t.id', 't.universal_type',
        // knex.raw('If(t.universal_type = "0","Disabled",if(t.universal_type = "1", "Voicemail",if(t.universal_type = "2",CONCAT(CONCAT("+",s.phonecode), space(1),TRIM(LEADING (CONCAT("+",s.phonecode)) FROM (t.universal_external))), t.universal_external))) as universal_external'),
        knex.raw('If(t.universal_type = "0","Disabled",if(t.universal_type = "1", "Voicemail",if(t.universal_type = "2",CONCAT(t.universal_country_code, space(1),t.universal_external), t.universal_external  ))) as universal_external'),
        't.busy_type',
        // knex.raw('If(t.busy_type = "0","Disabled",if(t.busy_type = "1", "Voicemail",if(t.busy_type = "2",CONCAT(CONCAT("+",s.phonecode), space(1),TRIM(LEADING (CONCAT("+",s.phonecode)) FROM (t.busy_external))) , t.busy_external))) as busy_external'),
        knex.raw('If(t.busy_type = "0","Disabled",if(t.busy_type = "1", "Voicemail",if(t.busy_type = "2",CONCAT(t.busy_country_code, space(1),t.busy_external), t.busy_external  ))) as busy_external'),
        't.noanswer_type',
        knex.raw('If(t.noanswer_type = "0","Disabled",if(t.noanswer_type = "1", "Voicemail",if(t.noanswer_type = "2",CONCAT(t.noanswer_country_code, space(1),t.noanswer_external), t.noanswer_external  ))) as noanswer_external'),
        // knex.raw('If(t.noanswer_type = "0","Disabled",if(t.noanswer_type = "1", "Voicemail",if(t.noanswer_type = "2",CONCAT(CONCAT("+",s.phonecode), space(1),TRIM(LEADING (CONCAT("+",s.phonecode)) FROM (t.noanswer_external))), t.noanswer_external))) as noanswer_external'),
        't.unavailable_type',
        // knex.raw('If(t.unavailable_type = "0","Disabled",if(t.unavailable_type = "1", "Voicemail",if(t.unavailable_type = "2",CONCAT(CONCAT("+",s.phonecode), space(1),TRIM(LEADING (CONCAT("+",s.phonecode)) FROM (t.unavailable_external))), t.unavailable_external)))  as unavailable_external'),
        knex.raw('If(t.unavailable_type = "0","Disabled",if(t.unavailable_type = "1", "Voicemail",if(t.unavailable_type = "2",CONCAT(t.unavailable_country_code, space(1),t.unavailable_external), t.unavailable_external  ))) as unavailable_external'),
        )
        .from(table.tbl_Call_Forward + ' as t')
        .leftOuterJoin(table.tbl_Country + ' as s', 't.country_id', 's.id')
        .where('extension_id', '=', "" + id + "")
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Speed Dial error' }); throw err });
}

function getExtensionDashboardFeatures(req, res) {
    let id = parseInt(req.query.extensionId);

    knex.select('exm.id', 'exm.customer_id', 'exm.balance_restriction', 'exm.multiple_registration',
        'exm.voicemail', 'exm.dnd', 'exm.outbound', 'exm.recording', 'exm.black_list', 'exm.call_transfer', 'exm.forward', 'exm.speed_dial','exm.ringtone','exm.click_to_call','f.custom_prompt')
        .from(table.tbl_Extension_master + ' as exm')
        .leftJoin(table.tbl_Customer + " as cust","cust.id","exm.customer_id" )
        .leftJoin(table.tbl_Map_customer_package + " as mp","mp.customer_id","cust.id" )
        .leftJoin(table.tbl_Package + " as pckg","pckg.id","mp.package_id" )
        .leftJoin(table.tbl_PBX_features + ' as f', 'f.id', 'pckg.feature_id')
        .where('exm.id', '=', "" + id + "")
        .then((response) => {
            const extension = response[0];
            res.json({
                black_list: extension.black_list ? extension.black_list : '0',
                call_transfer: extension.call_transfer ? extension.call_transfer : '0',
                forward: extension.forward ? extension.forward : '0',
                speed_dial: extension.speed_dial ? extension.speed_dial : '0',
                recording: extension.recording ? extension.recording : '0',
                balance_restriction: extension.balance_restriction ? extension.balance_restriction : '0',
                multiple_registration: extension.multiple_registration ? extension.multiple_registration : '0',
                voicemail: extension.voicemail ? extension.voicemail : '0',
                dnd: extension.dnd ? extension.dnd : '0',
                outbound: extension.outbound ? extension.outbound : '0',
                ringtone: extension.ringtone ? extension.ringtone : '0',
                custom_prompt_package : extension.custom_prompt ? extension.custom_prompt : 0,
                click_to_call : extension.click_to_call ? extension.click_to_call : '0',
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: err, message: 'Features not available' }); throw err });

}

function getExtensionDashboardVoiceMail(req, res) {
    let id = parseInt(req.query.extensionId);
    knex.select('id', 'voicemailToEmail', 'delVoicemailAfterEmail'
        , 'deliverVoicemailTo', 'announceCallerID')
        .from(table.tbl_voicemail)
        .where('extension_id', '=', "" + id + "")
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'Voicemail not available' }); throw err });
}

module.exports = {
    getExtensionDashboardSpeeddial, getExtensionDashboardCallForward,
    getExtensionDashboardFeatures, getExtensionDashboardVoiceMail
};