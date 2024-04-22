
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros');
var fs = require('fs');
var path = require('path');
var moment = require('moment');
const { strict } = require('assert');

function getRecordingList(req, res) {
    // var arr = [];
    // var count = 0;
    // var filePath = '';
    if (req.body.role == '1' && req.body.type == 'normalRecording') {
    var customer_id = req.body.id
    var sql = knex.from(table.tbl_pbx_recording + ' as r')
        .select('r.*','r.src as extension', 'r.dest as callee_ext',knex.raw('DATE_FORMAT(r.created_at, "%d/%m/%Y %H:%i:%s") as time'),  knex.raw('CONCAT("/assets/prompts/",r.customer_id,"/recording/",r.file_name) as file_path'),'r.type as call_type')
        .where('r.customer_id',customer_id)
        .orderBy('r.id', 'desc');
    // console.log(sql.toQuery())
    sql.then((response) => {
        res.json({
            response: response,
            code: 200
        })
    }).catch((err) => { console.log(err); throw err });
    } else if (req.body.role == '6' && req.body.type == 'normalRecording') {
            knex.from(table.tbl_Extension_master).where('id', '=', "" + req.body.id + "")
            .select('ext_number', 'customer_id')
            .then((response) => {
                if (response.length > 0) {
                    let ent = Object.values(JSON.parse(JSON.stringify(response)));
                    let extNumber = ent[0].ext_number;
                    let customerId = ent[0].customer_id;
                    var sql = knex.from(table.tbl_pbx_recording + ' as r')
                        .select('r.*', 'r.src as extension', 'r.dest as callee_ext',knex.raw('DATE_FORMAT(r.created_at, "%d/%m/%Y %H:%i:%s") as time'), knex.raw('CONCAT("/assets/prompts/",r.customer_id,"/recording/",r.file_name) as file_path'), 'r.type as call_type')
                        .andWhere((builder) =>
                            builder.where('r.src', '=', extNumber)
                                .orWhere('r.dest', '=', extNumber)
                                )
                        .orderBy('r.id', 'desc');
                    sql.then((response) => {
                        res.json({
                            response: response,
                            code: 200 
                        })
                    }).catch((err) => { console.log(err); throw err });
                }
            })
    }  else if (req.body.role == '6' && req.body.type == 'voicemailRecording') {
        knex.from(table.tbl_Extension_master).where('id', '=', "" + req.body.id + "")
        .select('ext_number', 'customer_id')
        .then((response) => {
            if (response.length > 0) {
                let ent = Object.values(JSON.parse(JSON.stringify(response)));
                let extNumber = ent[0].ext_number;
                let customerId = ent[0].customer_id;
                var sql = knex.from(table.tbl_pbx_voicemail_recording + ' as r')
                    .select('r.*', 'r.src as extension', 'r.dest as callee_ext',knex.raw('DATE_FORMAT(r.created_at, "%d/%m/%Y %H:%i:%s") as time'), knex.raw('CONCAT("/assets/prompts/",r.customer_id,"/vm/","@extNumber","/",r.file_name) as file_path'))
                    .andWhere((builder) =>
                        builder.where('r.src', '=', extNumber)
                            .orWhere('r.dest', '=', extNumber)
                            )
                    .orderBy('r.id', 'desc');
                    console.log(sql.toQuery());
                sql.then((response) => {
                    let arrMap  = response ? response : [];
                    arrMap = arrMap.map(item => {
                        let res = item;
                        console.log('extNumber',extNumber);
                        console.log("res['file_path']",res['file_path']);
                        res['file_path'] =   (res['file_path']).replace('@extNumber',extNumber) 
                        return res;
                    });
                    res.json({
                        response: response,
                        code: 200 
                    })
                }).catch((err) => { console.log(err); throw err });
            }
        })
    }  

    // if (req.body.role == '1' && req.body.type == 'normalRecording') {
    //     filePath = path.join(__dirname, '../upload/', + req.body.id + '/recording/');
    //     fs.readdir(filePath, function (err, files) {
    //         if (err) {
    //             console.log('Unable to scan directory:' + err);
    //             return res.send({ code: 501, response: '' });
    //         }
    //         files = files.map(function (fileName) {
    //             return {
    //                 name: fileName,
    //                 time: fs.statSync(filePath + '/' + fileName).birthtime.getTime()
    //             };
    //         }).sort(function (a, b) {
    //             return b.time - a.time;
    //         }).map(function (v) {
    //             // console.log('v.name=',v.name);
    //             let stats = fs.statSync(filePath + '/' + v.name);
    //             let birthtime = stats.birthtime;
    //             let createdDate = moment(birthtime).format('DD/MM/YYYY HH:MM')
    //             count = count + 1;
    //             let splitPart = v.name.split("_");
    //             let caller = splitPart[1].substring(3);
    //             let callee = splitPart[2].substring(3);
    //             let fileType = "";
    //             if (splitPart[0] == "queue") {
    //                 fileType = "Call Group";
    //             } else if (splitPart[0] == "conf") {
    //                 fileType = "Conference";
    //             } else if (splitPart[0] == "call") {
    //                 fileType = "Speed Dial";
    //             } else {
    //                 fileType = "";
    //             }
    //             arr.push({ id: count, name: v.name, file_type: fileType, extension: caller, callee_ext: callee, time: createdDate, file_path: '/assets/prompts/' + req.body.id + '/recording/' + v.name });
    //         });

    //         return res.send({ code: 200, response: arr });
    //     });
    // } else if (req.body.role == '6' && req.body.type == 'normalRecording') {
    //     knex.from(table.tbl_Extension_master).where('id', '=', "" + req.body.id + "")
    //         .select('ext_number', 'customer_id')
    //         .then((response) => {
    //             if (response.length > 0) {
    //                 let ent = Object.values(JSON.parse(JSON.stringify(response)));
    //                // console.log('ent====', ent);
    //                 let extNumber = ent[0].ext_number;
    //                 let customerId = ent[0].customer_id;
    //                 filePath = path.join(__dirname, '../upload/', + customerId + '/recording/');
    //                 fs.readdir(filePath, function (err, files) {
    //                     if (err) {
    //                         console.log('Unable to scan directory:' + err);
    //                         return res.send({ code: 501, response: '' });
    //                     }
                        
    //                     files = files.map(function (fileName) {
                           
    //                         return {
    //                             name: fileName,
    //                             time: fs.statSync(filePath + '/' + fileName).birthtime.getTime()
    //                         };

    //                     })
    //                         .sort(function (a, b) {
    //                             return b.time - a.time;
    //                         })
    //                         .map(function (v) {
                                 
    //                             let stats = fs.statSync(filePath + '/' + v.name);
    //                             let birthtime = stats.birthtime;
    //                             let createdDate = moment(birthtime).format('DD/MM/YYYY HH:MM')
    //                             count = count + 1;
    //                             let splitPart = v.name.split("_");
                                
    //                             let fileType = "";
    //                             let caller = splitPart[1].substring(3);
                                
    //                             let callee = splitPart[2].substring(3);
    //                             if (splitPart[0] == "queue") {
    //                                 fileType = "Call Group";
    //                             } else if (splitPart[0] == "conf") {
    //                                 fileType = "Conference";
    //                             } else if (splitPart[0] == "call") {
    //                                 fileType = "Sip calls";
    //                             } else {
    //                                 fileType = "";
    //                             }
    //                            ;
    //                             if (caller == extNumber) {
    //                                  //console.log('test1111111');
    //                                 arr.push({ id: count, name: v.name, file_type: fileType, extension: caller, callee_ext: callee, time: createdDate, file_path: '/assets/prompts/' + customerId + '/recording/' + v.name });
    //                             }
                               
    //                         });
                            
    //                     return res.send({ code: 200, response: arr });
    //                 });
    //             }
    //         }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    // } else if (req.body.role == '6' && req.body.type == 'voicemailRecording') {
    //     knex.select('ext_number', 'customer_id').from(table.tbl_Extension_master)
    //         .where('id', '=', "" + req.body.id + "")
    //         .then((response1) => {
    //             if (response1.length > 0) {
    //                 let extNumber = Object.values(JSON.parse(JSON.stringify(response1)));
    //                 let number = extNumber[0].ext_number;
    //                 let custId = extNumber[0].customer_id;
    //                 filePath = path.join(__dirname, '../upload/', +custId + '/vm/' + number + '/');
    //                 // console.log('filePath=', filePath);
    //                 fs.readdir(filePath, function (err, files) {
    //                     if (err) {
    //                         console.log('Unable to scan directory:' + err);
    //                         return res.send({ code: 501, response: '' });
    //                     }
    //                     files = files.map(function (fileName) {
    //                         return {
    //                             name: fileName,
    //                             time: fs.statSync(filePath + '/' + fileName).birthtime.getTime()
    //                         };
    //                     })
    //                         .sort(function (a, b) {
    //                             return b.time - a.time;
    //                         })
    //                         .map(function (v) {
    //                             let stats = fs.statSync(filePath + '/' + v.name);
    //                             let birthtime = stats.birthtime;
    //                             let createdDate = moment(birthtime).format('DD/MM/YYYY HH:MM')
    //                             count = count + 1;
    //                             arr.push({ id: count, name: v.name, number: number, time: createdDate, file_path: '/assets/prompts/' + custId + '/vm/' + number + '/' + v.name });
    //                         });
    //                     return res.send({ code: 200, response: arr });
    //                 });
    //             } else {
    //                 res.status(401).send({ error: 'Unauthorized', message: 'Can not find extension number' });
    //             }
    //         }).catch((err) => { { console.log(err); throw err } });
    // }
}

