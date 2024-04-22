const config = require('../config/app');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
var moment = require('moment');
const { response } = require('express');
/**
* Returns jwt token if valid email and password is provided
* @param req
* @param res
* @returns {*}
*/
 

function createImGroup(req,res) {     
    let data = req.body;        
    let sip = "'"+data.sip+"'";
    let name = "'"+data.name+"'";
    console.log(sip,"data>>>>>>>>>>>>>>>>>>>>");
    let sql = knex.raw("call pbx_saveImGroup("+ name +","+ data.ext_name +","+ sip +","+ null +")");
    console.log(sql.toString());
    sql.then((response) => {        
        if(response) { 
            if(response[0][0] != undefined){
                if(response[0][0] != "")                
                res.send({                    
                    status_code: 403,
                    message: "Group name already exist."                 
                })                  
            }else{
                res.send({
                    status_code: 200,
                    message: "created Successfully."
                })
            }            
        }
    })
}

function updateImGroup(req, res){
    let data = req.body;    
    let ext_name = data.ext_name ? data.ext_name : null;
    let sip = "'"+data.sip+"'";
    let id = data.id;
    let name = "'"+data.name+"'";  
    let sql = knex.raw("call pbx_saveImGroup("+name+","+ext_name+","+sip+","+id+")");
    console.log(sql.toString(),"----------------------string ");
    sql.then((response) => {
        console.log(response[0][0][0]['code'],"-----------data");
        if(response[0][0][0]['code'] == '403'){
            res.send({
                status_code : 403,
                message: "group name already exist"
            })
        }else{
            res.send({
                status_code: 200,
                message : "updated successfully"
            });
        }
        
    })
    // let sql = knex(table.tbl_im_group)
    // .update({ name: name,sip : sip  })
    // .where('id',id)     
    // sql.then((response) => {
    //     if(response){
    //         console.log(response);
    //         if(response[0][0] != undefined){
    //             if(response[0][0] != ""){
    //                 res.send({
    //                     status_code : 403,
    //                     message: "group name already exist"
    //                 })
    //             }else{
    //                 res.send({status_code: 200,
    //                     message : "updated successfully"
    //                 })  
    //             }
    //         }
    //     }
             
    // });
}


function viewImGroup(req, res) {       
    let extension_id = req.query.extension_id     
    let sql = knex.raw("call pbx_viewImGroup("+ extension_id +")")
    sql.then((response) =>{        
        if(response){
            res.send(response[0][0]);
        }
    });
}

function getGroupById(req,res){    
    let id = req.query.id;
    let sql = knex.raw("call pbx_getImGroupById(" + id + ")")
    console.log(sql.toString());
    sql.then((response)=>{
        if(response){
            res.send(response[0][0][0]);
        }
    })
}

function filterImGroup(req,res){    
    let data = req.body.filters;    
    id = req.body.id    
    data.by_name = data.by_name ? ("" + data.by_name + "") : null
    data.by_sip = data.by_sip ? ("" +data.by_sip+ "") : null                    
    let array =[];
    let datas;
    if(data.by_sip != null && data.by_sip != ''){                      
        let sip = data.by_sip.split(',');        
        let Length = sip.length;   
        for(let i=0; i<sip.length; i++) {
            if(Length == i+1){
                array[i] = "locate("+sip[i]+",sip)";
            }else{
                array[i] = "locate("+sip[i]+",sip) or"; 
            }
        }        
        datas = array.join(' '); 
    }
    
    let sql = knex(table.tbl_im_group).select('*').where('extension_id',id);
    if(data.by_name != null){
        sql.andWhere('name','like','%'+data.by_name+'%');
    }
    if(data.by_sip != null && data.by_sip != ''){        
        sql.andWhere(knex.raw("("+datas+")"));
    }    
    console.log(sql.toQuery(),"-------------------to query>>>>>>>>>>>>>");
    sql.then((response) => {        
        res.send(
            response
        );
    })
}



function deleteImGroup(req, res) {
    console.log(req);
    let id = parseInt(req.body.id);
    console.log('id',id)
    var sql = knex.from(table.tbl_im_group).where('id', '=', "" + id + "").del();
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


module.exports = {
    viewImGroup,deleteImGroup,createImGroup,getGroupById, updateImGroup,filterImGroup
};