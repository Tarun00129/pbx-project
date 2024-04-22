const config = require('../config/app');
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const checksum_lib = require('./checkSum');
const https = require('https');
const qs = require('querystring');

//PayTM Developer Config
var PaytmConfig = {
	mid: "ZjZWTW61986961585298",  //Test Merchant ID  ZjZWTW61986961585298
	key: "_dHge_RVSBG%G9Ge",    //Test Merchant Key  _dHge_RVSBG%G9Ge
	website: "WEBSTAGING"
}
customerId = "";
invoiceNumber = "";

function getPaytmCheckSum(req,res) {
   // console.log(req.body);
	var params = {};
	let data = req.body;
    params['MID'] = PaytmConfig.mid;
    params['WEBSITE'] = PaytmConfig.website;
    params['CHANNEL_ID'] = 'WEB';
    params['INDUSTRY_TYPE_ID'] = 'Retail';
    params['ORDER_ID'] = 'CC_' + new Date().getTime();
    params['CUST_ID'] = data.custId   //'Customer001';
    params['TXN_AMOUNT'] = (data.amount).toString()  //'1.00';
    // params['CALLBACK_URL'] = 'http://localhost:' + config.port + '/paytm/callback';
    params['CALLBACK_URL'] = 'http://119.18.55.154:' + config.port + '/paytm/callback';
	params['EMAIL'] = data.email //'nonu@gmail.com';
    params['MOBILE_NO'] = data.mobile//'9540383835';
	this.customerId = data.custId ;
	this.invoiceNumber = data.invoiceNumber ;
    checksum_lib.genchecksum(params, PaytmConfig.key, function (err, checksum) {

        var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
        // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

        var form_fields = "";
        for (var x in params) {
            form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
        }
        form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
        res.end();
    });
}

function getPaytmCallback(req,res) {
   console.log(req.body);
   console.log('>>>>>>'+this.customerId )
   let data = req.body;
    var body = '';
	        
	        req.on('data', function (data) {
	            body += data;
	        });

	        req.on('end', function () {
				var html = "";
				var post_data = qs.parse(body);
				// received params in callback
				html += "<b>Callback Response</b><br>";
				for(var x in post_data){
					html += x + " => " + post_data[x] + "<br/>";
				}
				html += "<br/><br/>";
				// verify the checksum
				var checksumhash = post_data.CHECKSUMHASH;
				// delete post_data.CHECKSUMHASH;
				var result = checksum_lib.verifychecksum(post_data, PaytmConfig.key, checksumhash);
				html += "<b>Checksum Result</b> => " + (result? "True" : "False");
				html += "<br/><br/>";
				// Send Server-to-Server request to verify Order Status
				var params = {"MID": PaytmConfig.mid, "ORDERID": post_data.ORDERID};
				checksum_lib.genchecksum(params, PaytmConfig.key, function (err, checksum) {
					params.CHECKSUMHASH = checksum;
					post_data = 'JsonData='+JSON.stringify(params);

					var options = {
						hostname: 'securegw-stage.paytm.in', // for staging
						// hostname: 'securegw.paytm.in', // for production
						port: 443,
						path: '/merchant-status/getTxnStatus',
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							'Content-Length': post_data.length
						}
					};

					// Set up the request
					var response = "";
					var post_req = https.request(options, function(post_res) {
						post_res.on('data', function (chunk) {
							response += chunk;
						});

						post_res.on('end', function(){
							console.log('S2S Response: ', response, "\n");

							var _result = JSON.parse(response);
							html += "<b>Status Check Response</b><br>";
							for(var x in _result){
								html += x + " => " + _result[x] + "<br/>";
							}

							res.writeHead(200, {'Content-Type': 'text/html'});
							res.write(html);
							res.end();
							
						});
					});

					// post the data
					post_req.write(post_data);
					post_req.end();
				});
			}); 
			//console.log(">>>>>>>>4 ");
			knex(table.tbl_Epayment_Log).insert({
				cust_id: this.customerId  ,
				amount: "" + data.TXNAMOUNT + "", 
				vat: 0 ,
				paymentmethod: "" + data.PAYMENTMODE + "",
				cc_owner: "" , 
				cc_number: "" ,
				cc_expires: "" ,
				creationdate: data.TXNDATE, 
				status: data.STATUS,
				cvv: "" ,
				credit_card_type: "",
				currency: "" + data.CURRENCY +  "",
				transaction_detail : data.RESPMSG,
				item_type: "", 
				item_id: data.ORDERID,
				payment_for: "" ,
				invoice_number : this.invoiceNumber

			}).then((response) => {
				  console.log(response);
			}).catch((err) => { console.log(err); throw err });
			if(data.RESPCODE == '01'){			
				knex(table.tbl_Pbx_Invoice).where('customer_id', '=', "" + this.customerId + "")
				    .andWhere('reference_num',this.invoiceNumber)
					.update({ paid_status: '1' }).then((response) => {
						console.log(response);
					}).catch((err) => { console.log(err); throw err });

			}
			// res.redirect(`http://localhost:4200/invoice/view-invoice?status=${data.RESPCODE}`);
			res.redirect(`http://119.18.55.154:3000/invoice/view-invoice?status=${data.RESPCODE}`);  ///invoice/view-invoice
}
            
 
module.exports = {
    getPaytmCheckSum, getPaytmCallback
};