function deleteRecording(req, res) {
    console.log(req.body);
    var filePath = "";
    if (req.body.role == '1') {
        filePath = path.join(__dirname, '../upload/', +req.body.id + '/recording/');
        fs.unlink(filePath + req.body.filename, function (err, files) {
            if (err) {
                console.log('Unable to scan directory:' + err);
                return res.send({ code: 400, message: 'Unable to scan directory:' + err });
            }else{
               let sql= knex.from(table.tbl_pbx_recording).del()
                    .where('file_name', '=', "" + req.body.filename + "")
                    console.log(sql.toString());
                    sql.then((response) => {
                        return res.send({ code: 200, message: 'Recording deleted successfully' });
                    }).catch((err) => { { console.log(err); throw err } });
            }

        });

    } else if (req.body.role == '6') {
        knex.select('ext_number', 'customer_id').from(table.tbl_Extension_master)
            .where('id', '=', "" + req.body.id + "")
            .then((response1) => {
                if (response1.length > 0) {
                    let extNumber = Object.values(JSON.parse(JSON.stringify(response1)));
                    let number = extNumber[0].ext_number;
                    let custId = extNumber[0].customer_id;
                    if (req.body.type == 'vm') {
                        filePath = path.join(__dirname, '../upload/', + custId + '/vm/' + number + '/');
                    } else {

                        filePath = path.join(__dirname, '../upload/', + custId + '/recording/');
                    }
                    fs.unlink(filePath + req.body.filename, function (err, files) {
                        if (err) {
                            console.log('Unable to scan directory:' + err);
                            return  res.send({ code: 400, message: 'Unable to scan directory:' + err }); 
                        }else if(req.body.type == "vm"){
                            knex.from(table.tbl_pbx_voicemail_recording).del()
                                .where('file_name', '=', "" + req.body.filename + "")
                                .then((response) => {
                                    return res.send({ code: 200, message: 'Voicemail Recording deleted successfully' });
                                }).catch((err) => { { console.log(err); throw err } });
                        }
                        else{
                            knex.from(table.tbl_pbx_recording).del()
                                .where('file_name', '=', "" + req.body.filename + "")
                                .then((response) => {
                                    return res.send({ code: 200, message: 'Recording deleted successfully' });
                                }).catch((err) => { { console.log(err); throw err } });
                        }
                        // return res.send({ code: 200, message: 'Recording deleted successfully' });
                    });

                } else {
                    res.status(401).send({ error: 'Unauthorized', message: 'Can not find extension number' });
                }
            }).catch((err) => { { console.log(err); throw err } });
    }
}

