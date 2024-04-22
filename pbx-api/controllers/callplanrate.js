const { knex } = require("../config/knex.db");
const table = require("../config/table.macros.js");

function createCallPlanRate(req, res) {
  // console.log(req.body);
  let sellingMinDuration = "0";
  let areaCode = "";
  let talktime_minutes = "";
  let type = req.body.callPlanRate.plan_type;
  if (type != "0") req.body.callPlanRate.selling_billing_block = 0;
  if (
    req.body.callPlanRate.selling_min_duration == 0 ||
    req.body.callPlanRate.selling_min_duration == "0" ||
    !req.body.callPlanRate.selling_min_duration
  ) {
    sellingMinDuration = "0";
  } else {
    sellingMinDuration = req.body.callPlanRate.selling_min_duration;
  }
  if (
    req.body.callPlanRate.area_code == "" ||
    req.body.callPlanRate.area_code == null ||
    !req.body.callPlanRate.area_code
  ) {
    areaCode = "''";
  } else {
    areaCode = req.body.callPlanRate.area_code;
  }
  let dialPrefix =
    req.body.callPlanRate.prefix + req.body.callPlanRate.dial_prefix;
  if (
    req.body.callPlanRate.isGroup === true ||
    req.body.callPlanRate.isGroup == "1"
  ) {
    req.body.callPlanRate.isGroup = "1";
  } else {
    req.body.callPlanRate.isGroup = "0";
  }
  if (
    req.body.callPlanRate.group_id == "" ||
    req.body.callPlanRate.group_id == null ||
    !req.body.callPlanRate.group_id
  ) {
    req.body.callPlanRate.group_id = "''";
  } else {
    req.body.callPlanRate.group_id = req.body.callPlanRate.group_id;
  }
  if (
    req.body.callPlanRate.talktime_minutes == "" ||
    req.body.callPlanRate.talktime_minutes == null ||
    !req.body.callPlanRate.talktime_minutes
  ) {
    talktime_minutes = "''";
  } else {
    talktime_minutes = req.body.callPlanRate.talktime_minutes;
  }
  console.log(
    knex
      .raw(
        "Call pbx_save_callplanrate(" +
          req.body.callPlanRate.id +
          "," +
          req.body.callPlanRate.call_plan +
          ",'" +
          dialPrefix +
          "'," +
          req.body.callPlanRate.buying_rate +
          ",\
    " +
          req.body.callPlanRate.selling_rate +
          "," +
          sellingMinDuration +
          "," +
          req.body.callPlanRate.selling_billing_block +
          ",'1', " +
          req.body.callPlanRate.gateway +
          "," +
          req.body.callPlanRate.phonecode +
          "," +
          areaCode +
          "," +
          req.body.callPlanRate.isGroup +
          "," +
          req.body.callPlanRate.group_id +
          "," +
          talktime_minutes +
          "," +
          0 +
          ",'" +
          req.body.callPlanRate.plan_type +
          "','" +
          req.body.callPlanRate.booster_for +
          "')"
      )
      .toString()
  );

  knex
    .raw(
      "Call pbx_save_callplanrate(" +
        req.body.callPlanRate.id +
        "," +
        req.body.callPlanRate.call_plan +
        ",'" +
        dialPrefix +
        "'," +
        req.body.callPlanRate.buying_rate +
        ",\
    " +
        req.body.callPlanRate.selling_rate +
        "," +
        sellingMinDuration +
        "," +
        req.body.callPlanRate.selling_billing_block +
        ",'1', " +
        req.body.callPlanRate.gateway +
        "," +
        req.body.callPlanRate.phonecode +
        "," +
        areaCode +
        ",'" +
        req.body.callPlanRate.isGroup +
        "'," +
        req.body.callPlanRate.group_id +
        "," +
        talktime_minutes +
        "," +
        0 +
        ",'" +
        req.body.callPlanRate.plan_type +
        "','" +
        req.body.callPlanRate.booster_for +
        "')"
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

function viewCallPlanRate(req, res) {
  req.body.id = req.body.id ? req.body.id : null;
  req.body.dial_prefix = req.body.dial_prefix ? req.body.dial_prefix : null;
  // console.log(knex.raw("Call pbx_get_callplanrate(" + req.body.id + "," + req.body.dial_prefix + ")").toString());

  knex
    .raw(
      "Call pbx_get_callplanrate(" +
        req.body.id +
        "," +
        req.body.dial_prefix +
        ")"
    )
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function deleteCallPlanRate(req, res) {
  knex
    .raw(
      "Call pbx_delete_callplanrate(" +
        req.query[Object.keys(req.query)[0]] +
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

function getCallPlanRateByFilters(req, res) {
  let data = req.body.filters;
  console.log(data);
  data.by_call_plan = data.by_call_plan.length
    ? "'" + data.by_call_plan + "'"
    : null;
  data.by_dial_prefix = data.by_dial_prefix
    ? "" + data.by_dial_prefix + ""
    : null;
  data.by_buying_rate = data.by_buying_rate
    ? "" + data.by_buying_rate + ""
    : null;
  data.by_selling_rate = data.by_selling_rate
    ? "" + data.by_selling_rate + ""
    : null;
  data.by_call_group = data.by_call_group.length
    ? "'" + data.by_call_group + "'"
    : null;
  data.by_plan_type = data.by_plan_type ? "'" + data.by_plan_type + "'" : null;
  // data.by_gateway = (data.by_gateway) ? ("'" + data.by_gateway + "'") : null;
  if (data.by_gateway == "" || !data.by_gateway) {
    data.by_gateway = null;
  } else {
    data.by_gateway = "'" + data.by_gateway + "'";
  }
  console.log(
    knex
      .raw(
        "Call pbx_getCallPlanRateByFilters(" +
          data.by_call_plan +
          "," +
          data.by_dial_prefix +
          "," +
          data.by_buying_rate +
          "," +
          data.by_selling_rate +
          "," +
          data.by_call_group +
          "," +
          data.by_plan_type +
          "," +
          data.by_gateway +
          ")"
      )
      .toString()
  );

  knex
    .raw(
      "Call pbx_getCallPlanRateByFilters(" +
        data.by_call_plan +
        "," +
        data.by_dial_prefix +
        "," +
        data.by_buying_rate +
        "," +
        data.by_selling_rate +
        "," +
        data.by_call_group +
        "," +
        data.by_plan_type +
        "," +
        data.by_gateway +
        ")"
    )
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function checkUniqueGatewayPrefix(req, res) {
  let prefix = req.body.prefix + "" + req.body.dial_prefix;
  let gateway = req.body.gateway;
  let callPlan = req.body.call_plan;
  let call_plan_rate = req.body.id;
  let sql = knex
    .from(table.tbl_Call_Plan_Rate)
    .select("id")
    .where("dial_prefix", "" + prefix + "")
    .andWhere("status", "=", "1")
    .andWhere("gateway_id", "=", gateway)
    .andWhere("call_plan_id", "=", callPlan)
    .whereNot("id", call_plan_rate);
  console.log(sql.toQuery());
  sql
    .then((response) => {
      console.log(response);
      // if (response.length > 0 && response[0].id !== call_plan_rate) {
      if (response.length > 0) {
        const call_plan_res = response[0];
        res.json({
          id: call_plan_res.id,
        });
      } else {
        res.json({
          id: "",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res
        .status(411)
        .send({ error: "error", message: "DB Error: " + err.message });
      throw err;
    });
}

function viewCustomerCallPlanRate(req, res) {
  knex
    .raw("Call pbx_get_Customercallplanrate(" + req.body.id + ")")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getCustomerCallPlanRateByFilters(req, res) {
  let data = req.body.filters;
  // data.by_dial_prefix = data.by_dial_prefix ? ("" + data.by_dial_prefix + "") : null;
  data.by_dial_prefix = data.by_dial_prefix.length
    ? "'" + data.by_dial_prefix + "'"
    : null;
  data.by_selling_rate = data.by_selling_rate
    ? "" + data.by_selling_rate + ""
    : null;

  // console.log(knex.raw("Call pbx_getCustomerCallPlanRateByFilters(" + data.by_dial_prefix + "," + data.by_selling_rate + ", "+ data.customer_id +")").toString());

  knex
    .raw(
      "Call pbx_getCustomerCallPlanRateByFilters(" +
        data.by_dial_prefix +
        "," +
        data.by_selling_rate +
        ", " +
        data.customer_id +
        ")"
    )
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function viewExtensionCallPlanRate(req, res) {
  knex
    .raw("Call pbx_get_Extensioncallplanrate(" + req.body.id + ")")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getExtensionCallPlanRateByFilters(req, res) {
  let data = req.body.filters;
  // data.by_dial_prefix = data.by_dial_prefix ? ("'" + data.by_dial_prefix + "'") : null;
  data.by_dial_prefix = data.by_dial_prefix.length
    ? "'" + data.by_dial_prefix + "'"
    : null;
  data.by_selling_rate = data.by_selling_rate
    ? "" + data.by_selling_rate + ""
    : null;

  console.log(
    knex
      .raw(
        "Call pbx_getExtensionCallPlanRateByFilters(" +
          data.by_dial_prefix +
          "," +
          data.by_selling_rate +
          "," +
          data.id +
          ")"
      )
      .toString()
  );

  knex
    .raw(
      "Call pbx_getExtensionCallPlanRateByFilters(" +
        data.by_dial_prefix +
        "," +
        data.by_selling_rate +
        ", " +
        data.id +
        ")"
    )
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function viewUserDetailCallPlanRate(req, res) {
  req.body.id = req.body.id ? req.body.id : null;
  // console.log(knex.raw("Call pbx_get_callplanrate(" + req.body.id + "," + req.body.dial_prefix + ")").toString());

  knex
    .raw(
      "Call pbx_get_userdetailscallplanrate(" +
        req.body.id +
        "," +
        req.body.role +
        "," +
        req.body.user_id +
        ")"
    )
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function viewManagerCustomerCallPlanRate(req, res) {
  let accountManagerId = req.body.id;
  knex
    .raw("Call pbx_get_AccountManagercallplanrate(" + accountManagerId + ")")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getManagerCustomerCallPlanRateByFilters(req, res) {
  let data = req.body;
  console.log(data);
  // let log = console.log;
  // if([0] == false) {log("hello Yash",[0]);}
  let accountManagerId = data.customer_id ? "" + data.customer_id + "" : null;
  // data.by_call_plan = data.by_call_plan ? ("" + data.by_call_plan + "") : null;
  data.by_call_plan = data.by_call_plan.length
    ? "" + data.by_call_plan + ""
    : null;
  data.by_dial_prefix = data.by_dial_prefix
    ? "" + data.by_dial_prefix + ""
    : null;
  data.by_buying_rate = data.by_buying_rate
    ? "" + data.by_buying_rate + ""
    : null;
  data.by_selling_rate = data.by_selling_rate
    ? "" + data.by_selling_rate + ""
    : null;
  data.by_customer = data.by_customer ? "" + data.by_customer + "" : null;
  data.by_gateway = data.by_gateway.length ? "" + data.by_gateway + "" : null;

  let sql = knex.raw(
    "Call pbx_getManagerCustomerCallPlanRateByFilters(" +
      data.by_call_plan +
      "," +
      data.by_dial_prefix +
      "," +
      data.by_buying_rate +
      "," +
      data.by_selling_rate +
      "," +
      data.by_customer +
      "," +
      accountManagerId +
      "," +
      data.by_gateway +
      ")"
  );
  console.log(sql.toQuery(), "/////////////to query//////////////////////");
  sql
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function checkUniqueCallGroup(req, res) {
  console.log(req.body);
  let prefix = req.body.prefix + "" + req.body.dial_prefix;
  // let groupId = req.body.group_id;
  let groupId = "";
  if (!req.body.group_id || req.body.group_id == "0") {
  }
  // let gateway = req.body.gateway;
  // let callPlan = req.body.call_plan;
  let call_plan_rate = req.body.callPlan;
  if (groupId) {
    let sql = knex
      .from(table.tbl_Call_Plan_Rate)
      .select("id")
      .where("dial_prefix", "" + prefix + "")
      .andWhere("status", "=", "1")
      .andWhere("group_id", "=", groupId)
      // .andWhere('call_plan_id', '=', callPlan)
      .whereNot("id", call_plan_rate);
    console.log(sql.toQuery());
    sql
      .then((response) => {
        console.log(response);
        // if (response.length > 0 && response[0].id !== call_plan_rate) {
        if (response.length > 0) {
          const call_plan_res = response[0];
          res.json({
            id: call_plan_res.id,
          });
        } else {
          res.json({
            id: "",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res
          .status(411)
          .send({ error: "error", message: "DB Error: " + err.message });
        throw err;
      });
  } else {
    res.json({
      id: "",
    });
  }
}

function GatewaUpdate(req, res) {
  let o_gid = req.body.old_GatewayId;
  let n_gid = req.body.new_GatewayId;
  let sql = knex(table.tbl_Call_Plan_Rate)
    .update({ gateway_id: n_gid })
    .whereIn("gateway_id", o_gid);
  console.log(sql.toQuery(), "------------to query>>>>>>>>>>>>>");
  sql.then((response) => {
    console.log("----------", response);
    res.send({
      status_code: 200,
      response: response,
    });
  });
}

module.exports = {
  createCallPlanRate,
  viewCallPlanRate,
  getCallPlanRateByFilters,
  deleteCallPlanRate,
  checkUniqueGatewayPrefix,
  viewCustomerCallPlanRate,
  getCustomerCallPlanRateByFilters,
  viewExtensionCallPlanRate,
  getExtensionCallPlanRateByFilters,
  viewUserDetailCallPlanRate,
  viewManagerCustomerCallPlanRate,
  getManagerCustomerCallPlanRateByFilters,
  checkUniqueCallGroup,
  GatewaUpdate,
};
