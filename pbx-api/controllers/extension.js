const { response } = require("express");
const { knex } = require("../config/knex.db");
const table = require("../config/table.macros.js");
const pushEmail = require("./pushEmail");

function createExtension(req, res) {
  var finalCall = 0;
  let profile_img = "assets/uploads/Profile-Image.png";
  let url = req.protocol + "://" + req.get("host");
  var data = req.body.extension;
  if (data.misscall_notify === true || data.misscall_notify == "1") {
    data.misscall_notify = "1";
  } else {
    data.misscall_notify = "0";
  }
  if (data.plug_in === true || data.plug_in == "1") {
    data.plug_in = "1";
  } else {
    data.plug_in = "0";
  }
  if (data.bal_restriction === true || data.bal_restriction == "1") {
    data.bal_restriction = "1";
  } else {
    data.bal_restriction = "0";
  }
  if (data.multiple_reg === true || data.multiple_reg == "1") {
    data.multiple_reg = "1";
  } else {
    data.multiple_reg = "0";
  }
  if (data.voice_mail === true || data.voice_mail == "1") {
    data.voice_mail = "1";
  } else {
    data.voice_mail_pwd = "";
    data.voice_mail = "0";
  }
  if (data.outbound === true || data.outbound == "1") {
    data.outbound = "1";
  } else {
    data.outbound = "0";
  }

  if (data.recording === true || data.recording == "1") {
    data.recording = "1";
  } else {
    data.recording = "0";
  }

  if (data.billing_type == "Enterprise with pool") {
    data.billing_type = "2";
  } else if (data.billing_type == "Enterprise without pool") {
    data.billing_type = "3";
  } else {
    data.billing_type = "1";
  }

  if (data.call_forward == true || data.call_forward == "1") {
    data.call_forward = "1";
  } else {
    data.call_forward = "0";
  }

  if (data.speed_dial == true || data.speed_dial == "1") {
    data.speed_dial = "1";
  } else {
    data.speed_dial = "0";
  }

  data.black_list = "1";

  if (data.call_transfer == true || data.call_transfer == "1") {
    data.call_transfer = "1";
  } else {
    data.call_transfer = "0";
  }

  if (data.dnd == true || data.dnd == "1") {
    data.dnd = "1";
  } else {
    data.dnd = "0";
  }

  data.token = data.token ? data.token : "";

  if (data.apiToken === true || data.apiToken == "1") {
    data.apiToken = "1";
  } else {
    data.apiToken = "0";
  }

  if (data.roaming === true || data.roaming == "1") {
    data.roaming = "1";
  } else {
    data.roaming = "0";
  }

  if (
    data.outbound_sms_notification === true ||
    data.outbound_sms_notification == "1"
  ) {
    data.outbound_sms_notification = "1";
  } else {
    data.outbound_sms_notification = "0";
  }

  if (data.mobile == "" || !data.mobile) {
    data.mobile = "";
  }

  if (data.admin === true || data.admin == "1") {
    data.admin = "1";
  } else {
    data.admin = "0";
  }

  if (data.find_me_follow_me === true || data.find_me_follow_me == "1") {
    data.find_me_follow_me = "1";
  } else {
    data.find_me_follow_me = "0";
  }

  if (data.ringtone === true || data.ringtone == "1") {
    data.ringtone = "1";
  } else {
    data.ringtone = "0";
  }

  if (data.sticky_agent === true || data.sticky_agent == "1") {
    data.sticky_agent = "1";
  } else {
    data.sticky_agent = "0";
  }

  if (data.click_to_call == true || data.click_to_call == "1") {
    data.click_to_call = "1";
  } else {
    data.click_to_call = "0";
  }

  if (
    data.is_callerId_from_extNumber === true ||
    data.is_callerId_from_extNumber == "1"
  ) {
    data.is_callerId_from_extNumber = "1";
  } else {
    data.is_callerId_from_extNumber = "0";
  }

  if (
    data.is_email_from_notificationemail === true ||
    data.is_email_from_notificationemail == "1"
  ) {
    data.is_email_from_notificationemail = "1";
  } else {
    data.is_email_from_notificationemail = "0";
  }

  if (data.eType == "1") {
    knex(table.tbl_Extension_master)
      .insert({
        package_id: "" + data.extUserPackage + "",
        customer_id: "" + data.user_id + "",
        ext_number: "" + data.extension_number + "",
        username: "" + data.ext_name + "",
        password: "" + data.web_pass + "",
        email: "" + data.email + "",
        send_misscall_notification: "" + data.misscall_notify + "",
        balance_restriction: "" + data.bal_restriction + "",
        caller_id_name: "" + data.caller_id_name + "",
        sip_password: "" + data.sip_pass + "",
        ring_time_out: "" + data.ring_time_out + "",
        dial_time_out: data.dial_time_out,
        external_caller_id: "" + data.external_caller_id + "",
        dtmf_type: "" + data.dtmf_type + "",
        caller_id_header_type: "" + data.header_type + "",
        caller_id_header_value: "" + data.callerID_headervalue + "",
        multiple_registration: "" + data.multiple_reg + "",
        codec: "" + data.codec + "",
        voicemail: "" + data.voice_mail + "",
        dnd: "" + data.dnd + "",
        vm_password: "" + data.voice_mail_pwd + "",
        outbound: "" + data.outbound + "",
        recording: "" + data.recording + "",
        forward: "" + data.call_forward + "",
        speed_dial: "" + data.speed_dial + "",
        black_list: "" + data.black_list + "",
        call_transfer: "" + data.call_transfer + "",
        billing_type: "" + data.billing_type + "",
        total_min_bal: data.minute_balance,
        token: data.token,
        api_token: data.apiToken,
        roaming: data.roaming,
        outbound_sms_notification: "" + data.outbound_sms_notification + "",
        dial_prefix: "" + data.dial_prefix + "",
        mobile: "" + data.mobile + "",
        admin: "" + data.admin + "",
        find_me_follow_me: "" + data.find_me_follow_me + "",
        ringtone: "" + data.ringtone + "",
        sticky_agent: "" + data.sticky_agent + "",
        click_to_call: "" + data.click_to_call + "",
        c2c_value: "" + data.c2c_value + "",
        is_callerId_from_extNumber: "" + data.is_callerId_from_extNumber + "",
        is_email_from_notificationemail:
          "" + data.is_email_from_notificationemail + "",
        profile_img: "" + profile_img + "",
        plug_in: "" + data.plug_in + "",
      })
      .then((response) => {
        let a = knex.raw("Call getSIPRates('" + data.user_id + "' )");
        a.then((result) => {
          if (result[0][0][0]) {
            let sipData = result[0][0][0];

            let rate = sipData.feature_rate;

            if (sipData.billing_type == "2") {
              //postpaid
              let sql = knex(table.tbl_Charge).insert({
                did_id: "",
                customer_id: data.user_id,
                amount: sipData.feature_rate,
                charge_type: "8",
                description: "SIP charge for - " + data.extension_number,
                charge_status: 0,
                invoice_status: 0,
                product_id: 1,
              });
              sql.then((resp) => {
                res.json({
                  resp,
                });
              });
            } else {
              //prepaid
              let sql = knex(table.tbl_Charge).insert({
                did_id: "",
                customer_id: data.user_id,
                amount: sipData.feature_rate,
                charge_type: "8",
                description: "SIP charge for -" + data.extension_number,
                charge_status: 1,
                invoice_status: 0,
                product_id: 1,
              });
              sql.then((resp) => {
                let query = knex(table.tbl_Customer)
                  .where("id", "=", "" + data.user_id + "")
                  .update({
                    balance: knex.raw(`?? - ${rate}`, ["balance"]),
                  });
                query.then((result1) => {
                  res.json({
                    result1,
                  });
                });
              });
            }
          } else {
            return res.json({ code: 200, message: "extension created" });
          }
        });

        // res.json({
        //     response
        // });
        let newdata = {
          userName: data.extension_number,
          email: data.email,
          url: url,
        };
        pushEmail
          .getEmailContentUsingCategory("ExtensionCreation")
          .then((val) => {
            pushEmail
              .sendmail({
                data: newdata,
                val: val,
                username: data.extension_number,
                password: data.web_pass,
                email: data.email,
                ext_name: data.ext_name,
              })
              .then((data1) => {
                // res.json({ data1 })
              });
          });
      })
      .catch((err) => {
        console.log(err);
        res
          .status(401)
          .send({ error: "error", message: "DB Error: " + err.message });
        throw err;
      });
  } else {
    if (data.billing_type == "3") {
      data.minute_balance = data.minute_balance / data.extension_number.length;
    }
    for (let i = 0; i < data.extension_number.length; i++) {
      if (i == data.extension_number.length - 1) {
        finalCall = 1;
      }
      var extensionNumber = data.extension_number[i];
      var ext_name = data.extension_number[i];
      var caller_id_name = data.extension_number[i];
      var external_caller_id = data.extension_number[i];
      var callerID_headervalue = data.extension_number[i];
      var web_pass = secure_password_generator(8);
      var sip_pass = sipPassword();
      var token =
        new Date().getTime().toString(36) +
        Math.random().toString(36).substr(2);

      knex(table.tbl_Extension_master)
        .insert({
          package_id: "" + data.extUserPackage + "",
          customer_id: "" + data.user_id + "",
          ext_number: "" + extensionNumber + "",
          username: "" + ext_name + "",
          password: "" + web_pass + "",
          send_misscall_notification: "" + data.misscall_notify + "",
          balance_restriction: "" + data.bal_restriction + "",
          caller_id_name: "" + caller_id_name + "",
          sip_password: "" + sip_pass + "",
          ring_time_out: "" + data.ring_time_out + "",
          dial_time_out: "" + data.dial_time_out + "",
          external_caller_id: "" + external_caller_id + "",
          dtmf_type: "" + data.dtmf_type + "",
          caller_id_header_type: data.header_type,
          caller_id_header_value: "" + callerID_headervalue + "",
          multiple_registration: "" + data.multiple_reg + "",
          codec: "" + data.codec + "",
          voicemail: "" + data.voice_mail + "",
          dnd: "" + data.dnd + "",
          outbound: "" + data.outbound + "",
          recording: "" + data.recording + "",
          forward: "" + data.call_forward + "",
          speed_dial: "" + data.speed_dial + "",
          black_list: "" + data.black_list + "",
          call_transfer: "" + data.call_transfer + "",
          billing_type: "" + data.billing_type + "",
          total_min_bal: data.minute_balance,
          token: token,
          api_token: data.apiToken,
          roaming: data.roaming,
          outbound_sms_notification: "" + data.outbound_sms_notification + "",
          dial_prefix: "" + data.dial_prefix + "",
          mobile: "" + data.mobile + "",
          admin: "" + data.admin + "",
          find_me_follow_me: "" + data.find_me_follow_me + "",
          ringtone: "" + data.ringtone + "",
          sticky_agent: "" + data.sticky_agent + "",
          click_to_call: "" + data.click_to_call + "",
          c2c_value: "" + data.c2c_value + "",
          plug_in: "" + data.plug_in + "",
        })
        .then((response) => {})
        .catch((err) => {
          console.log(err);
          res
            .status(401)
            .send({ error: "error", message: "DB Error: " + err.message });
          throw err;
        });
    }

    if (finalCall == 1) {
      res
        .status(200)
        .send({ error: "Success", message: "Extension created sucessfully." });
    } else {
      res
        .status(401)
        .send({ error: "error", message: "Something went wrong." });
    }
  }
}

