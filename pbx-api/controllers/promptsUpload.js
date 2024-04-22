var express = require('express');
var multer = require('multer');
const bodyParser = require('body-parser');
const promptUpload = express();
var path = require("path");
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

var DIR =  '';
//const DIR = '../../api';  //for localhost
var promptName = '';
var fileName = '';

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        DIR = path.join(__dirname, '../', 'upload/', req.body.user_id, '/prompts');
        cb(null, DIR);
    },
    filename: (req, file, cb) => {

        // console.log('image file =', file);
        if(req.body.promptType=='1'){
            promptName = 'moh_'
        }else if(req.body.promptType=='2'){
            promptName = 'vm_';
        }else if(req.body.promptType=='11'){
            promptName = 'bc_';
        }else if(req.body.promptType=='15'){
            promptName = 'ring_';
        }else if(req.body.promptType=='16'){
            promptName = 'callgroup_';
        }else if(req.body.promptType=='17'){
            promptName = 'general';
        }else{
            promptName = 'ivr_';
        }
        fileName = promptName + 'prompt_' + Date.now()+ '_'  + file.originalname;
        cb(null, promptName + 'prompt_' + Date.now()+ '_'  + file.originalname);
        //cb(null, file.originalname);
    }
});

let upload = multer({ storage: storage });

promptUpload.use(bodyParser.json());
promptUpload.use(bodyParser.urlencoded({ extended: true }));
promptUpload.use(express.json({ type: "application/json" }));
promptUpload.use(express.urlencoded({ extended: false }));

promptUpload.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL);
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

promptUpload.post('/prompts', upload.single('prompt'), function (req, res) {
     console.log(req);
    if (!req.file) {
        // console.log("No file received");
        return res.send({
            success: false
        });

    } else {
        var final_path = DIR + '/' + fileName;
        var exicutePath = path.join('/assets/prompts/', req.body.user_id, '/prompts/', fileName);
        var data = req.body;
        data.prompt_description = data.prompt_description ? data.prompt_description : '';
        knex(table.tbl_pbx_prompt)
            .count('prompt_name as nameCount')
            .where('prompt_name', data.prompt_name)
            .andWhere('prompt_type', data.promptType)
            .then((response) => {
                console.log(response)
                if (response[0].nameCount > 0) {
                    res.json({
                        code : 409, // 409 is given for duplicate name : - Nagender
                        error_msg: 'Prompt Name is already Exist'
                    });
                } else {
                    knex(table.tbl_pbx_prompt).insert({
                        prompt_name: "" + data.prompt_name + "",
                        prompt_type: "" + data.promptType + "",
                        prompt_desc: "" + data.prompt_description + "",
                        file_path: "" + exicutePath + "",
                        customer_id: data.user_id
                    }).then((response) => {
                        res.json({
                            success: true,
                            code : 200
                        });
                    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
                }
                console.log(response)
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });


    }
});

module.exports = promptUpload;