function filterRecordingList(req, res) {
    // console.log(req.body)
    let data = req.body.filters;
    // var arr = [];
    // var dateArr = [];
    // var obj = {};
    // var count = 0;
    // var filePath = '';
    let rangeFrom = data.by_range ? data.by_range[0] : null;
    let rangeTo = data.by_range ? data.by_range[1] : null;
    rangeFrom = rangeFrom ? moment(rangeFrom).format('YYYY-MM-DD') : null;
    rangeTo = rangeTo ? moment(rangeTo).format('YYYY-MM-DD') : null;
    var filterCaller =  data.by_src ? data.by_src : null;
    var filterCallee =  data.by_dest ? data.by_dest : null;

    console.log(data);
  if (data.role == '1' && data.type == 'normalRecording') {
    var customer_id = data.user_id;
    var sql = knex.from(table.tbl_pbx_recording + ' as r')
        .select('r.*','r.src as extension', 'r.dest as callee_ext',knex.raw('DATE_FORMAT(r.created_at, "%d/%m/%Y %H:%i:%s") as time'), knex.raw('CONCAT("/assets/prompts/",r.customer_id,"/recording/",r.file_name) as file_path'),'r.type as call_type')
        .where('r.customer_id',customer_id)
        .orderBy('r.id', 'desc')
        if (data.by_range != '') {
            sql = sql.andWhere(knex.raw('DATE(r.created_at)'), '>=', "" + rangeFrom + "")
                .andWhere(knex.raw('DATE(r.created_at)'), '<=', "" + rangeTo + "");
        } 
        if (filterCaller) {
            sql = sql.andWhere('r.src', 'like', "%" + filterCaller + "%");
        }    
        if (filterCallee) {
            sql = sql.andWhere('r.dest', 'like', "%" + filterCallee + "%");
        }  
    console.log(sql.toQuery())
    sql.then((response) => {
        res.json({
            response: response,
            code: 200
        })
    }).catch((err) => { console.log(err); throw err });
  } else if (data.role == '6' && data.type == 'normalRecording') {
      knex.from(table.tbl_Extension_master).where('id', '=', "" + data.user_id + "")
          .select('ext_number', 'customer_id')
          .then((response) => {
              if (response.length > 0) {
                  let ent = Object.values(JSON.parse(JSON.stringify(response)));
                  let extNumber = ent[0].ext_number;
                  let customerId = ent[0].customer_id;
                  var customer_id = data.user_id;
                  var sql = knex.from(table.tbl_pbx_recording + ' as r')
                      .select('r.*', 'r.src as extension', 'r.dest as callee_ext', knex.raw('DATE_FORMAT(r.created_at, "%d/%m/%Y %H:%i:%s") as time'), knex.raw('CONCAT("/assets/prompts/",r.customer_id,"/recording/",r.file_name) as file_path'), 'r.type as call_type')
                      .andWhere((builder) =>
                      builder.where('r.src', '=', extNumber)
                          .orWhere('r.dest', '=', extNumber)
                          )
                      .orderBy('r.id', 'desc')
                  if (data.by_range != '') {
                      sql = sql.andWhere(knex.raw('DATE(r.created_at)'), '>=', "" + rangeFrom + "")
                          .andWhere(knex.raw('DATE(r.created_at)'), '<=', "" + rangeTo + "");
                  }
                  if (filterCaller) {
                      sql = sql.andWhere('r.src', 'like', "%" + filterCaller + "%");
                  }
                  if (filterCallee) {
                      sql = sql.andWhere('r.dest', 'like', "%" + filterCallee + "%");
                  }
                  console.log(sql.toQuery())
                  sql.then((response) => {
                      res.json({
                          response: response,
                          code: 200
                      })
                  }).catch((err) => { console.log(err); throw err });
              }
          })
  }
//     if (data.role == '1' && data.type == 'normalRecording') {
//         filePath = path.join(__dirname, '../upload/', + data.user_id + '/recording/');
//         fs.readdir(filePath, function (err, files) {
//             if (err) {
//                 console.log('Unable to scan directory:' + err);
//                 return res.send({ code: 501, response: '' });
//             }
//             files = files.map(function (fileName) {
//                 return {
//                     name: fileName,
//                     time: fs.statSync(filePath + '/' + fileName).birthtime.getTime()
//                 };
//             }).sort(function (a, b) {
//                 return b.time - a.time;
//             }).map(function (v) {
//                 let stats = fs.statSync(filePath + '/' + v.name);
//                 let birthtime = stats.birthtime;
//                 let createdDate = moment(birthtime).format('DD/MM/YYYY HH:MM');
//                 let checkDate = moment(birthtime).format('YYYY-MM-DD');

//                 let splitPart = v.name.split("_");
               
//                 let caller = splitPart[1].substring(3);
//                 let callee = splitPart[2].substring(3);
               
// //------------------------------------------------------------------------------------------------------------------
//                  count = count + 1;
//                  let fileType = "";
//                  if (splitPart[0] == "cg") {
//                      fileType = "Call Group";
//                  } else if (splitPart[0] == "conf") {
//                      fileType = "Conference";
//                  } else if (splitPart[0] == "call") {
//                      fileType = "Speed Dial";
//                  } else {
//                      fileType = "";
//                  }
//                 arr.push({ id: count, name: v.name, file_type: fileType, extension: caller, callee_ext: callee, time: createdDate, file_path: '/assets/prompts/' + data.user_id + '/recording/' + v.name });

// //-------------------------------------------------------------------------------------------------------------------                 
//                 if (checkDate >= rangeFrom && checkDate <= rangeTo) {
//                     // count = count + 1;
//                     let splitPart = v.name.split("_");
                   
//                     let caller = splitPart[1].substring(3);
//                     let callee = splitPart[2].substring(3);

//                     let fileType = "";
//                     if (splitPart[0] == "cg") {
//                         fileType = "Call Group";
//                     } else if (splitPart[0] == "conf") {
//                         fileType = "Conference";
//                     } else if (splitPart[0] == "call") {
//                         fileType = "Speed Dial";
//                     } else {
//                         fileType = "";
//                     }
//                     dateArr.push({ id: count, name: v.name, file_type: fileType, extension: caller, callee_ext: callee, time: createdDate, file_path: '/assets/prompts/' + data.user_id + '/recording/' + v.name });
//                 }
//                 //else if(filterCaller != '' && filterCallee != ''){
//                 //    if(caller.includes(filterCaller) && callee.includes(filterCallee)){
//                 //     console.log('come999999999999999999999-----------------------------');
//                 //     count = count + 1;
//                 //     let splitPart = v.name.split("_");
//                 //     console.log('rangeTo', splitPart);
//                 //     let caller = splitPart[1].substring(3);
//                 //     let callee = splitPart[2].substring(3);

//                 //     let fileType = "";
//                 //     if (splitPart[0] == "cg") {
//                 //         fileType = "Call Group";
//                 //     } else if (splitPart[0] == "conf") {
//                 //         fileType = "Conference";
//                 //     } else if (splitPart[0] == "call") {
//                 //         fileType = "Speed Dial";
//                 //     } else {
//                 //         fileType = "";
//                 //     }
//                 //     arr.push({ id: count, name: v.name, file_type: fileType, extension: caller, callee_ext: callee, time: createdDate, file_path: '/assets/prompts/' + data.user_id + '/recording/' + v.name });  
//                 // }
//                 // }else if(filterCaller != '' && caller.includes(filterCaller)){
//                 //     console.log('come-----------------------------');
//                 //     count = count + 1;
//                 //     let splitPart = v.name.split("_");
//                 //     console.log('rangeTo', splitPart);
//                 //     let caller = splitPart[1].substring(3);
//                 //     let callee = splitPart[2].substring(3);

//                 //     let fileType = "";
//                 //     if (splitPart[0] == "cg") {
//                 //         fileType = "Call Group";
//                 //     } else if (splitPart[0] == "conf") {
//                 //         fileType = "Conference";
//                 //     } else if (splitPart[0] == "call") {
//                 //         fileType = "Speed Dial";
//                 //     } else {
//                 //         fileType = "";
//                 //     }
//                 //     arr.push({ id: count, name: v.name, file_type: fileType, extension: caller, callee_ext: callee, time: createdDate, file_path: '/assets/prompts/' + data.user_id + '/recording/' + v.name });     
//                 // }else if(filterCallee != '' && callee.includes(filterCallee)){
//                 //     console.log('come222222-----------------------------');
//                 //     count = count + 1;
//                 //     let splitPart = v.name.split("_");
//                 //     console.log('rangeTo', splitPart);
//                 //     let caller = splitPart[1].substring(3);
//                 //     let callee = splitPart[2].substring(3);

//                 //     let fileType = "";
//                 //     if (splitPart[0] == "cg") {
//                 //         fileType = "Call Group";
//                 //     } else if (splitPart[0] == "conf") {
//                 //         fileType = "Conference";
//                 //     } else if (splitPart[0] == "call") {
//                 //         fileType = "Speed Dial";
//                 //     } else {
//                 //         fileType = "";
//                 //     }
//                 //     arr.push({ id: count, name: v.name, file_type: fileType, extension: caller, callee_ext: callee, time: createdDate, file_path: '/assets/prompts/' + data.user_id + '/recording/' + v.name });     
//                 // }else if(rangeFrom == '' && filterCaller == '' && filterCallee == '' ){
//                 //     count = count + 1;
//                 //     let splitPart = v.name.split("_");
//                 //     console.log('rangeTo', splitPart);
//                 //     let caller = splitPart[1].substring(3);
//                 //     let callee = splitPart[2].substring(3);

//                 //     let fileType = "";
//                 //     if (splitPart[0] == "cg") {
//                 //         fileType = "Call Group";
//                 //     } else if (splitPart[0] == "conf") {
//                 //         fileType = "Conference";
//                 //     } else if (splitPart[0] == "call") {
//                 //         fileType = "Speed Dial";
//                 //     } else {
//                 //         fileType = "";
//                 //     }
//                 //     arr.push({ id: count, name: v.name, file_type: fileType, extension: caller, callee_ext: callee, time: createdDate, file_path: '/assets/prompts/' + data.user_id + '/recording/' + v.name });     
//                 // }
//             });
//              obj['arr'] = arr;
//              obj['dateArr'] = dateArr;
//             return res.send({ code: 200, response: obj });
//         });
//     } else if (data.role == '6' && data.type == 'normalRecording') {
//         knex.from(table.tbl_Extension_master).where('id', '=', "" + data.user_id + "")
//             .select('ext_number', 'customer_id')
//             .then((response) => {
//                 if (response.length > 0) {
//                     let ent = Object.values(JSON.parse(JSON.stringify(response)));
//                     //console.log('ent====', ent);
//                     let extNumber = ent[0].ext_number;
//                     let customerId = ent[0].customer_id;
//                     filePath = path.join(__dirname, '../upload/', + customerId + '/recording/');
//                     fs.readdir(filePath, function (err, files) {
//                         if (err) {
//                             console.log('Unable to scan directory:' + err);
//                             return res.send({ code: 501, response: '' });
//                         }
//                         files = files.map(function (fileName) {
//                             return {
//                                 name: fileName,
//                                 time: fs.statSync(filePath + '/' + fileName).birthtime.getTime()
//                             };
//                         })
//                             .sort(function (a, b) {
//                                 return b.time - a.time;
//                             })
//                             .map(function (v) {
//                                 console.log('v.name=', v);
//                                 let stats = fs.statSync(filePath + '/' + v.name);
//                                 let birthtime = stats.birthtime;
//                                 let createdDate = moment(birthtime).format('DD/MM/YYYY HH:MM')
//                                 let checkDate = new Date(moment(birthtime).format('YYYY-MM-DD')).getTime();;

//                                 rangeTo = new Date(rangeTo).getTime();
//                                 rangeFrom = new Date(rangeFrom).getTime();
//                                 // checkDate = new Date(checkDate);

//                                 if (checkDate >= rangeFrom && checkDate <= rangeTo) {
//                                     count = count + 1;
//                                     let splitPart = v.name.split("_");
//                                     let caller = splitPart[1].substring(3);
//                                     let callee = splitPart[2].substring(3);

//                                     let fileType = "";
//                                     if (splitPart[0] == "cg") {
//                                         fileType = "Call Group";
//                                     } else if (splitPart[0] == "conf") {
//                                         fileType = "Conference";
//                                     } else if (splitPart[0] == "call") {
//                                         fileType = "Sip calls";
//                                     } else {
//                                         fileType = "";
//                                     }

//                                     // if (splitPart[1] == extNumber) {
//                                     if (caller == extNumber) {
//                                         arr.push({ id: count, name: v.name, file_type: fileType, extension: splitPart[1], time: createdDate, file_path: '/assets/prompts/' + customerId + '/recording/' + v.name });
//                                     }
//                                 }
//                             });
//                         return res.send({ code: 200, response: arr });
//                     });
//                 }
//             }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

//     } else if (data.role == '6' && data.type == 'voicemailRecording') {
//         knex.select('ext_number', 'customer_id').from(table.tbl_Extension_master)
//             .where('id', '=', "" + data.user_id + "")
//             .then((response1) => {
//                 if (response1.length > 0) {
//                     let extNumber = Object.values(JSON.parse(JSON.stringify(response1)));
//                     let number = extNumber[0].ext_number;
//                     let custId = extNumber[0].customer_id;
//                     filePath = path.join(__dirname, '../upload/', +custId + '/vm/' + number + '/');
//                     // console.log('filePath=', filePath);
//                     fs.readdir(filePath, function (err, files) {
//                         if (err) {
//                             console.log('Unable to scan directory:' + err);
//                             return res.send({ code: 501, response: '' });
//                         }
//                         files = files.map(function (fileName) {
//                             return {
//                                 name: fileName,
//                                 4: fs.statSync(filePath + '/' + fileName).birthtime.getTime()
//                             };
//                         })
//                             .sort(function (a, b) {
//                                 return b.time - a.time;
//                             })
//                             .map(function (v) {
//                                 console.log(v)

//                                 let stats = fs.statSync(filePath + '/' + v.name);
//                                 let birthtime = stats.birthtime;
//                                 let createdDate = moment(birthtime).format('DD/MM/YYYY HH:MM')
//                                 let checkDate = moment(birthtime).format('YYYY-MM-DD');

//                                 checkDate = moment(checkDate).unix();
//                                 rangeFrom = moment(rangeFrom).unix();
//                                 rangeTo = moment(rangeTo).unix();
//                                 if (checkDate >= rangeFrom && checkDate <= rangeTo) {
//                                     count = count + 1;
//                                     console.log('count', count);
//                                     arr.push({ id: count, name: v.name, number: number, time: createdDate, file_path: '/assets/prompts/' + custId + '/vm/' + number + '/' + v.name });
//                                 }
//                             });
//                         return res.send({ code: 200, response: arr });
//                     });
//                 } else {
//                     res.status(401).send({ error: 'Unauthorized', message: 'Can not find extension number' });
//                 }
//             }).catch((err) => { { console.log(err); throw err } });
//     }
}