function updateExtension(req, res) {
  let profileImg = req.body.extension.profile_img;
  var data = req.body.extension;

  if (data.misscall_notify === true || data.misscall_notify == "1") {
    data.misscall_notify = "1";
  } else {
    data.misscall_notify = "0";
  }
  if (data.plug_in === true || data.plug_in == "1") {
    data.plug_in = "1";
  } else {
    data.plug_in = "0";
  }
  if (data.bal_restriction === true || data.bal_restriction == "1") {
    data.bal_restriction = "1";
  } else {
    data.bal_restriction = "0";
  }
  if (data.multiple_reg == true || data.multiple_reg == "1") {
    data.multiple_reg = "1";
  } else {
    data.multiple_reg = "0";
  }
  if (data.voice_mail === true || data.voice_mail == "1") {
    data.voice_mail = "1";
  } else {
    data.voice_mail_pwd = "";
    data.voice_mail = "0";
  }

  if (data.outbound == true || data.outbound == "1") {
    data.outbound = "1";
  } else {
    data.outbound = "0";
  }

  if (data.recording == true || data.recording == "1") {
    data.recording = "1";
  } else {
    data.recording = "0";
  }

  if (data.call_forward == true || data.call_forward == "1") {
    data.call_forward = "1";
  } else {
    data.call_forward = "0";
  }

  if (data.speed_dial == true || data.speed_dial == "1") {
    data.speed_dial = "1";
  } else {
    data.speed_dial = "0";
  }

  if (data.black_list == true || data.black_list == "1") {
    data.black_list = "1";
  } else {
    data.black_list = "0";
  }

  if (data.call_transfer == true || data.call_transfer == "1") {
    data.call_transfer = "1";
  } else {
    data.call_transfer = "0";
  }

  if (data.dnd == true || data.dnd == "1") {
    data.dnd = "1";
  } else {
    data.dnd = "0";
  }
  data.token = data.token ? data.token : "";

  if (data.apiToken === true || data.apiToken == "1") {
    data.apiToken = "1";
  } else {
    data.apiToken = "0";
  }

  if (data.roaming === true || data.roaming == "1") {
    data.roaming = "1";
  } else {
    data.roaming = "0";
  }

  if (
    data.outbound_sms_notification === true ||
    data.outbound_sms_notification == "1"
  ) {
    data.outbound_sms_notification = "1";
  } else {
    data.outbound_sms_notification = "0";
  }

  if (data.admin === true || data.admin == "1") {
    data.admin = "1";
  } else {
    data.admin = "0";
  }

  if (data.find_me_follow_me === true || data.find_me_follow_me == "1") {
    data.find_me_follow_me = "1";
  } else {
    data.find_me_follow_me = "0";
  }

  if (data.ringtone === true || data.ringtone == "1") {
    data.ringtone = "1";
  } else {
    data.ringtone = "0";
  }

  if (data.sticky_agent === true || data.sticky_agent == "1") {
    data.sticky_agent = "1";
  } else {
    data.sticky_agent = "0";
  }

  if (data.click_to_call == true || data.click_to_call == "1") {
    data.click_to_call = "1";
  } else {
    data.click_to_call = "0";
  }

  var ext_id = data.id;
  let sql = knex(table.tbl_Extension_master)
    .where("id", "=", "" + ext_id + "")
    .update({
      username: "" + data.ext_name + "",
      password: "" + data.web_pass + "",
      email: "" + data.email + "",
      send_misscall_notification: "" + data.misscall_notify + "",
      balance_restriction: "" + data.bal_restriction + "",
      caller_id_name: "" + data.caller_id_name + "",
      sip_password: "" + data.sip_pass + "",
      ring_time_out: "" + data.ring_time_out + "",
      dial_time_out: data.dial_time_out,
      external_caller_id: "" + data.external_caller_id + "",
      dtmf_type: "" + data.dtmf_type + "",
      caller_id_header_type: "" + data.header_type + "",
      caller_id_header_value: "" + data.callerID_headervalue + "",
      multiple_registration: "" + data.multiple_reg + "",
      codec: "" + data.codec + "",
      voicemail: "" + data.voice_mail + "",
      vm_password: "" + data.voice_mail_pwd + "",
      dnd: "" + data.dnd + "",
      outbound: "" + data.outbound + "",
      recording: "" + data.recording + "",
      forward: "" + data.call_forward + "",
      speed_dial: "" + data.speed_dial + "",
      black_list: "" + data.black_list + "",
      call_transfer: "" + data.call_transfer + "",
      total_min_bal: data.minute_balance,
      api_token: data.apiToken,
      roaming: data.roaming,
      outbound_sms_notification: "" + data.outbound_sms_notification + "",
      dial_prefix: "" + data.dial_prefix + "",
      mobile: "" + data.mobile + "",
      admin: "" + data.admin + "",
      find_me_follow_me: "" + data.find_me_follow_me + "",
      ringtone: "" + data.ringtone + "",
      sticky_agent: "" + data.sticky_agent + "",
      click_to_call: "" + data.click_to_call + "",
      c2c_value: "" + data.c2c_value + "",
      plug_in: "" + data.plug_in + "",
    });
  sql
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function UpdateProfile(req, res) {
  let data = req.body.crdentials;
  if (req.body.role === "6") {
    knex(table.tbl_Extension_master)
      .where("id", "=", "" + data.user_id + "")
      .update({ profile_img: "" + data.profile_img + "" })
      .then((response) => {
        if (response) {
          res.json({
            response,
          });
        } else {
          res.status(401).send({ error: "error", message: "DB Error" });
        }
      });
  }
}

function secure_password_generator(len) {
  var length = len ? len : 8;
  var string_lower = "abcdefghijklmnopqrstuvwxyz";
  var string_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var numeric = "0123456789";
  var punctuation = "!#$%&*+,-./:<=>?@[]^_{|}~"; // remove ;'"`() from this punctuation
  var password = "";
  var character = "";
  var crunch = true;
  while (password.length < length) {
    var entity1 = Math.ceil(
      string_lower.length * Math.random() * Math.random()
    );
    var entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
    var entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
    var entity4 = Math.ceil(
      string_UPPER.length * Math.random() * Math.random()
    );
    character += string_lower.charAt(entity1);
    character += string_UPPER.charAt(entity4);
    character += numeric.charAt(entity2);
    character += punctuation.charAt(entity3);
    password = character;
  }
  password = password
    .split("")
    .sort(function () {
      return 0.5 - Math.random();
    })
    .join("");
  return password.substr(0, len);
}

function sipPassword() {
  var length = 8,
    charset = "0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

function getAllExtension(req, res) {
  var user_id = req.query.user_id;
  var sql = knex(table.tbl_Extension_master)
    .where("customer_id", "=", "" + user_id + "")
    .select("*", "ext_number as number")
    .orderBy("id", "desc");
  sql
    .then((response) => {
      res.json({
        response: response,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function getAllExtensionWithPlugin(req, res) {
  var user_id = req.query.user_id;
  var sql = knex(table.tbl_Extension_master)
    .where("customer_id", "=", "" + user_id + "")
    .andWhere("plug_in", "=", "0")
    .select("*")
    .orderBy("id", "desc");
  sql
    .then((response) => {
      res.json({
        response: response,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function getExtensionByExtId(req, res) {
  knex
    .raw("Call pbx_getExtensionByExtId(" + req.query.ext_id + ")")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function verifyExtension(req, res) {
  let extension = req.body.extension;
  let sql = knex
    .from(table.tbl_Extension_master)
    .where("customer_id", "" + req.body.user_id + "")
    .andWhere("ext_number", "" + extension + "")
    .select("id", "ext_number");
  sql.then((response) => {
    if (response.length >= 1) {
      const ext = response[0];
      res.json({
        ext_id: ext.id,
        ext_number: ext.ext_number,
      });
    } else {
      res.json({
        ext_id: "",
        ext_number: "",
      });
    }
  });
}

function getExtensionLimit(req, res) {
  if (req.query.role == "1" || req.query.role == "5" || req.query.role == "4") {
    knex
      .select(
        "pf.billing_type",
        "pf.minute_balance",
        "mcp.package_id",
        "p.feature_id",
        "pf.extension_limit",
        "pf.recording",
        "pf.is_caller_id",
        "pf.outbound_call",
        "pf.voicemail",
        "pf.forward",
        "pf.speed_dial",
        "pf.black_list",
        "pf.call_transfer",
        "mcp.customer_id",
        "pf.is_sms as sms",
        "pf.miss_call_alert",
        "pf.geo_tracking",
        "pf.is_roaming_type as roaming",
        "pf.find_me_follow_me",
        "pf.custom_prompt",
        "pf.sticky_agent",
        "pf.click_to_call",
        "p.mapped"
      )
      .from(table.tbl_Map_customer_package + " as mcp")
      .leftJoin(table.tbl_Package + " as p", "p.id", "mcp.package_id")
      .leftJoin(table.tbl_PBX_features + " as pf", "p.feature_id", "pf.id")
      .where("mcp.customer_id", "=", "" + req.query.user_id + "")
      .andWhere("mcp.product_id", "=", "1")
      .then((response) => {
        const ext = response[0];
        res.json({
          ext,
        });
      });
  } else if (req.query.role == "6") {
    knex
      .select("customer_id", "admin")
      .from(table.tbl_Extension_master)
      .where("id", "=", "" + req.query.user_id + "")
      .then((response) => {
        let customerId = Object.values(JSON.parse(JSON.stringify(response)));
        let lastCustomerId = customerId[0].customer_id;
        let adminExtension = customerId[0].admin;
        knex
          .select(
            "mcp.package_id",
            "p.feature_id",
            "pf.extension_limit",
            "pf.recording",
            "pf.outbound_call",
            "pf.voicemail",
            "pf.forward",
            "pf.speed_dial",
            "pf.black_list",
            "pf.call_transfer",
            "mcp.customer_id"
          )
          .from(table.tbl_Map_customer_package + " as mcp")
          .leftJoin(table.tbl_Package + " as p", "p.id", "mcp.package_id")
          .leftJoin(table.tbl_PBX_features + " as pf", "p.feature_id", "pf.id")
          .where("mcp.customer_id", "=", "" + lastCustomerId + "")
          .andWhere("mcp.product_id", "=", "1")
          .then((response) => {
            const ext = response[0];
            ext["admin"] = Number(adminExtension);
            res.json({
              ext,
            });
          });
      });
  } else {
    res.json({ response });
  }
}

function getTotalExtension(req, res) {
  let customerId = parseInt(req.query.customerId);
  let sql = knex(table.tbl_Extension_master)
    .count("id as count")
    .where("status", "=", "1")
    .andWhere("customer_id", "=", "" + customerId + "");

  sql
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function getMonthlyTotalExtension(req, res) {
  req.query.customerId = req.query.customerId ? req.query.customerId : null;
  knex
    .raw("Call pbx_getMonthlyTotalExtension(" + req.query.customerId + ")")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function deleteExtension(req, res) {
  let id = parseInt(req.query.id);
  knex(table.tbl_Extension_master)
    .where("id", "=", "" + id + "")
    .del()
    .then((response) => {
      if (response) {
        knex(table.tbl_pbx_min_ext_mapping)
          .where("extension_id", "like", "" + id + "%")
          .del()
          .then((response) => {
            if (response) {
              res.json({
                response,
              });
            } else {
              res.status(401).send({ error: "error", message: "DB Error" });
            }
          });
      }
    });
}
function inactiveExtension(req, res) {
  let userTypeVal = "";
  if (req.body.role == "1") {
    userTypeVal = "ExtensionInactiveStatus";
  } else if (req.body.role == "2") {
    userTypeVal = "ResellerInactiveStatus";
  } else userTypeVal = "InternalUserInactiveStatus";
  knex(table.tbl_Extension_master)
    .where("id", "=", "" + req.body.id + "")
    .update({ status: "0" })
    .then((response) => {
      //if (req.body.role == '4' || req.body.role == '5') {
      let newdata = { userName: req.body.name, email: req.body.email };
      pushEmail.getEmailContentUsingCategory(userTypeVal).then((val) => {
        pushEmail.sendmail({ data: newdata, val: val }).then((data1) => {
          //res.json({ data1 })
        });
      });
      // }
      res.json({ response });
    });
}
function activeExtension(req, res) {
  if (req.body.role == "1") {
    userTypeVal = "ExtensionInactiveStatus";
  } else if (req.body.role == "2") {
    userTypeVal = "ResellerInactiveStatus";
  } else userTypeVal = "InternalUserInactiveStatus";
  knex(table.tbl_Extension_master)
    .where("id", "=", "" + req.body.id + "")
    .update({ status: "1" })
    .then((response) => {
      if (response) {
        //if (req.body.role == '4' || req.body.role == '5') {
        let newdata = { userName: req.body.name, email: req.body.email };
        pushEmail.getEmailContentUsingCategory(userTypeVal).then((val) => {
          pushEmail.sendmail({ data: newdata, val: val }).then((data1) => {
            //res.json({ data1 })
          });
        });
        // }
        res.json({ response });
      } else {
        res.status(401).send({ error: "error", message: "DB Error" });
      }
    });
}

function getExtensionById(req, res) {
  let id = parseInt(req.query.id);
  let sql = knex
    .from(table.tbl_Extension_master + " as e")
    .where("e.id", "=", "" + id + "")
    .select(
      "e.*",
      "c.phonecode",
      knex.raw(
        'if(l.username !="","Registered","Un-Registered") as registered_status'
      )
    )
    // knex.raw('IF(l.username = "" , 0, 1) as ext_registered')
    .leftJoin(table.tbl_Country + " as c", "c.id", "e.dial_prefix")
    .leftJoin(table.tbl_location + " as l", "l.username", "e.ext_number");
  sql
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function getDidListById(req, res) {
  let id = parseInt(req.query.id);
  let sql = knex
    .select("*")
    .from(table.tbl_DID)
    .where("customer_id", "=", "" + id + "")
    .andWhere("activated", "=", 1);
  sql
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function getExtensionByFilters(req, res) {
  let count = 0;
  let data = req.body.filters;
  let sql = knex.from(table.tbl_Extension_master).select("*");
  sql.orderBy("ext_number", "desc");

  if (data.by_username != "") {
    sql = sql.andWhere("username", "like", "%" + data.by_username + "%");
  }
  if (data.by_roaming != "") {
    sql = sql.andWhere("roaming", "=", data.by_roaming);
  }
  if (data.user_id != "") {
    sql = sql.andWhere("customer_id", "like", "%" + data.user_id + "%");
  }

  if (data.by_type != "" && data.hasOwnProperty("by_type")) {
    let subquery = knex.raw(
      "select JSON_UNQUOTE(json_extract(favorite,'$.ext_number')) fav from extension_master where customer_id =" +
        data.user_id +
        " and ext_number=" +
        data.by_id
    );
    subquery
      .then((response) => {
        let fav_Contact = response[0][0]["fav"]
          ? response[0][0]["fav"].split(",")
          : [""];
        if (fav_Contact) {
          count++;
          sql =
            data.by_type == "favorite"
              ? sql.whereIn("ext_number", fav_Contact)
              : sql.whereNotIn("ext_number", fav_Contact);
          sql
            .then((response) => {
              if (response) {
                res.json({
                  response,
                });
              } else {
                res.status(401).send({
                  error: "error",
                  message: "DB Error: " + err.message,
                });
              }
            })
            .catch((err) => {
              console.log(err);
              res
                .status(401)
                .send({ error: "error", message: "DB Error: " + err.message });
              throw err;
            });
        } else {
          sql
            .then((response) => {
              if (response) {
                res.json({
                  response,
                });
              }
            })
            .catch((err) => {
              console.log(err);
              res
                .status(401)
                .send({ error: "error", message: "DB Error: " + err.message });
              throw err;
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res
          .status(401)
          .send({ error: "error", message: "DB Error: " + err.message });
        throw err;
      });
  }
  if (data.by_number != "") {
    sql = sql.andWhere("ext_number", "like", "%" + data.by_number + "%");
  }

  if (count > 0 && data.hasOwnProperty("by_type")) {
    sql
      .then((response) => {
        if (response) {
          res.json({
            response,
          });
        } else {
          res
            .status(401)
            .send({ error: "error", message: "DB Error: " + err.message });
        }
      })
      .catch((err) => {
        console.log(err);
        res
          .status(401)
          .send({ error: "error", message: "DB Error: " + err.message });
        throw err;
      });
  } else if (count == 0 && !data.hasOwnProperty("by_type")) {
    sql
      .then((response) => {
        if (response) {
          res.json({
            response,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res
          .status(401)
          .send({ error: "error", message: "DB Error: " + err.message });
        throw err;
      });
  } else if (
    count == 0 &&
    data.hasOwnProperty("by_type") &&
    data["by_type"] == ""
  ) {
    sql
      .then((response) => {
        if (response) {
          res.json({
            response,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res
          .status(401)
          .send({ error: "error", message: "DB Error: " + err.message });
        throw err;
      });
  } else {
  }
}

function getExtensionSetting(req, res) {
  knex
    .raw("Call pbx_getExtensionSetting(" + req.body.id + ")")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function updateExtensionSettings(req, res) {
  req.body.extension.dnd =
    req.body.extension.dnd == true || req.body.extension.dnd == "1" ? "1" : "0";
  req.body.extension.callForward =
    req.body.extension.callForward == true ||
    req.body.extension.callForward == "1"
      ? "1"
      : "0";
  req.body.extension.ringtone = req.body.extension.ringtone
    ? req.body.extension.ringtone
    : 0;
  knex
    .raw(
      "Call pbx_saveExtensionSettings(" +
        req.body.extension.id +
        "," +
        req.body.extension.dnd +
        ",'" +
        req.body.extension.callForward +
        "'," +
        req.body.extension.ringtone +
        ")"
    )
    .then((response) => {
      if (response) {
        res.send({
          code: response[0][0][0].MYSQL_SUCCESSNO,
          message: response[0][0][0].MESSAGE_TEXT,
        });
      }
    })
    .catch((err) => {
      res.send({ code: err.errno, message: err.sqlMessage });
    });
}

function updateExtension_FMFM_Settings(req, res) {
  req.body.extension.caller_id_1 = req.body.extension.caller_id_1
    ? req.body.extension.caller_id_1
    : 0;
  req.body.extension.caller_id_2 = req.body.extension.caller_id_2
    ? req.body.extension.caller_id_2
    : 0;
  req.body.extension.caller_id_3 = req.body.extension.caller_id_3
    ? req.body.extension.caller_id_3
    : 0;
  knex
    .raw(
      "Call pbx_saveExtension_FMFM_Settings(" +
        req.body.extension.id +
        "," +
        req.body.extension.ring_timeout +
        ",'" +
        req.body.extension.find_me_follow_me_type_1 +
        "'," +
        req.body.extension.caller_id_1 +
        ",'" +
        req.body.extension.find_me_follow_me_type_2 +
        "'," +
        req.body.extension.caller_id_2 +
        ",'" +
        req.body.extension.find_me_follow_me_type_3 +
        "'," +
        req.body.extension.caller_id_3 +
        ")"
    )
    .then((response) => {
      if (response) {
        res.send({
          code: response[0][0][0].MYSQL_SUCCESSNO,
          message: response[0][0][0].MESSAGE_TEXT,
        });
      }
    })
    .catch((err) => {
      res.send({ code: err.errno, message: err.sqlMessage });
    });
}

function getExtensionNameandNumber(req, res) {
  let id = parseInt(req.query.id);
  let sql = knex
    .select("e.customer_id")
    .from(table.tbl_Extension_master + " as e")
    .leftOuterJoin(table.tbl_Customer + " as c", "e.customer_id", "c.id")
    .where("e.id", "=", "" + id + "");

  sql.then((response) => {
    if (response.length > 0) {
      let customerId = Object.values(JSON.parse(JSON.stringify(response)));
      let lastCustomerId = customerId[0].customer_id;

      knex
        .select(
          "id",
          "ext_number",
          "caller_id_name",
          knex.raw("CONCAT(ext_number, '-',caller_id_name) as extension")
        )
        .from(table.tbl_Extension_master)
        .where("customer_id", "=", "" + lastCustomerId + "")
        .andWhere("dnd", "=", 0)
        .whereNot("id", "=", "" + id + "")
        .orderBy("ext_number", "asc")
        .then((response) => {
          res.json({
            response,
          });
        })
        .catch((err) => {
          console.log(err);
          res
            .status(401)
            .send({ error: "error", message: "DB Error: " + err.message });
          throw err;
        });
    }
  });
}

function updateExtensionPassword(req, res) {
  const passwordInput = req.body.newPassword;
  knex(table.tbl_Extension_master)
    .where("username", "=", "" + req.body.username + "")
    .update({ password: passwordInput })
    .then((response) => {
      if (response > 0) {
        pushEmail.getExtensionName(req.body.email).then((data) => {
          pushEmail
            .getEmailContentUsingCategory("ChangePassword")
            .then((val) => {
              pushEmail.sendmail({ data: data, val: val }).then((data1) => {
                res.json({ data1 });
              });
            });
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function extensionEmailExist(req, res) {
  knex(table.tbl_Extension_master)
    .count("id", { as: "count" })
    .where("email", "=", "" + req.body.email + "")
    .then((response) => {
      if (response[0].count > 0) {
        pushEmail.getExtensionName(req.body.email).then((data) => {
          pushEmail
            .getEmailContentUsingCategory("ForgetPassword")
            .then((val) => {
              pushEmail
                .sendmail({
                  data: data,
                  val: val,
                  action: req.body.action,
                  mailList: req.body.mailList,
                })
                .then((data1) => {
                  res.json({ data1 });
                });
            });
        });
      } else {
        res.status(400).send({
          error: "EmailNoFound",
          message: "Email not registered in the platform",
        });
        res.json({ response });
      }
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
}

function getExtensionName(req, res) {
  knex(table.tbl_Extension_master)
    .where("email", "=", "" + req.query.email + "")
    .select("username as name")
    .then((response) => {
      if (response) {
        res.json({
          response,
        });
      } else {
        res.status(401).send({ error: "error", message: "DB Error" });
      }
    })
    .catch((err) => {
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function verifyEmail(req, res) {
  let keyword = req.body.email;
  knex
    .from(table.tbl_Extension_master)
    .where("email", "" + keyword + "")
    .select("id")
    .then((response) => {
      if (response.length > 0) {
        const extension = response[0];
        res.json({
          email: extension.id,
        });
      } else {
        res.json({
          user_id: "",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function getCustomerExtensionFeatures(req, res) {
  let id = parseInt(req.query.customerId);
  knex
    .select(
      "id",
      "ext_number as number",
      "username as name",
      "balance_restriction",
      "multiple_registration",
      "voicemail",
      "dnd",
      "outbound",
      "recording",
      "black_list",
      "call_transfer",
      "forward",
      "speed_dial",
      "customer_id",
      "roaming",
      "admin",
      "ringtone",
      "sticky_agent",
      "find_me_follow_me"
    )
    .from(table.tbl_Extension_master)
    .where("customer_id", "=", "" + id + "")
    .orderBy("ext_number", "asc")
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "Features not available" });
      throw err;
    });
}

function getExtensionFeaturesByFilters(req, res) {
  let data = req.body.filters;
  let id = parseInt(req.query.customerId);

  let sql = knex
    .select(
      "id",
      "ext_number as number",
      "username",
      "balance_restriction",
      "multiple_registration",
      "voicemail",
      "dnd",
      "outbound",
      "recording",
      "black_list",
      "call_transfer",
      "forward",
      "speed_dial",
      "customer_id"
    )
    .from(table.tbl_Extension_master)
    .where("customer_id", "=", "" + id + "")
    .orderBy("ext_number", "desc");

  if (data.by_name != "" && data.by_number == "") {
    sql = sql.andWhere("username", "like", "%" + data.by_name + "%");
  } else if (data.by_name == "" && data.by_number != "") {
    sql = sql.andWhere("ext_number", "like", "%" + data.by_number + "%");
  } else if (data.by_name != "" && data.by_number != "") {
    sql = sql
      .andWhere("username", "like", "%" + data.by_name + "%")
      .andWhere("ext_number", "like", "%" + data.by_number + "%");
  } else {
    sql = sql;
  }
  sql
    .then((response) => {
      if (response) {
        res.json({
          response,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function getExtensionForSupport(req, res) {
  let data = req.body.filters;

  let sql = knex
    .from(table.tbl_Extension_master)
    .select(
      "id",
      "ext_number",
      "username",
      "caller_id_name",
      "external_caller_id",
      "email",
      "codec",
      "customer_id"
    )
    .where("status", "=", "1")
    .andWhere("customer_id", "=", "" + data.user_id + "")
    .orderBy("ext_number", "desc");

  if (data.by_username != "") {
    sql = sql.andWhere("username", "like", "%" + data.by_username + "%");
  }
  if (data.by_external_callerId != "") {
    sql = sql.andWhere(
      "external_caller_id",
      "like",
      "%" + data.by_external_callerId + "%"
    );
  }
  if (data.by_number != "") {
    sql = sql.andWhere("ext_number", "like", "%" + data.by_number + "%");
  }

  sql
    .then((response) => {
      if (response) {
        res.json({
          response,
        });
      } else {
        res
          .status(401)
          .send({ error: "error", message: "DB Error: " + err.message });
      }
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function verifyExtUsername(req, res) {
  let username_keyword = req.body.username;
  knex
    .select("c.id as id")
    .from(table.tbl_Customer + " as c")
    .where(knex.raw("BINARY(c.username)"), "=", "" + username_keyword + "")
    .andWhere("status", "!=", "2")
    .union(
      knex.raw(
        "select e.id as id from " +
          table.tbl_Extension_master +
          " as e \
        where e.username  ='" +
          username_keyword +
          "'"
      )
    )
    .then((response) => {
      if (response.length > 0) {
        const user = response[0];
        res.json({
          user_id: user.id,
        });
      } else {
        res.json({
          user_id: "",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function updatePackageMinuteBal(req, res) {
  knex(table.tbl_PBX_features)
    .where("id", "=", "" + req.body.id + "")
    .update({ minute_balance: req.body.balance })
    .then((response) => {
      res.json({ response });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function updateExtensionMinute(req, res) {
  knex(table.tbl_Extension_master)
    .where("id", "=", "" + req.body.addExt_id + "")
    .update({ total_min_bal: req.body.newMinuteForAddExt })
    .then((response) => {
      knex(table.tbl_Extension_master)
        .where("id", "=", "" + req.body.deductExt_id + "")
        .update({ total_min_bal: req.body.newMinuteForDeductExt })
        .then((response) => {
          res.json({ response });
        })
        .catch((err) => {
          console.log(err);
          res
            .status(401)
            .send({ error: "error", message: "DB Error: " + err.message });
          throw err;
        });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function deductCustomExtensionMinute(req, res) {
  let sql = knex(table.tbl_Extension_master)
    .where("id", "=", "" + req.body.deduct_ext.id + "")
    .update({
      total_min_bal: knex.raw(`?? - ${req.body.deduct_ext_minutes}`, [
        "total_min_bal",
      ]),
    });

  sql
    .then((response) => {
      res.json({ response });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function deductAllExtensionMinute(req, res) {
  for (let i = 0; i < req.body.ext_id.length; i++) {
    knex
      .select("id", "total_min_bal")
      .from(table.tbl_Extension_master)
      .where("id", "=", "" + req.body.ext_id[i] + "")
      .then((response) => {
        if (response[0]["total_min_bal"] > req.body.deduct_minutes_all) {
          let sql = knex(table.tbl_Extension_master)
            .where("id", "=", "" + response[0]["id"] + "")
            .update({
              total_min_bal: knex.raw(`?? - ${req.body.deduct_minutes_all}`, [
                "total_min_bal",
              ]),
            });

          sql
            .then((response) => {
              res.json({ response });
            })
            .catch((err) => {
              console.log(err);
              res
                .status(401)
                .send({ error: "error", message: "DB Error: " + err.message });
              throw err;
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res
          .status(401)
          .send({ error: "error", message: "DB Error: " + err.message });
        throw err;
      });
  }
  res.status(200).send({ error: "", message: "Success!!!" });
}

function getExtensionCount(req, res) {
  let extn_id = req.query.extension_id;
  let extn_num = req.query.extension_number;
  knex
    .raw("Call pbx_get_extension_existance(" + extn_id + "," + extn_num + ")")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getDestinationDID(req, res) {
  knex
    .raw("Call pbx_getDestinationDID(" + req.query.id + ")")
    .then((response) => {
      if (response) {
        res.json({
          response,
        });
      }
    })
    .catch((err) => {
      res.send({ code: err.errno, message: err.sqlMessage });
    });
}

function bulkExtensionUpdate(req, res) {
  var finalCall = 0;
  var data = req.body.extension;
  if (data.misscall_notify === true || data.misscall_notify == "1") {
    data.misscall_notify = "1";
  } else {
    data.misscall_notify = "0";
  }
  if (data.multiple_reg === true || data.multiple_reg == "1") {
    data.multiple_reg = "1";
  } else {
    data.multiple_reg = "0";
  }
  if (data.voice_mail === true || data.voice_mail == "1") {
    data.voice_mail = "1";
  } else {
    data.voice_mail_pwd = "";
    data.voice_mail = "0";
  }
  if (data.outbound === true || data.outbound == "1") {
    data.outbound = "1";
  } else {
    data.outbound = "0";
  }

  if (data.recording === true || data.recording == "1") {
    data.recording = "1";
  } else {
    data.recording = "0";
  }

  if (data.call_forward == true || data.call_forward == "1") {
    data.call_forward = "1";
  } else {
    data.call_forward = "0";
  }

  if (data.speed_dial == true || data.speed_dial == "1") {
    data.speed_dial = "1";
  } else {
    data.speed_dial = "0";
  }

  data.black_list = "1";

  if (data.call_transfer == true || data.call_transfer == "1") {
    data.call_transfer = "1";
  } else {
    data.call_transfer = "0";
  }

  if (data.dnd == true || data.dnd == "1") {
    data.dnd = "1";
  } else {
    data.dnd = "0";
  }

  if (data.roaming === true || data.roaming == "1") {
    data.roaming = "1";
  } else {
    data.roaming = "0";
  }

  if (data.bal_restriction === true || data.bal_restriction == "1") {
    data.bal_restriction = "1";
  } else {
    data.bal_restriction = "0";
  }

  if (
    data.outbound_sms_notification === true ||
    data.outbound_sms_notification == "1"
  ) {
    data.outbound_sms_notification = "1";
  } else {
    data.outbound_sms_notification = "0";
  }

  if (data.sticky_agent === true || data.sticky_agent == "1") {
    data.sticky_agent = "1";
  } else {
    data.sticky_agent = "0";
  }

  if (data.admin === true || data.admin == "1") {
    data.admin = "1";
  } else {
    data.admin = "0";
  }

  if (data.find_me_follow_me === true || data.find_me_follow_me == "1") {
    data.find_me_follow_me = "1";
  } else {
    data.find_me_follow_me = "0";
  }

  if (data.ringtone === true || data.ringtone == "1") {
    data.ringtone = "1";
  } else {
    data.ringtone = "0";
  }

  for (let i = 0; i < data.extIds.length; i++) {
    if (i == data.extIds.length - 1) {
      finalCall = 1;
    }
    var extensionNumber = data.extIds[i];

    let sql = knex(table.tbl_Extension_master)
      .update({
        send_misscall_notification: "" + data.misscall_notify + "",
        ring_time_out: "" + data.ring_time_out + "",

        dtmf_type: "" + data.dtmf_type + "",
        caller_id_header_type: "" + data.header_type + "",
        multiple_registration: "" + data.multiple_reg + "",
        codec: "" + data.codec + "",
        voicemail: "" + data.voice_mail + "",
        dnd: "" + data.dnd + "",
        outbound: "" + data.outbound + "",
        recording: "" + data.recording + "",
        forward: "" + data.call_forward + "",
        speed_dial: "" + data.speed_dial + "",
        outbound_sms_notification: "" + data.outbound_sms_notification + "",
        call_transfer: "" + data.call_transfer + "",
        roaming: "" + data.roaming + "",
        balance_restriction: "" + data.bal_restriction + "",
        sticky_agent: "" + data.sticky_agent + "",
        admin: "" + data.admin + "",
        ringtone: "" + data.ringtone + "",
        find_me_follow_me: "" + data.find_me_follow_me + "",
      })
      .where("id", "=", "" + extensionNumber + "");
    sql
      .then((response) => {})
      .catch((err) => {
        console.log(err);
        res
          .status(401)
          .send({ error: "error", message: "DB Error: " + err.message });
        throw err;
      });
  }

  if (finalCall == 1) {
    res.status(200).send({
      error: "Success",
      message: "Bulk Extension updated sucessfully.",
    });
  } else {
    res.status(401).send({ error: "error", message: "Something went wrong." });
  }
}

function getExtensionForRealtimeDashboard(req, res) {
  var user_id = req.query.user_id;
  knex
    .from(table.tbl_Extension_master)
    .where("status", "=", "1")
    .andWhere("customer_id", "=", "" + user_id + "")
    .select("*")
    .orderBy("ext_number", "asc")
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function makeFavoriteContactByExtension(req, res) {
  let data = req.body;
  let sql = knex
    .from(table.tbl_Extension_master)
    .count("id", { as: "count" })
    .where("favorite", "like", "%" + data.ext_number + "%")
    .andWhere("id", data.id);
  sql
    .then((response) => {
      if (response[0].count == 0) {
        // Not EXIST
        let sql2 = knex.raw(
          'select *, json_extract(favorite,"$.ext_number") favorite from extension_master  where id =' +
            data.id
        );
        sql2
          .then((response2) => {
            if (response2) {
              let fav_contact_list = response2[0][0].favorite
                ? response2[0][0].favorite.replace(/"/g, "").split(",")
                : [];
              fav_contact_list.push(data.ext_number);
              let obj = {};
              obj["ext_number"] = fav_contact_list.toString();
              knex
                .raw(
                  "Call pbx_save_extension_favorite_contact(" +
                    data.id +
                    ",'" +
                    JSON.stringify(obj) +
                    "','" +
                    "make_favorite" +
                    "')"
                )
                .then((response3) => {
                  if (response3) {
                    res.send({ response: response3[0][0] });
                  }
                })
                .catch((err) => {
                  res.send({
                    response: { code: err.errno, message: err.sqlMessage },
                  });
                });
            }
          })
          .catch((err) => {
            console.log(err);
            res
              .status(401)
              .send({ error: "error", message: "DB Error: " + err.message });
            throw err;
          });
      } else {
        // aLREADY eXIST
        let sql2 = knex.raw(
          'select *, json_extract(favorite,"$.ext_number") favorite from extension_master  where id =' +
            data.id
        );
        sql2
          .then((response2) => {
            if (response2) {
              let fav_contact_list = response2[0][0].favorite
                ? response2[0][0].favorite.replace(/"/g, "").split(",")
                : [];
              fav_contact_list = fav_contact_list.filter(
                (item) => item != data.ext_number
              );
              let obj = {};
              obj["ext_number"] = fav_contact_list.toString();
              knex
                .raw(
                  "Call pbx_save_extension_favorite_contact(" +
                    data.id +
                    ",'" +
                    JSON.stringify(obj) +
                    "','" +
                    "make_unfavorite" +
                    "')"
                )
                .then((response3) => {
                  if (response3) {
                    res.send({ response: response3[0][0] });
                  }
                })
                .catch((err) => {
                  res.send({
                    response: { code: err.errno, message: err.sqlMessage },
                  });
                });
            }
          })
          .catch((err) => {
            console.log(err);
            res
              .status(401)
              .send({ error: "error", message: "DB Error: " + err.message });
            throw err;
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function getExtension_FMFM_Setting(req, res) {
  knex
    .raw("Call pbx_getExtension_FMFM_Setting(" + req.body.id + ")")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function assignBundlePlanMinuteForExtension(req, res) {
  //tbl_pbx_min_ext_mapping
  let data = req.body.minutManageForm;
  let customer_id = req.query.customer_id || 0;
  let managedArray = [];
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].ext.length; j++) {
      let obj = {};
      obj["country"] = data[i].country;
      obj["extension_id"] = data[i].ext[j].id;
      obj["minutes"] = data[i].ext[j].minutes;
      managedArray.push(obj);
    }
  }
  if (managedArray.length) {
    for (let k = 0; k < managedArray.length; k++) {
      knex(table.tbl_pbx_min_ext_mapping)
        .insert({
          destination: managedArray[k].country,
          extension_id: managedArray[k].extension_id,
          assingn_minutes: managedArray[k].minutes,
          customer_id: customer_id,
        })
        .then((response) => {
          res.status(201).send({ message: "Minute Assign Successfully!" });
        })
        .catch((err) => {
          console.log(err);
          res.status(401).send({
            error: "error",
            message: "DB Error: " + err.message,
            error_code: err.errno,
          });
          throw err;
        });
    }
  } else {
    res.status(201).send({ message: "No Minute assingn to extension !" });
  }
}

function getExtensionAssignMinutes(req, res) {
  var destList = req.body.destList;
  let sql = knex
    .from(table.tbl_pbx_min_ext_mapping + " as emp")
    .leftJoin(table.tbl_Extension_master + " as e", "e.id", "emp.extension_id")
    .where("emp.customer_id", req.body.customer_id)
    .whereIn("emp.destination", destList)
    .andWhere("emp.id", req.body.id)
    .select(
      "emp.id",
      "emp.destination",
      "emp.customer_id",
      "emp.assingn_minutes",
      "emp.plan_type",
      "emp.created_at",
      "emp.updated_at",
      "e.ext_number as extension_id"
    )
    .orderBy("emp.id", "asc");
  sql
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(401)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function getExtensionAssignMinutesByExtnId(req, res) {
  var ext_number = req.body.ext_number;
  var ext_id;
  knex(table.tbl_Extension_master)
    .select("id")
    .where("ext_number", ext_number)
    .then((response) => {
      if (response[0]) {
        let sql = knex(table.tbl_mapped_featured_detail)
          .where(knex.raw("locate(" + ext_number + ",ext_number)"))
          .select("feature_id", "feature_name");
        sql.then((response1) => {
          response1 = response1 ? response1 : [];
          if (response1) {
            knex(table.tbl_pbx_min_ext_mapping + " as pmem")
              .leftJoin(
                table.tbl_Country + " as c",
                "pmem.destination",
                "c.phonecode"
              )
              .select("pmem.assingn_minutes", "c.name")
              .where("pmem.extension_id", response[0]["id"])
              .then((response2) => {
                if (response2) {
                  response2 = response2 ? response2 : [];
                  const data = response1.concat(response2);

                  res.send({
                    response: data,
                  });
                }
              });
          }
        });
      }
    });
}

function adjustBundlePlanMinuteForExtension(req, res) {
  //tbl_pbx_min_ext_mapping
  let data = req.body.minutManageForm;
  let customer_id = req.query.customer_id || 0;
  let managedArray = [];
  let destinationIds = [];
  let allRecord = 0;
  for (let i = 0; i < data.length; i++) {
    destinationIds.push(data[i].country.replace("+", ""));
    for (let j = 0; j < data[i].ext.length; j++) {
      let obj = {};
      obj["country"] = data[i].country;
      obj["extension_id"] = data[i].ext[j].id;
      //    obj['minutes'] = (data[i].ext)[j].minutes;
      obj["manage_minutes"] = data[i].ext[j].minutes;
      obj["id"] = data[i].id;
      obj["type"] = data[i].type;
      managedArray.push(obj);
    }
  }

  for (let i = 0; i < managedArray.length; i++) {
    let isMinuteMappingExist;
    allRecord++;
    knex
      .count("id as isExist")
      .from(table.tbl_pbx_min_ext_mapping)
      .where("id", managedArray[i]["id"])
      .andWhere("extension_id", managedArray[i]["extension_id"])
      .then(async (resp) => {
        isMinuteMappingExist = resp
          ? resp[0]["isExist"] == 1
            ? true
            : false
          : false;
        if (isMinuteMappingExist) {
          await knex(table.tbl_pbx_min_ext_mapping)
            .where("id", "=", "" + managedArray[i]["id"] + "")
            .andWhere("extension_id", managedArray[i]["extension_id"])
            .update({
              assingn_minutes: managedArray[i].manage_minutes,
            })
            .then((response) => {
              if (response) {
              }
            })
            .catch((err) => {
              console.log(err);
              res
                .status(401)
                .send({ error: "error", message: "DB Error: " + err.message });
              throw err;
            });
        } else {
          let destination = managedArray[i].country
            ? managedArray[i].country.replace("+", "")
            : 0; // JUST CONVERT +91 TO 91
          await knex(table.tbl_pbx_min_ext_mapping)
            .insert({
              id: managedArray[i].id,
              destination: destination,
              extension_id: managedArray[i].extension_id,
              assingn_minutes: managedArray[i].manage_minutes,
              customer_id: customer_id,
              plan_type: managedArray[i].type,
            })
            .then((response) => {
              if (response) {
              }
            })
            .catch((err) => {
              res.status(200).send({
                code: err.errno,
                error: "error",
                message: "DB Error: " + err.message,
              });
              throw err;
            });
        }
      });

    if (allRecord === managedArray.length) {
      res.send({
        message: "Minute Adjustment Successfully!",
        code: 200,
      });
    }
  }
}

module.exports = {
  createExtension,
  getAllExtension,
  verifyExtension,
  getExtensionById,
  updateExtension,
  getExtensionLimit,
  getMonthlyTotalExtension,
  getTotalExtension,
  deleteExtension,
  getExtensionSetting,
  updateExtensionSettings,
  getExtensionNameandNumber,
  getExtensionByFilters,
  updateExtensionPassword,
  extensionEmailExist,
  getExtensionName,
  verifyEmail,
  getCustomerExtensionFeatures,
  getExtensionFeaturesByFilters,
  getExtensionForSupport,
  verifyExtUsername,
  updatePackageMinuteBal,
  updateExtensionMinute,
  deductCustomExtensionMinute,
  deductAllExtensionMinute,
  getExtensionCount,
  getDestinationDID,
  bulkExtensionUpdate,
  getExtensionForRealtimeDashboard,
  makeFavoriteContactByExtension,
  updateExtension_FMFM_Settings,
  getExtension_FMFM_Setting,
  assignBundlePlanMinuteForExtension,
  getExtensionAssignMinutes,
  adjustBundlePlanMinuteForExtension,
  getExtensionAssignMinutesByExtnId,
  inactiveExtension,
  activeExtension,
  getDidListById,
  UpdateProfile,
  getExtensionByExtId,
  getAllExtensionWithPlugin,
};
