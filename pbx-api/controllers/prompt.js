const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

function updatePrompt(req, res) { 
    var data = req.body.prompt;
   let sql =  knex(table.tbl_pbx_prompt)
    .count('prompt_name as nameCount')
    .where('prompt_name', data.prompt_name)
    .andWhere('prompt_type', data.promtTypeId)
    .whereNot('id', data.id);
    console.log(sql.toQuery());
    sql.then((response) => {
        console.log(response)
        console.log('updateeeeeee');
        if (response[0].nameCount > 0) {
            res.json({
                code : 409, // 409 is given for duplicate name : - Nagender
                error_msg: 'Prompt Name is already Exist'
            });
        } else {
            knex(table.tbl_pbx_prompt).where('id', '=', "" + data.id + "")
            .update({ prompt_name: "" + data.prompt_name + "",
                      prompt_desc: "" + data.prompt_description + "" })
            .then((response) => {
                if (response === 1) {
                    res.json({
                        response
                    });
                } else {
                    res.status(401).send({ error: 'Success', message: 'Provider updated' });
                }
            }).catch((err) => { console.log(err); throw err });
        }
    })
}


function deletePrompt(req, res) {
    let id = parseInt(req.body.id);
    console.log('id',id)
    var sql = knex(table.tbl_pbx_prompt).where('id', '=', "" + id + "")
        .update({ status: 0 });
    sql.then((response) => {
        console.log(response)
        if (response == 1) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'Prompt not deleted' });
        }
    }).catch((err) => { console.log(err); throw err });
}