function getTeleConsultRecordingList(req, res) {
    var arr = [];
    var count = 0;
    var filePath = '';

    if (req.body.role == '1' && req.body.type == 'normalRecording') {
        filePath = path.join(__dirname, '../upload/', + req.body.id + '/recording/');
        fs.readdir(filePath, function (err, files) {
            if (err) {
                console.log('Unable to scan directory:' + err);
                return res.send({ code: 501, response: '' });
            }
            files = files.map(function (fileName) {
                return {
                    name: fileName,
                    time: fs.statSync(filePath + '/' + fileName).birthtime.getTime()
                };
            }).sort(function (a, b) {
                return b.time - a.time;
            }).map(function (v) {
                // console.log('v.name=',v.name);
                let stats = fs.statSync(filePath + '/' + v.name);
                let birthtime = stats.birthtime;
                let createdDate = moment(birthtime).format('DD/MM/YYYY HH:MM')
                count = count + 1;
                let splitPart = v.name.split("_");
                let caller = splitPart[1].substring(3);
                let callee = splitPart[2].substring(3);
                let fileType = "";
                if (splitPart[0] == "queue") {
                    fileType = "Call Group";
                } else if (splitPart[0] == "conf") {
                    fileType = "Conference";
                } else if (splitPart[0] == "call") {
                    fileType = "Speed Dial";
                } else if (splitPart[0] == "tc") {
                    fileType = "Tele Consultation";
                }else {
                    fileType = "";
                }
                if(fileType == "Tele Consultation" ) arr.push({ id: count, name: v.name, file_type: fileType, extension: caller, callee_ext: callee, time: createdDate, file_path: '/assets/prompts/' + req.body.id + '/recording/' + v.name });
            });

            return res.send({ code: 200, response: arr });
        });
    } else if (req.body.role == '6' && req.body.type == 'normalRecording') {
        knex.from(table.tbl_Extension_master).where('id', '=', "" + req.body.id + "")
            .select('ext_number', 'customer_id')
            .then((response) => {
                if (response.length > 0) {
                    let ent = Object.values(JSON.parse(JSON.stringify(response)));
                   // console.log('ent====', ent);
                    let extNumber = ent[0].ext_number;
                    let customerId = ent[0].customer_id;
                    filePath = path.join(__dirname, '../upload/', + customerId + '/recording/');
                    fs.readdir(filePath, function (err, files) {
                        if (err) {
                            console.log('Unable to scan directory:' + err);
                            return res.send({ code: 501, response: '' });
                        }
                        
                        files = files.map(function (fileName) {
                           
                            return {
                                name: fileName,
                                time: fs.statSync(filePath + '/' + fileName).birthtime.getTime()
                            };

                        })
                            .sort(function (a, b) {
                                return b.time - a.time;
                            })
                            .map(function (v) {
                                 
                                let stats = fs.statSync(filePath + '/' + v.name);
                                let birthtime = stats.birthtime;
                                let createdDate = moment(birthtime).format('DD/MM/YYYY HH:MM')
                                count = count + 1;
                                let splitPart = v.name.split("_");
                                
                                let fileType = "";
                                let caller = splitPart[1].substring(3);
                                
                                let callee = splitPart[2].substring(3);
                                if (splitPart[0] == "queue") {
                                    fileType = "Call Group";
                                } else if (splitPart[0] == "conf") {
                                    fileType = "Conference";
                                } else if (splitPart[0] == "call") {
                                    fileType = "Sip calls";
                                } else {
                                    fileType = "";
                                }
                               ;
                                if (caller == extNumber) {
                                     //console.log('test1111111');
                                    arr.push({ id: count, name: v.name, file_type: fileType, extension: caller, callee_ext: callee, time: createdDate, file_path: '/assets/prompts/' + customerId + '/recording/' + v.name });
                                }
                               
                            });
                            
                        return res.send({ code: 200, response: arr });
                    });
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    } else if (req.body.role == '6' && req.body.type == 'voicemailRecording') {
        knex.select('ext_number', 'customer_id').from(table.tbl_Extension_master)
            .where('id', '=', "" + req.body.id + "")
            .then((response1) => {
                if (response1.length > 0) {
                    let extNumber = Object.values(JSON.parse(JSON.stringify(response1)));
                    let number = extNumber[0].ext_number;
                    let custId = extNumber[0].customer_id;
                    filePath = path.join(__dirname, '../upload/', +custId + '/vm/' + number + '/');
                    // console.log('filePath=', filePath);
                    fs.readdir(filePath, function (err, files) {
                        if (err) {
                            console.log('Unable to scan directory:' + err);
                            return res.send({ code: 501, response: '' });
                        }
                        files = files.map(function (fileName) {
                            return {
                                name: fileName,
                                time: fs.statSync(filePath + '/' + fileName).birthtime.getTime()
                            };
                        })
                            .sort(function (a, b) {
                                return b.time - a.time;
                            })
                            .map(function (v) {
                                let stats = fs.statSync(filePath + '/' + v.name);
                                let birthtime = stats.birthtime;
                                let createdDate = moment(birthtime).format('DD/MM/YYYY HH:MM')
                                count = count + 1;
                                arr.push({ id: count, name: v.name, number: number, time: createdDate, file_path: '/assets/prompts/' + custId + '/vm/' + number + '/' + v.name });
                            });
                        return res.send({ code: 200, response: arr });
                    });
                } else {
                    res.status(401).send({ error: 'Unauthorized', message: 'Can not find extension number' });
                }
            }).catch((err) => { { console.log(err); throw err } });
    }
}

module.exports = { getRecordingList, deleteRecording, filterRecordingList, getTeleConsultRecordingList };