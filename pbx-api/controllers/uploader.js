//////////////////////////////////////////////////////////////////
const path = require('path');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');
const router = express.Router();
const imageUpload = express();

// const DIR = '../../web/src/assets/uploads';  //for localhost
// const DIR = '../app/assets/uploads';  //for live
var DIR =  '';

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    DIR = path.join(__dirname, '../app/assets/', 'uploads/'); //for live
    // DIR = path.join(__dirname, '../../web/src/assets/', 'uploads/'); //for localhost
     cb(null, DIR);
  },
  filename: (req, file, cb) => {
    // cb(null, file.fieldname + '-' + Date.now()  + path.extname(file.originalname));
    cb(null, file.originalname);
  }
});

let upload = multer({storage: storage});

imageUpload.use(bodyParser.json());
imageUpload.use(bodyParser.urlencoded({extended: true}));
imageUpload.use(express.json({type: "application/json"}));
imageUpload.use(express.urlencoded({ extended: false })); 

imageUpload.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
 
imageUpload.get('/api', function (req, res) {
  res.end('file catcher example');
});

imageUpload.post('/api/upload',upload.single('image'), function (req, res) {
  // console.log(req);
    if (!req.file) {
        console.log("No file received");
        return res.send({
          success: false
        });
    
      } else {
        console.log('image uploaded************');
        console.log('file received');
        return res.send({
          success: true
        })
      }
});
module.exports = imageUpload;
// //////////////////////////////