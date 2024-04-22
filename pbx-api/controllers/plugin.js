const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

function getPluginByCustomer(req,res){    
    let id = req.query.id
   let sql =  knex.select('p.name','p.description','p.call_type',knex.raw('if(p.status = "Y", "Active", "Inactive") as status'),'ppa.action_value','ppa.action_type').from(table.tbl_pbx_plugin + ' as p')
   .join(table.tbl_plugin_action + ' as ppa', 'ppa.plugin_id', 'p.id')
   .where('p.customer_id',id)
   sql.then((response)=>{       
    res.send({
        response :response
    });
   }).catch((err) => { console.log(err); throw err });
}

function createPlugin(req,res){
    let destination = [];
    let plug_Action = [];
    req.body.destiantionList.map(data => {
        destination.push({dest_prefix: data.dest_prefix, otp_verification: data.otp_verification, customer_id: req.body.customer_id})
    }) 
    req.body.name = req.body.name ? "'" + req.body.name + "'" : null;
    req.body.description = req.body.description ? "'" + req.body.description + "'" : null;    
    let sql = knex(table.tbl_pbx_plugin).insert({name: req.body.name, description: req.body.description,
         call_type: req.body.call_type, lang: req.body.language, plugin_default_state: req.body.default_state,
         display_delay_time: req.body.display_time, expand_delay_time: req.body.expand_time, status: req.body.status})
         console.log(sql.toQuery(),"TO QUERy");
    sql.then((response) => {               
        destination.map(item => Object.assign(item, {plugin_id : response[0]}));        
        let sql1 = knex(table.tbl_pbx_plugin_destination).insert(destination)        
        sql1.then((response1 => {
            req.body.pluginAction.map(data => {
                plug_Action.push({action_name: data.name, action_type: data.action_type, action_value: data.action_value, plugin_id: response[0]})
            })
            let sql3 = knex(table.tbl_plugin_action).insert(plug_Action)            
            sql3.then((response2) => {
                res.send({
                    status_code: 200
                })                
            })
        }))
    })        
}


module.exports = {getPluginByCustomer,createPlugin};