function getPromptById(req, res) {
    let id = parseInt(req.query.id);
    knex.select('prompt_name', 'prompt_type', 'file_path', 'id', 'customer_id', 'prompt_desc')
        .from(table.tbl_pbx_prompt)
        .where('id', '=', id)
        .then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function promptDetails(req, res) {
    var sql = knex.select('prompt_name', 'prompt_type', 'file_path', 'id', 'customer_id', 'prompt_desc')
        .from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.body.user_id)
        .andWhere('status', '=', '1')
        .orderBy('id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getPromptByFilters(req, res) {
    let data = req.body.filters;
    //console.log(data);
    let sql = knex.select('prompt_name', 'prompt_type', 'file_path', 'id', 'customer_id', 'prompt_desc')
        .from(table.tbl_pbx_prompt)
        .where('customer_id', '=', data.customer_id)
        .andWhere('status', '=', '1')
        .orderBy('id', 'desc');

    if (data.by_name != '' && data.by_type == '') {
        sql = sql.andWhere('prompt_name', 'like', "%" + data.by_name + "%");
    } else if (data.by_name == '' && data.by_type != '') {
        sql = sql.andWhere('prompt_type', '=', "" + data.by_type + "");
    } else if (data.by_name != '' && data.by_type != '') {
        sql = sql.andWhere('prompt_name', 'like', "%" + data.by_name + "%")
            .andWhere('prompt_type', '=', "" + data.by_type + "");
    } else {
        sql = sql;
    }
//console.log(sql.toString());
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function getMOHPrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        .whereIn('prompt_type',['1','17'])
        .andWhere('status', '=', '1')
        .orderBy('id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getConferencePrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        // .andWhere('prompt_type','=','4')
        .whereIn('prompt_type',['4','17'])
        .andWhere('status', '=', '1')
        .orderBy('id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getQueuePrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        // .andWhere('prompt_type','=','5')
        .whereIn('prompt_type',['5','17'])
        .andWhere('status', '=', '1')
        .orderBy('id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getIVRPrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        // .andWhere('prompt_type','=','3')
        .whereIn('prompt_type',['3','17'])
        .andWhere('status', '=', '1')
        .orderBy('prompt_name', 'asc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getTimeGroupPrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        // .andWhere('prompt_type','=','6')
        .whereIn('prompt_type',['6','17'])
        .andWhere('status', '=', '1')
        .orderBy('id', 'desc');
    console.log(sql.toQuery());    
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getTimeGroupPromptForExtension(req, res) {
    let extensionId = req.query.customerId;
    var sql = knex.select('customer_id').from(table.tbl_Extension_master)
        .where('id', '=', extensionId)
    sql.then((response) => {
        if (response) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
            console.log(response);
            let customer_id = response ? response[0]['customer_id']  : 0 ;
            var sql2 = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
                .where('customer_id', '=', customer_id)
                // .andWhere('prompt_type', '=', '6')
                .whereIn('prompt_type',['6','17'])
                .andWhere('status', '=', '1')
                .orderBy('id', 'desc');
            sql2.then((response) => {
                res.json({
                    response
                })
            }).catch((err) => { console.log(err); throw err });
        }
    }).catch((err) => { console.log(err); throw err });
}


function getTCPrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        // .andWhere('prompt_type','=','10')
        .whereIn('prompt_type',['10','17'])
        .andWhere('status', '=', '1')
        .orderBy('id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getBCPrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        // .andWhere('prompt_type','=','11')
        .whereIn('prompt_type',['11','17'])
        .andWhere('status', '=', '1')
        .orderBy('id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getPromptAssociated(req, res) {
    let prompt_id = Number(req.query.prompt_id);
    let prompt_type = (req.query.prompt_type);
    console.log('=======prompt_type==========',prompt_type)
    if(prompt_type == '1'){ // MOH
        var countQuery = knex.select(knex.raw('COUNT(cl.id) as count'))
        .from(table.tbl_PBX_CALLGROUP + ' as cl')
        .leftJoin(table.tbl_PBX_queue + ' as q', 'q.moh', prompt_id)
        .leftJoin(table.tbl_PBX_conference + ' as conf', 'conf.moh', prompt_id)
        .where('cl.moh','=', prompt_id)
        .orWhere('q.moh', '=', prompt_id)
        .orWhere('conf.moh', '=', prompt_id);
    countQuery.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

 
      }else if(prompt_type == '2'){ //VOICE MAIL
        var countQuery = knex.select(knex.raw('COUNT(ivrd.ivr_id) as count'))
        .from(table.tbl_pbx_ivr_detail + ' as ivrd')
        // .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd', 'ivrd.ivr_action', prompt_id)
        // .where('bc.welcome_prompt','=', prompt_id)
        .orWhere('ivrd.ivr_action', '=', prompt_id);
    countQuery.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
        

    } else if (prompt_type == '3') { //IVR
        var countQuery = knex.select(knex.raw('COUNT(ivr.customer_id) as count'))
            .from(table.tbl_Pbx_Ivr_Master + ' as ivr')
            .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd','ivrd.ivr_id','ivr.id')
            .where('ivr.welcome_prompt','=', prompt_id)
            .orWhere('ivr.repeat_prompt', '=', prompt_id)
            .orWhere('ivr.invalid_sound', '=', prompt_id)
            .orWhere('ivr.timeout_prompt', '=', prompt_id)
            .orWhere('ivr.timeout_prompt', '=', prompt_id)
            .orWhere('ivrd.ivr_action', '=', prompt_id);
        countQuery.then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
      
    }else if(prompt_type == '4'){ //CONFERENCE
        var countQuery = knex.select(knex.raw('COUNT(conf.customer_id) as count'))
            .from(table.tbl_PBX_conference + ' as conf')
            .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd', 'ivrd.ivr_action',prompt_id)
            .where('conf.welcome_prompt', '=', prompt_id)
            .orWhere('ivrd.ivr_action', '=', prompt_id);
        countQuery.then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

      }else if(prompt_type == '5'){ //QUEUE
        var countQuery = knex.select(knex.raw('COUNT(q.id) as count'))
            .from(table.tbl_PBX_queue + ' as q')
            .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd', 'ivrd.ivr_action', prompt_id)
            .where('q.welcome_prompt', '=', prompt_id)
            .orWhere('ivrd.ivr_action', '=', prompt_id);
        countQuery.then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
     
    }else if(prompt_type == '6'){ //TIME GROUP
        var countQuery = knex.select(knex.raw('COUNT(tg.id) as count'))
        .from(table.tbl_Time_Group + ' as tg')
        .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd', 'ivrd.ivr_action', prompt_id)
        .where('tg.prompt_id', '=', prompt_id)
        .orWhere('ivrd.ivr_action', '=', prompt_id);
    countQuery.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

      }else if(prompt_type == '10'){ //TELE CONSULTATION
        var countQuery = knex.select(knex.raw('COUNT(tc.id) as count'))
        .from(table.tbl_pbx_tc + ' as tc')
        .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd', 'ivrd.ivr_action', prompt_id)
        .where('tc.welcome_prompt','=', prompt_id)
        .orWhere('tc.periodic_announcement_prompt', '=', prompt_id)
        .orWhere('ivrd.ivr_action', '=', prompt_id);
    countQuery.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

      }else if(prompt_type == '11'){  //BROADCAST
        var countQuery = knex.select(knex.raw('COUNT(bc.id) as count'))
        .from(table.tbl_pbx_broadcast + ' as bc')
        .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd', 'ivrd.ivr_action', prompt_id)
        .where('bc.welcome_prompt','=', prompt_id)
        .orWhere('ivrd.ivr_action', '=', prompt_id);
    countQuery.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    } else if (prompt_type == '15') {  //RINGTONE
        var countQuery = knex.select(knex.raw('COUNT(em.id) as count'))
            .from(table.tbl_Extension_master + ' as em')
            // .leftJoin(table.tbl_pbx_ivr_detail + ' as ivrd', 'ivrd.ivr_action', prompt_id)
            .where('em.ringtone', '=', prompt_id);
            // .orWhere('ivrd.ivr_action', '=', prompt_id);
        countQuery.then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else if (prompt_type == '16') {  //CALL GROUP
        var countQuery = knex.select(knex.raw('COUNT(cg.id) as count'))
            .from(table.tbl_PBX_CALLGROUP + ' as cg')
            .where('cg.prompt', '=', prompt_id);
        countQuery.then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else if (prompt_type == '17') {  //GENERAL
        var countQuery = knex.select(knex.raw('COUNT(cg.id) as count'))
            .from(table.tbl_PBX_CALLGROUP + ' as cg')
            .where('cg.prompt', '=', prompt_id);
        countQuery.then((response) => {
            if (response) {
                res.json({
                    response
                });
            } else {
                res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    } else {
       // pagedData[i]['prompt_type_name'] = '';
      }
    }

function getCallGroupPrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        // .andWhere('prompt_type', '=', '16')
        .whereIn('prompt_type',['16','17'])
        .andWhere('status', '=', '1')
        .orderBy('id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}

function getGeneralPrompt(req, res) {
    var sql = knex.select('prompt_name', 'id').from(table.tbl_pbx_prompt)
        .where('customer_id', '=', req.query.customerId)
        .andWhere('prompt_type', '=', '17').andWhere('status', '=', '1')
        .orderBy('id', 'desc');
    sql.then((response) => {
        res.json({
            response
        })
    }).catch((err) => { console.log(err); throw err });
}


module.exports = {
    promptDetails, getPromptByFilters, getPromptById, deletePrompt, updatePrompt,
    getMOHPrompt,getConferencePrompt,getQueuePrompt,getIVRPrompt,getTimeGroupPrompt,getTimeGroupPromptForExtension,
    getTCPrompt, getBCPrompt,getPromptAssociated, getCallGroupPrompt
};
