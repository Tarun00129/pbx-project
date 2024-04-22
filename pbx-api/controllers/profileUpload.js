var express = require('express');
var multer = require('multer');
const bodyParser = require('body-parser');
const imageUpload = express();
var path = require("path");
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');

var DIR =  '';
var promptName = '';
var fileName = '';

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
         DIR = path.join(__dirname, '../app/assets/', 'uploads/'); //for live
       // DIR = path.join(__dirname, '../../web/src/assets/', 'uploads/'); //for localhost
        cb(null, DIR);
    },
    filename: (req, file, cb) => {


        fileName = 'profile_' + Date.now()+ '_'  + file.originalname;
        cb(null, fileName);
        //cb(null, file.originalname);
    }
});

let upload = multer({ storage: storage });

imageUpload.use(bodyParser.json());
imageUpload.use(bodyParser.urlencoded({ extended: true }));
imageUpload.use(express.json({ type: "application/json" }));
imageUpload.use(express.urlencoded({ extended: false }));

imageUpload.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL);
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

imageUpload.post('/profile', upload.single('profileImg'), function (req, res) {
    // console.log(req);
    if (!req.file) {
        // console.log("No file received");
        return res.send({
            success: false
        });

    } else {
        var final_path = DIR+'/'+fileName;
        console.log(final_path);
        return res.send({
            success: true,
            file: fileName
          })
        // var exicutePath = path.join('/assets/prompts/', req.body.user_id, '/prompts/', fileName);
        // var data = req.body;
        // knex(table.tbl_pbx_prompt).insert({
        //     prompt_name: "" + data.prompt_name + "", prompt_type: "" + data.promptType + "",
        //     prompt_desc: "" + data.prompt_description + "", file_path: ""+ exicutePath +"",
        //     customer_id: data.user_id
        // }).then((response) => {
        //     res.json({
        //         success: true
        //     });
        // }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
    }
});

module.exports = imageUpload;
