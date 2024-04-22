require('dotenv').config();

var env = process.env.NODE_ENV || 'development';

config = {
    // App env
    env: process.env.NODE_ENV,

    // App debug mode
    debug: process.env.DEBUG ? process.env.DEBUG === 'true' : true,

    // App secret for password encoding
    appSecret: process.env.APP_SECRET || "juhbyVEUWQNJZjieiItuhbbsqlpYTGbheitsverysecretcloudconnect",

    // Server port
    port: process.env.SERVER_PORT || 3000,

    // JWT secret
    jwtSecret: process.env.JWT_SECRET || "qwexpkmjrufgdtyebchurswemitjuffrhtnsaazxcrctvybokcloudconnect",

    // JWT expire time in seconds
    jwtExpire: parseInt(process.env.JWT_EXPIRE, 10) || 43200,

    //email username and password
    
    username: process.env.USER_NAME || "helpdesk@cloud-connect.in",

    password: process.env.PASSWORD || "Helpdesk#2013*",    

    test_merchant_id: process.env.test_merchant_id || "2016",  

    test_working_key: process.env.test_working_key || "AECGKJBBSERVFBG",  

    gst: 18,

    cgst: 9,

    sgst: 9,
}

module.exports = config;