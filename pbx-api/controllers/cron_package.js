var express = require('express');
const cronPackage = express();
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const cron = require("node-cron");

// schedule tasks to be run on the server
cron.schedule("0 0 0 * * *", function () {  //for everyday
    console.log("Running Cron Job in 1 minute");
    let todayDate = new Date();
    let datestring = todayDate.getDate()  + "/" + (todayDate.getMonth()+1) + "/" + todayDate.getFullYear();
    let new_expired_at = new Date();
    knex.from(table.tbl_Package).select('id', knex.raw('DATE_FORMAT(expired_at, "%d/%c/%Y") as expired_date'),'expired_at', 'duration')
        .where('status', '=', '1')
        .andWhere('renew', '=', '1')
        .then((response) => {
            for (let i = 0; i < response.length; i++) {
                if (datestring === response[i].expired_date) {
                    console.log('***********date matched***********');
                    if(response[i].duration != 0){
                        new_expired_at = new Date(response[i].expired_at.getTime() + (response[i].duration * 24 * 60 * 60 * 1000));
                    }else{
                        new_expired_at = new Date(response[i].expired_at.getTime() + (365 * 24 * 60 * 60 * 1000));
                    }
                    knex(table.tbl_Package).where('id', '=', "" + response[i].id + "")
                        .update({
                            expired_at: new_expired_at
                        }).then((response) => {
                            console.log('Package updated');
                        }).catch((err) => { console.log(err); });
                } else {
                    console.log('***********not matched************');
                }
            }
        }).catch((err) => { console.log(err); });
});

module.exports = cronPackage;
