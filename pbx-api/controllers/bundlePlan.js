const { knex } = require("../config/knex.db");
const table = require("../config/table.macros.js");
var moment = require("moment");
let pushEmail = require("./pushEmail");

function createBundlePlan(req, res) {
  let is_overuse;
  let numberOfDays = "";
  let operation = req.body.bundlePlan.id ? "update" : "create";
  let extra_fee_list = req.body.bundlePlan.fee_type_charges;
  if (
    !req.body.bundlePlan.is_overuse ||
    req.body.bundlePlan.is_overuse == "0" ||
    req.body.bundlePlan.is_overuse == false ||
    req.body.bundlePlan.is_overuse == ""
  ) {
    is_overuse = "0";
  } else if (
    req.body.bundlePlan.is_overuse == "1" ||
    req.body.bundlePlan.is_overuse == true ||
    req.body.bundlePlan.is_overuse != ""
  ) {
    is_overuse = "1";
  }
  if (req.body.bundlePlan.validity == "custom") {
    numberOfDays = req.body.bundlePlan.number_of_days;
  } else {
    numberOfDays = 0;
  }
  knex
    .raw(
      "Call pbx_save_bundlePlan(" +
        req.body.bundlePlan.id +
        ",'" +
        req.body.bundlePlan.name +
        "'," +
        req.body.bundlePlan.charge +
        "," +
        req.body.bundlePlan.plan_type +
        ",'" +
        req.body.bundlePlan.validity +
        "'," +
        req.body.bundlePlan.call_plan +
        ",'" +
        is_overuse +
        "'," +
        numberOfDays +
        ",'" +
        req.body.bundlePlan.booster_for +
        "')"
    )
    .then((response) => {
      if (operation === "create") {
        let insertedId = response[0][0][0].Id;
        const mapped_list = extra_fee_list.map((item) => ({
          bundle_plan_id: insertedId,
          fee_type: item.fee_type,
          charge: item.charge,
        }));
        let sql2 = knex(table.tbl_pbx_bundle_plan_extra_fee_map).insert(
          mapped_list
        );
        sql2
          .then((response) => {
            if (response) {
              res.send({
                response: response,
                message: "Minute Plan created successfully.",
                code: 200,
              });
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
      } else {
        const mapped_list = extra_fee_list.map((item) => ({
          bundle_plan_id: req.body.bundlePlan.id,
          fee_type: item.fee_type,
          charge: item.charge,
        }));
        let sql = knex(table.tbl_pbx_bundle_plan_extra_fee_map).where(
          "bundle_plan_id",
          "=",
          "" + req.body.bundlePlan.id + ""
        );
        sql.del();
        sql
          .then((response) => {
            if (response) {
              let sql2 = knex(table.tbl_pbx_bundle_plan_extra_fee_map).insert(
                mapped_list
              );
              sql2
                .then((response) => {
                  if (response) {
                    res.send({
                      response: response,
                      message: "Bundle Plan updated successfully.",
                      code: 200,
                    });
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
            } else {
              res.status(200).send({ error: "error", message: "DB Error" });
            }
          })
          .catch((err) => {
            res
              .status(401)
              .send({ error: "error", message: "DB Error: " + err.message });
            throw err;
          });
      }
    })
    .catch((err) => {
      res.send({ code: err.errno, message: err.sqlMessage });
    });
}

function updateBundlePlan(req, res) {
  let is_overuse;
  let numberOfDays = "";
  let extra_fee_list = req.body.bundlePlan.fee_type_charges;
  if (
    !req.body.bundlePlan.is_overuse ||
    req.body.bundlePlan.is_overuse == "0" ||
    req.body.bundlePlan.is_overuse == false ||
    req.body.bundlePlan.is_overuse == ""
  ) {
    is_overuse = "0";
  } else if (
    req.body.bundlePlan.is_overuse == "1" ||
    req.body.bundlePlan.is_overuse == true ||
    req.body.bundlePlan.is_overuse != ""
  ) {
    is_overuse = "1";
  }
  if (req.body.bundlePlan.validity == "custom") {
    numberOfDays = req.body.bundlePlan.number_of_days;
  } else {
    numberOfDays = "";
  }
  let sql = knex(table.tbl_pbx_bundle_plan).where(
    "id",
    "=",
    "" + req.body.bundlePlan.id + ""
  );
  sql.update({
    name: "" + req.body.bundlePlan.name + "",
    charge: "" + req.body.bundlePlan.charge + "",
    plan_type: "" + req.body.bundlePlan.plan_type + "",
    validity: "" + req.body.bundlePlan.validity + "",
    call_plan: "" + req.body.bundlePlan.call_plan + "",
    is_overuse: "" + is_overuse + "",
    number_of_days: "" + numberOfDays + "",
    booster_for: "" + req.body.bundlePlan.booster_for + "",
  });
  sql
    .then((response) => {
      const mapped_list = extra_fee_list.map((item) => ({
        bundle_plan_id: req.body.bundlePlan.id,
        fee_type: item.fee_type,
        charge: item.charge,
      }));
      let sql = knex(table.tbl_pbx_bundle_plan_extra_fee_map).where(
        "bundle_plan_id",
        "=",
        "" + req.body.bundlePlan.id + ""
      );
      sql.del();
      sql
        .then((response) => {
          if (response) {
            let sql2 = knex(table.tbl_pbx_bundle_plan_extra_fee_map).insert(
              mapped_list
            );
            sql2
              .then((response) => {
                if (response) {
                  res.send({
                    response: response,
                    message: "Minute Plan updated successfully.",
                    code: 200,
                  });
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
          } else {
            res.status(200).send({ error: "error", message: "DB Error" });
          }
        })
        .catch((err) => {
          res
            .status(401)
            .send({ error: "error", message: "DB Error: " + err.message });
          throw err;
        });
    })
    .catch((err) => {
      res.send({ code: err.errno, message: err.sqlMessage });
    });
}

function viewBundlePlan(req, res) {
  knex
    .raw("Call pbx_get_bundle_plan()")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getBundlePlanByFilters(req, res) {
  let data = req.body.filters;
  data.by_name = data.by_name ? "'" + data.by_name + "'" : null;
  data.by_plan_type = data.by_plan_type ? "'" + data.by_plan_type + "'" : null;
  data.by_validity = data.by_validity ? "'" + data.by_validity + "'" : null;
  data.by_id = data.by_id ? "'" + data.by_id + "'" : null;
  data.by_call_plan = data.by_call_plan ? "'" + data.by_call_plan + "'" : null;
  knex
    .raw(
      "Call pbx_getBundlePlanByFilters(" +
        data.by_plan_type +
        "," +
        data.by_name +
        "," +
        data.by_validity +
        "," +
        data.by_id +
        "," +
        data.by_call_plan +
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

function getMinutePlanForPackageCretion(req, res) {
  let data = req.body.filters;
  data.by_plan_type = data.by_plan_type ? "'" + data.by_plan_type + "'" : null;
  knex
    .raw("Call pbx_getMinutePlanForPackageCretion(" + data.by_plan_type + ")")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function viewCustomerBundlePlan(req, res) {
  let data = req.body;
  data.by_destination = data.by_destination
    ? data.by_destination.length
      ? "'" + data.by_destination + "'"
      : null
    : null;
  data.customer_id = data.by_customerId
    ? "'" + data.by_customerId + "'"
    : data.customer_id;
  data.group_dest = data.group_dest ? "'" + data.group_dest + "'" : null;
  knex
    .raw(
      "Call pbx_get_customer_bundle_plan(" +
        data.customer_id +
        "," +
        data.by_destination +
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

function viewCustomerBundlePlanAllRates(req, res) {
  let data = req.body;
  data.by_destination = data.by_destination
    ? data.by_destination.length
      ? "'" + data.by_destination + "'"
      : null
    : null;
  data.customer_id = data.by_customerId
    ? "'" + data.by_customerId + "'"
    : data.customer_id;
  knex
    .raw(
      "Call pbx_get_customer_bundle_call_rates(" +
        data.customer_id +
        "," +
        data.by_destination +
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

function viewCustomerTeleconsultancyPlan(req, res) {
  let data = req.body;
  knex
    .raw("Call pbx_get_customer_teleconsultancy_plan(" + data.customer_id + ")")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}
function viewCustomerRoamingPlan(req, res) {
  let data = req.body;
  data.by_destination = data.by_destination.length
    ? "'" + data.by_destination + "'"
    : null;
  data.customer_id = data.by_customerId
    ? "'" + data.by_customerId + "'"
    : data.customer_id;
  data.by_group_name = data.by_group_name
    ? "'" + data.by_group_name + "'"
    : null;
  knex
    .raw(
      "Call pbx_get_customer_roaming_plan(" +
        data.customer_id +
        "," +
        data.by_destination +
        "," +
        data.by_group_name +
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

function viewCustomerBoosterPlan(req, res) {
  let data = req.body;
  if (Object.keys(data).length) {
    knex
      .raw("Call pbx_get_customer_booster_plan(" + data.customer_id + ")")
      .then((response) => {
        if (response) {
          res.send({ response: response[0][0] });
        }
      })
      .catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
      });
  } else {
    knex
      .raw("Call pbx_get_booster_plan()")
      .then((response) => {
        if (response) {
          res.send({ response: response[0][0] });
        }
      })
      .catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
      });
  }
}

function purchaseBoosterPlanByCustomers(req, res) {
  let data = req.body;
  if (data.hasOwnProperty("booster_info")) {
    let count = 0;
    for (let i = 0; i < data.booster_info.length; i++) {
      count++;
      let boosterData = data.booster_info[i];
      let totalCharges = 0;
      var splitData = boosterData.toString().split("-");
      data.id = splitData[0]; // booster id
      data.name = splitData[1];
      let charge = splitData[3];
      let extra_charge = splitData[4];
      let chargeList = extra_charge ? extra_charge.split(",") : [];
      chargeList.forEach((element) => {
        totalCharges += Number(element);
      });

      totalCharges += Number(charge);
      let description = "Charge for Booster plan - " + data.name;
      let customer_id = data.customer_id;
      data.purchase_date = new Date();
      data.purchase_date = data.purchase_date
        ? "'" + moment(data.purchase_date).format("YYYY-MM-DD hh:mm:ss") + "'"
        : null;
      data.validity = splitData[2];
      data.charge = totalCharges;
      let sql = knex.raw(
        "Call pbx_purchase_booster_plan(" +
          data.customer_id +
          "," +
          data.id +
          "," +
          data.purchase_date +
          "," +
          totalCharges +
          ",'" +
          description +
          "'," +
          data.charge_status +
          "," +
          data.role_id +
          "," +
          data.process_by +
          ")"
      );
      sql
        .then((response) => {
          for (let i = 1; i < 3; i++) {
            if (i == 1) {
              pushEmail
                .getCustomerNameandEmail(customer_id)
                .then((customerData) => {
                  let custData = {
                    boosterEmailType: "admin",
                    email: data.adminEmail,
                    customerEmail: customerData.email,
                  };
                  const returnedTarget = Object.assign(customerData, custData);
                  pushEmail
                    .getEmailContentUsingCategory("BoosterPurchaseInfoAdmin")
                    .then((val) => {
                      pushEmail
                        .sendmail({
                          username: "Admin",
                          data: returnedTarget,
                          val: val,
                          boosterData: data,
                        })
                        .then((data1) => {});
                    });
                });
            } else {
              pushEmail
                .getCustomerNameandEmail(customer_id)
                .then((customerData) => {
                  customerData["boosterEmailType"] = "customer";
                  pushEmail
                    .getEmailContentUsingCategory("BoosterPurchase")
                    .then((val) => {
                      pushEmail
                        .sendmail({
                          data: customerData,
                          val: val,
                          boosterData: data,
                        })
                        .then((data1) => {});
                    });
                });
            }
          }

          //-------------------------------------------------------------------------------------------------------------

          let sql = knex
            .select(
              "cpr.*",
              "bp.validity as bundlePlanValidity",
              "bp.plan_type as minutePlanType",
              "bp.number_of_days as bundlePlanValidityDays"
            )
            .from(table.tbl_Call_Plan_Rate + " as cpr")
            .leftJoin(
              table.tbl_Call_Plan + " as cp",
              "cp.id",
              "cpr.call_plan_id"
            )
            .leftJoin(
              table.tbl_pbx_bundle_plan + " as bp",
              "bp.call_plan",
              "cp.id"
            )
            .where("bp.id", data.id)
            .andWhere("cpr.is_group", "=", "0");
          sql.then(async (response) => {
            var callPlanType = data["booster_for"];
            const bundlePlanValidity = response[0]
              ? response[0]["bundlePlanValidity"]
              : "weekly";
            const bundlePlanValidityDays = response[0]
              ? response[0]["bundlePlanValidityDays"]
              : 0;
            const bundlePlanType = response[0]
              ? response[0]["minutePlanType"]
              : "1";
            if (response.length > 0) {
              let attachCallPlanRateList = response;
              for (let i = 0; i < attachCallPlanRateList.length; i++) {
                let callRateDestination =
                  attachCallPlanRateList[i]["dial_prefix"];
                let callRateGateway = attachCallPlanRateList[i]["gateway_id"];
                let sqls = knex
                  .count("cpr.id as isExist")
                  .select(
                    "bp.*",
                    "cpr.id as existCallPlanRateId",
                    "cp.id as callPlanId"
                  ) //'cp.id as callPlanId'
                  .from(table.tbl_Call_Plan_Rate + " as cpr")
                  .leftJoin(
                    table.tbl_Call_Plan + " as cp",
                    "cp.id",
                    "cpr.call_plan_id"
                  )
                  .leftJoin(
                    table.tbl_pbx_bundle_plan + " as bp",
                    "bp.call_plan",
                    "cp.id"
                  )
                  .leftJoin(
                    table.tbl_pbx_call_rate_group + " as crg",
                    "crg.id",
                    "cpr.group_id"
                  )
                  .leftJoin(table.tbl_PBX_features + " as f", function () {
                    this.on(function () {
                      this.on("f.bundle_plan_id", "=", "bp.id");
                      this.orOn("f.roaming_plan_id", "=", "bp.id");
                      this.orOn("f.teleConsultancy_call_plan_id", "=", "bp.id");
                    });
                  })
                  .leftJoin(
                    table.tbl_Package + " as pckg",
                    "pckg.feature_id",
                    "f.id"
                  )
                  .leftJoin(
                    table.tbl_Map_customer_package + " as mcp",
                    "mcp.package_id",
                    "pckg.id"
                  )
                  .where("mcp.customer_id", "=", "" + data.customer_id + "")
                  // .andWhere('cpr.plan_type', bundlePlanType)
                  .andWhere("cpr.booster_for", callPlanType)
                  .andWhere("cpr.dial_prefix", callRateDestination)
                  .andWhere("cpr.gateway_id", callRateGateway)
                  .andWhere("cpr.is_group", "0")
                  .groupBy(["cpr.id", "bp.id"]);
                sqls
                  .then(async (response) => {
                    let isCallRateExist = response[0]
                      ? response[0]["isExist"] == 1
                        ? true
                        : false
                      : false;
                    if (isCallRateExist) {
                      let existCallPlanRateId =
                        response[0]["existCallPlanRateId"];
                      let boosterPlanValidityDays =
                        bundlePlanValidity == "custom"
                          ? bundlePlanValidityDays
                          : bundlePlanValidity == "weekly"
                          ? 7
                          : 28;
                      let currentDate = new Date();
                      let current_time = new Date(
                        currentDate.setDate(
                          currentDate.getDate() + boosterPlanValidityDays
                        )
                      );
                      let booster_expiry_date =
                        current_time.toISOString().split("T")[0] +
                        " " +
                        current_time.toTimeString().split(" ")[0];
                      await knex
                        .from(table.tbl_Call_Plan_Rate) //
                        .where("id", "=", existCallPlanRateId)
                        .increment(
                          "talktime_minutes",
                          attachCallPlanRateList[i]["talktime_minutes"]
                        )
                        .update({
                          booster_minutes:
                            attachCallPlanRateList[i]["talktime_minutes"],
                          expiry_date: booster_expiry_date,
                        })
                        .then((resp) => {})
                        .catch((err) => {
                          console.log(err);
                          throw err;
                        });
                    } else {
                      // ADD NEW ENTRY
                      let existCallPlanId;
                      let planType;
                      await knex
                        .select(
                          "cp.*",
                          "bp.name as bundlePlanName",
                          "bp.validity as bundlePlanValidity",
                          "bp.number_of_days as numberOfDays",
                          "bp.booster_for"
                        ) //'cp.id as callPlanId'
                        .from(table.tbl_Call_Plan + " as cp")
                        .leftJoin(
                          table.tbl_pbx_bundle_plan + " as bp",
                          "bp.call_plan",
                          "cp.id"
                        )
                        .leftJoin(
                          table.tbl_PBX_features + " as f",
                          function () {
                            this.on(function () {
                              this.on("f.bundle_plan_id", "=", "bp.id");
                              this.orOn("f.roaming_plan_id", "=", "bp.id");
                              this.orOn(
                                "f.teleConsultancy_call_plan_id",
                                "=",
                                "bp.id"
                              );
                            });
                          }
                        )
                        .leftJoin(
                          table.tbl_Package + " as pckg",
                          "pckg.feature_id",
                          "f.id"
                        )
                        .leftJoin(
                          table.tbl_Map_customer_package + " as mcp",
                          "mcp.package_id",
                          "pckg.id"
                        )
                        .where(
                          "mcp.customer_id",
                          "=",
                          "" + req.body["customer_id"] + ""
                        )
                        .andWhere("bp.plan_type", callPlanType)
                        .then(async (response2) => {
                          existCallPlanId = response2[0]
                            ? response2[0]["id"]
                            : 0;
                          planType = "3";
                        })
                        .catch((err) => {
                          res.send({
                            code: err.errno,
                            message: err.sqlMessage,
                          });
                        });

                      let boosterPlanValidity =
                        bundlePlanValidity == "custom"
                          ? bundlePlanValidityDays
                          : bundlePlanValidity == "weekly"
                          ? 7
                          : 28;
                      await knex
                        .raw(
                          "Call pbx_save_callplanrate(" +
                            null +
                            "," +
                            existCallPlanId +
                            ",'" +
                            attachCallPlanRateList[i]["dial_prefix"] +
                            "'," +
                            attachCallPlanRateList[i]["buying_rate"] +
                            "," +
                            attachCallPlanRateList[i]["selling_rate"] +
                            "," +
                            attachCallPlanRateList[i]["selling_min_duration"] +
                            "," +
                            attachCallPlanRateList[i]["selling_billing_block"] +
                            ",'1', " +
                            attachCallPlanRateList[i]["gateway_id"] +
                            "," +
                            attachCallPlanRateList[i]["phonecode"] +
                            ",'" +
                            attachCallPlanRateList[i]["area_code"] +
                            "','" +
                            attachCallPlanRateList[i]["is_group"] +
                            "'," +
                            attachCallPlanRateList[i]["group_id"] +
                            "," +
                            attachCallPlanRateList[i]["talktime_minutes"] +
                            "," +
                            boosterPlanValidity +
                            ",'" +
                            planType +
                            "','" +
                            callPlanType +
                            "')"
                        ) //talktime_minutes  + "," + 0 + ",'" + req.body.callPlanRate.plan_type +"')")
                        .then((response) => {
                          if (response) {
                          }
                        })
                        .catch((err) => {
                          res.send({
                            code: err.errno,
                            message: err.sqlMessage,
                          });
                        });
                    }
                  })
                  .catch((err) => {
                    res
                      .status(401)
                      .send({
                        error: "error",
                        message: "DB Error: " + err.message,
                      });
                    throw err;
                  });
              }
            } else {
              res.json({
                code: 400,
                message: "User did not add any call plan rates!",
              });
            }
          });

          if (!response) {
            res.send({
              code: response[0][0][0].MYSQL_SUCCESSNO,
              message: response[0][0][0].MESSAGE_TEXT,
            });
          }
        })
        .catch((err) => {
          res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
    }
    if (count == data.booster_info.length) {
      res.send({
        response: {
          code: 200,
          message: "Booster plan assigned by admin to customer",
        },
      });
    }
  } else {
    let description = "Charge for Booster plan - " + data.name;
    let customer_id = data.customer_id;
    data.purchase_date = data.purchase_date
      ? "'" + moment(data.purchase_date).format("YYYY-MM-DD hh:mm:ss") + "'"
      : null;
    knex
      .raw(
        "Call pbx_purchase_booster_plan(" +
          data.customer_id +
          "," +
          data.id +
          "," +
          data.purchase_date +
          "," +
          data.charge +
          ",'" +
          description +
          "'," +
          data.charge_status +
          "," +
          data.role_id +
          "," +
          data.process_by +
          ")"
      )
      .then((response) => {
        for (let i = 1; i < 3; i++) {
          if (i == 1) {
            pushEmail
              .getCustomerNameandEmail(customer_id)
              .then((customerData) => {
                let custData = {
                  email: data.adminEmail,
                  customerEmail: customerData.email,
                };
                const returnedTarget = Object.assign(customerData, custData);
                pushEmail
                  .getEmailContentUsingCategory("BoosterPurchaseInfoAdmin")
                  .then((val) => {
                    pushEmail
                      .sendmail({
                        username: "Admin",
                        data: returnedTarget,
                        val: val,
                        boosterData: data,
                      })
                      .then((data1) => {});
                  });
              });
          } else {
            pushEmail
              .getCustomerNameandEmail(customer_id)
              .then((customerData) => {
                pushEmail
                  .getEmailContentUsingCategory("BoosterPurchase")
                  .then((val) => {
                    pushEmail
                      .sendmail({
                        data: customerData,
                        val: val,
                        boosterData: data,
                      })
                      .then((data1) => {
                        res.send({
                          code: response[0][0][0].MYSQL_SUCCESSNO,
                          message: response[0][0][0].MESSAGE_TEXT,
                        });
                      });
                  });
              });
          }
        }
        let sql = knex
          .select(
            "cpr.*",
            "bp.validity as bundlePlanValidity",
            "bp.booster_for as minutePlanType",
            "bp.number_of_days as bundlePlanValidityDays"
          )
          .from(table.tbl_Call_Plan_Rate + " as cpr")
          .leftJoin(table.tbl_Call_Plan + " as cp", "cp.id", "cpr.call_plan_id")
          .leftJoin(
            table.tbl_pbx_bundle_plan + " as bp",
            "bp.call_plan",
            "cp.id"
          )
          .where("bp.id", data.id)
          .andWhere("cpr.is_group", "=", "0");
        sql.then(async (response) => {
          var callPlanType = data["booster_for"];
          const bundlePlanValidity = response[0]
            ? response[0]["bundlePlanValidity"]
            : "weekly";
          const bundlePlanValidityDays = response[0]
            ? response[0]["bundlePlanValidityDays"]
            : 0;
          const bundlePlanType = response[0]
            ? response[0]["minutePlanType"]
            : "1";
          if (response.length > 0) {
            let attachCallPlanRateList = response;
            for (let i = 0; i < attachCallPlanRateList.length; i++) {
              let callRateDestination =
                attachCallPlanRateList[i]["dial_prefix"];
              let callRateGateway = attachCallPlanRateList[i]["gateway_id"];
              await knex
                .count("cpr.id as isExist")
                .select(
                  "bp.*",
                  "cpr.id as existCallPlanRateId",
                  "cp.id as callPlanId"
                ) //'cp.id as callPlanId'
                .from(table.tbl_Call_Plan_Rate + " as cpr")
                .leftJoin(
                  table.tbl_Call_Plan + " as cp",
                  "cp.id",
                  "cpr.call_plan_id"
                )
                .leftJoin(
                  table.tbl_pbx_bundle_plan + " as bp",
                  "bp.call_plan",
                  "cp.id"
                )
                .leftJoin(
                  table.tbl_pbx_call_rate_group + " as crg",
                  "crg.id",
                  "cpr.group_id"
                )
                .leftJoin(table.tbl_PBX_features + " as f", function () {
                  this.on(function () {
                    this.on("f.bundle_plan_id", "=", "bp.id");
                    this.orOn("f.roaming_plan_id", "=", "bp.id");
                    this.orOn("f.teleConsultancy_call_plan_id", "=", "bp.id");
                  });
                })
                .leftJoin(
                  table.tbl_Package + " as pckg",
                  "pckg.feature_id",
                  "f.id"
                )
                .leftJoin(
                  table.tbl_Map_customer_package + " as mcp",
                  "mcp.package_id",
                  "pckg.id"
                )
                .where("mcp.customer_id", "=", "" + data.customer_id + "")
                .andWhere("cpr.plan_type", callPlanType)
                .andWhere("cpr.gateway_id", callRateGateway)
                .andWhere("cpr.dial_prefix", callRateDestination)
                .andWhere("cpr.is_group", "0")
                .groupBy(["cpr.id", "bp.id"])
                .then(async (response) => {
                  let isCallRateExist = response[0]
                    ? response[0]["isExist"] > 0
                      ? true
                      : false
                    : false;
                  const cdrData = response[0] ? response[0] : {};
                  if (isCallRateExist) {
                    // update existing call rates
                    let existCallPlanRateId =
                      response[0]["existCallPlanRateId"];
                    let boosterPlanValidityDays =
                      bundlePlanValidity == "custom"
                        ? bundlePlanValidityDays
                        : bundlePlanValidity == "weekly"
                        ? 7
                        : 28;
                    let currentDate = new Date();
                    let current_time = new Date(
                      currentDate.setDate(
                        currentDate.getDate() + boosterPlanValidityDays
                      )
                    );
                    let booster_expiry_date =
                      current_time.toISOString().split("T")[0] +
                      " " +
                      current_time.toTimeString().split(" ")[0];
                    await knex
                      .from(table.tbl_Call_Plan_Rate) //
                      .where("id", "=", existCallPlanRateId)
                      .increment(
                        "talktime_minutes",
                        attachCallPlanRateList[i]["talktime_minutes"]
                      )
                      .update({
                        booster_minutes:
                          attachCallPlanRateList[i]["talktime_minutes"],
                        expiry_date: booster_expiry_date,
                      })
                      .then((resp) => {})
                      .catch((err) => {
                        console.log(err);
                        throw err;
                      });
                  } else {
                    // ADD NEW ENTRY

                    let existCallPlanId;
                    let planType;
                    let isBoosterCallRateExist;
                    let existCallPlanRateId;
                    await knex
                      .count("cpr.id as isExist")
                      .select("cpr.*")
                      .from(table.tbl_Call_Plan_Rate + " as cpr")

                      .leftJoin(
                        table.tbl_Call_Plan + " as cp",
                        "cp.id",
                        "cpr.call_plan_id"
                      )
                      .leftJoin(
                        table.tbl_pbx_bundle_plan + " as bp",
                        "bp.call_plan",
                        "cp.id"
                      )
                      .leftJoin(
                        table.tbl_pbx_call_rate_group + " as crg",
                        "crg.id",
                        "cpr.group_id"
                      )
                      .leftJoin(table.tbl_PBX_features + " as f", function () {
                        this.on(function () {
                          this.on("f.bundle_plan_id", "=", "bp.id");
                          this.orOn("f.roaming_plan_id", "=", "bp.id");
                          this.orOn(
                            "f.teleConsultancy_call_plan_id",
                            "=",
                            "bp.id"
                          );
                        });
                      })
                      .leftJoin(
                        table.tbl_Package + " as pckg",
                        "pckg.feature_id",
                        "f.id"
                      )
                      .leftJoin(
                        table.tbl_Map_customer_package + " as mcp",
                        "mcp.package_id",
                        "pckg.id"
                      )

                      .where("mcp.customer_id", "=", "" + data.customer_id + "")
                      .andWhere("cpr.plan_type", "3")
                      .andWhere("cpr.booster_for", callPlanType)
                      .andWhere("cpr.gateway_id", callRateGateway)
                      .andWhere("cpr.dial_prefix", callRateDestination)
                      .andWhere("cpr.is_group", "0")
                      // .groupBy('cpr.id');
                      .then((resp) => {
                        isBoosterCallRateExist = resp
                          ? resp[0]["isExist"] > 0
                            ? true
                            : false
                          : false;
                        existCallPlanRateId = resp ? resp[0]["id"] : 0;
                      });
                    if (isBoosterCallRateExist) {
                      // update
                      let boosterPlanValidityDays =
                        bundlePlanValidity == "custom"
                          ? bundlePlanValidityDays
                          : bundlePlanValidity == "weekly"
                          ? 7
                          : 28;
                      let currentDate = new Date();
                      let current_time = new Date(
                        currentDate.setDate(
                          currentDate.getDate() + boosterPlanValidityDays
                        )
                      );
                      let booster_expiry_date =
                        current_time.toISOString().split("T")[0] +
                        " " +
                        current_time.toTimeString().split(" ")[0];
                      await knex
                        .from(table.tbl_Call_Plan_Rate) //
                        .where("id", "=", existCallPlanRateId)
                        .increment(
                          "talktime_minutes",
                          attachCallPlanRateList[i]["talktime_minutes"]
                        )
                        .update({
                          booster_minutes:
                            attachCallPlanRateList[i]["talktime_minutes"],
                          expiry_date: booster_expiry_date,
                        })
                        .then((resp) => {})
                        .catch((err) => {
                          console.log(err);
                          throw err;
                        });
                    } else {
                      //
                      await knex
                        .select(
                          "cp.*",
                          "bp.name as bundlePlanName",
                          "bp.validity as bundlePlanValidity",
                          "bp.number_of_days as numberOfDays",
                          "bp.booster_for"
                        ) //'bp.booster_for' 'cp.id as callPlanId'
                        .from(table.tbl_Call_Plan + " as cp")
                        .leftJoin(
                          table.tbl_pbx_bundle_plan + " as bp",
                          "bp.call_plan",
                          "cp.id"
                        )
                        .leftJoin(
                          table.tbl_PBX_features + " as f",
                          function () {
                            this.on(function () {
                              this.on("f.bundle_plan_id", "=", "bp.id");
                              this.orOn("f.roaming_plan_id", "=", "bp.id");
                              this.orOn(
                                "f.teleConsultancy_call_plan_id",
                                "=",
                                "bp.id"
                              );
                            });
                          }
                        )
                        .leftJoin(
                          table.tbl_Package + " as pckg",
                          "pckg.feature_id",
                          "f.id"
                        )
                        .leftJoin(
                          table.tbl_Map_customer_package + " as mcp",
                          "mcp.package_id",
                          "pckg.id"
                        )
                        .where(
                          "mcp.customer_id",
                          "=",
                          "" + data.customer_id + ""
                        )
                        .andWhere("bp.plan_type", callPlanType)
                        .then(async (response2) => {
                          existCallPlanId = response2[0]
                            ? response2[0]["id"]
                            : 0;
                          // planType =  response2[0] ? response2[0]['booster_for'] : 0;
                          planType = "3";
                        })
                        .catch((err) => {
                          res.send({
                            code: err.errno,
                            message: err.sqlMessage,
                          });
                        });

                      let boosterPlanValidity =
                        bundlePlanValidity === "custom"
                          ? bundlePlanValidityDays
                          : bundlePlanValidity === "weekly"
                          ? 7
                          : 28;
                      await knex
                        .raw(
                          "Call pbx_save_callplanrate(" +
                            null +
                            "," +
                            existCallPlanId +
                            ",'" +
                            attachCallPlanRateList[i]["dial_prefix"] +
                            "'," +
                            attachCallPlanRateList[i]["buying_rate"] +
                            ",\
                                            " +
                            attachCallPlanRateList[i]["selling_rate"] +
                            "," +
                            attachCallPlanRateList[i]["selling_min_duration"] +
                            "," +
                            attachCallPlanRateList[i]["selling_billing_block"] +
                            ",'1', " +
                            attachCallPlanRateList[i]["gateway_id"] +
                            "," +
                            attachCallPlanRateList[i]["phonecode"] +
                            ",'" +
                            attachCallPlanRateList[i]["area_code"] +
                            "','" +
                            attachCallPlanRateList[i]["is_group"] +
                            "'," +
                            attachCallPlanRateList[i]["group_id"] +
                            "," +
                            attachCallPlanRateList[i]["talktime_minutes"] +
                            "," +
                            boosterPlanValidity +
                            ",'" +
                            planType +
                            "','" +
                            callPlanType +
                            "')"
                        )
                        .then((response) => {})
                        .catch((err) => {
                          res.send({
                            code: err.errno,
                            message: err.sqlMessage,
                          });
                        });
                    }
                  }
                })
                .catch((err) => {
                  res
                    .status(401)
                    .send({
                      error: "error",
                      message: "DB Error: " + err.message,
                    });
                  throw err;
                });
            }
          } else {
            res.json({
              code: 400,
              message: "User did not add any call plan rates!",
            });
          }
        });
        if (!response) {
          res.send({
            code: response[0][0][0].MYSQL_SUCCESSNO,
            message: response[0][0][0].MESSAGE_TEXT,
          });
        }
      })
      .catch((err) => {
        res.send({ response: { code: err.errno, message: err.sqlMessage } });
      });
  }
}

function viewExtensionCallMinute(req, res) {
  let data = req.body;
  knex
    .raw("Call pbx_extension_call_minutes(" + data.extension_id + ")")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function viewBoosterPlanHistory(req, res) {
  knex
    .raw("Call pbx_get_booster_plan_history()")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function viewBundleAndRoamingPlanHistory(req, res) {
  knex
    .raw("Call pbx_get_bundle_roaming_plan_history()")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getBoosterPlanHistoryByFilters(req, res) {
  let data = req.body.filters;

  let rangeFrom = data.by_date ? data.by_date[0] : null;
  let rangeTo = data.by_date ? data.by_date[1] : null;
  rangeFrom = rangeFrom
    ? "'" + moment(rangeFrom).format("YYYY-MM-DD") + "'"
    : null;
  rangeTo = rangeTo ? "'" + moment(rangeTo).format("YYYY-MM-DD") + "'" : null;
  data.by_name = data.by_name ? "'" + data.by_name + "'" : null;
  data.by_charge = data.by_charge ? "'" + data.by_charge + "'" : null;
  data.by_validity = data.by_validity ? "'" + data.by_validity + "'" : null;

  knex
    .raw(
      "Call pbx_getBoosterPlanHistoryByFilters(" +
        rangeFrom +
        "," +
        rangeTo +
        "," +
        data.by_name +
        "," +
        data.by_charge +
        "," +
        data.by_validity +
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

function getAllUsersFromMinutePlan(req, res) {
  let planId = parseInt(req.query.id);
  knex
    .raw("Call pbx_getAssociateUserFromPlan(" + planId + ")")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAllUsersFromBoosterMinutePlan(req, res) {
  let planId = parseInt(req.query.id);
  knex
    .raw("Call pbx_getAssociateUserFromBoosterPlan(" + planId + ")")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function deleteMinutePlan(req, res) {
  let minute_plan_id = req.query[Object.keys(req.query)[0]];
  "minute_plan_id", minute_plan_id;
  knex
    .select("f.id")
    .from(table.tbl_PBX_features + " as f")
    .where("f.bundle_plan_id", minute_plan_id)
    .orWhere("f.roaming_plan_id", minute_plan_id)
    .then((response) => {
      if (response.length == 0) {
        let sql = knex(table.tbl_pbx_bundle_plan).where(
          "id",
          "=",
          "" + minute_plan_id + ""
        );
        sql.del();
        sql
          .then((response) => {
            if (response) {
              res.json({
                response: response,
                code: 200,
                message: "You have deleted this minute plan!",
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
      } else {
        res.json({
          // response: response,
          code: 400,
          message: "You can not delete this minute plan!",
        });
      }
    });
}

function deleteBoosterPlan(req, res) {
  let booster_plan_id = req.query[Object.keys(req.query)[0]];
  let sql = knex
    .select("f.id")
    .from(table.tbl_pbx_booster_history + " as f")
    .where("f.booster_id", booster_plan_id);
  sql.then((response) => {
    let sql = knex(table.tbl_pbx_bundle_plan).where(
      "id",
      "=",
      "" + booster_plan_id + ""
    );
    sql.del();
    sql
      .then((response) => {
        if (response) {
          res.json({
            response: response,
            code: 200,
            message: "You have deleted this minute plan!",
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
  });
}

function viewBoosterPlanByType(req, res) {
  let data = req.body;
  knex
    .raw("Call pbx_get_booster_plan_by_type(" + data.type + ")")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function viewCustomerBasedByType(req, res) {
  let data = req.body;
  knex
    .raw("Call pbx_get_customer_by_booster_type(" + data.booster_Type + ")")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getCustomerBoosterPlanByFilters(req, res) {
  let data = req.body.filters;
  data.by_name = data.by_name ? "'" + data.by_name + "'" : null;
  data.by_plan_type = data.by_plan_type ? "'" + data.by_plan_type + "'" : null;
  data.by_validity = data.by_validity ? "'" + data.by_validity + "'" : null;
  knex
    .raw(
      "Call pbx_getCustomerBoosterPlanByFilters(" +
        data.by_plan_type +
        "," +
        data.by_name +
        "," +
        data.by_validity +
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

function getBoosterAssociateRates(req, res) {
  let boosterId = parseInt(req.query.booster_id);
  knex
    .raw("Call pbx_get_booster_mapped_rates(" + boosterId + ")")
    .then((response) => {
      if (response) {
        res.send({ response: response[0][0] });
      }
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function getAllMinutePlanBasedOnPackaedId(req, res) {
  let customerId = parseInt(req.query.id);
  const bundlePromise = knex
    .select(
      "bp.*",
      "cp.name as call_plan_name",
      knex.raw(
        "if(bp.plan_type = '1','Bundle Plan',if(bp.plan_type = '2','Roaming Plan', if(bp.plan_type = '3','Booster Plan','Tele Consultancy'))) as plan_name"
      ),
      knex.raw("GROUP_CONCAT(bpm.bundle_plan_id) as bundle_plan_id"),
      knex.raw("GROUP_CONCAT(bpm.fee_type) as fee_types"),
      knex.raw(
        "GROUP_CONCAT(bpm.charge) as charges, sum(bpm.charge) as extra_fee_total"
      )
    )
    .from(table.tbl_pbx_bundle_plan + " as bp")
    .leftJoin(table.tbl_Call_Plan + " as cp", "bp.call_plan", "cp.id")
    .leftJoin(
      table.tbl_pbx_bundle_plan_extra_fee_map + " as bpm",
      "bpm.bundle_plan_id",
      "bp.id"
    )
    .leftJoin(table.tbl_PBX_features + " as f", "f.bundle_plan_id", "bp.id")
    .leftJoin(table.tbl_Package + " as pckg", "pckg.feature_id", "f.id")
    .leftJoin(
      table.tbl_Map_customer_package + " as mpckg",
      "mpckg.package_id",
      "pckg.id"
    )
    .where("mpckg.customer_id", customerId);

  const roamingPromise = knex
    .select(
      "bp.*",
      "cp.name as call_plan_name",
      knex.raw(
        "if(bp.plan_type = '1','Bundle Plan',if(bp.plan_type = '2','Roaming Plan', if(bp.plan_type = '3','Booster Plan','Tele Consultancy'))) as plan_name"
      ),
      knex.raw("GROUP_CONCAT(bpm.bundle_plan_id) as bundle_plan_id"),
      knex.raw("GROUP_CONCAT(bpm.fee_type) as fee_types"),
      knex.raw(
        "GROUP_CONCAT(bpm.charge) as charges, sum(bpm.charge) as extra_fee_total"
      )
    )
    .from(table.tbl_pbx_bundle_plan + " as bp")
    .leftJoin(table.tbl_Call_Plan + " as cp", "bp.call_plan", "cp.id")
    .leftJoin(
      table.tbl_pbx_bundle_plan_extra_fee_map + " as bpm",
      "bpm.bundle_plan_id",
      "bp.id"
    )
    .leftJoin(table.tbl_PBX_features + " as f", "f.roaming_plan_id", "bp.id")
    .leftJoin(table.tbl_Package + " as pckg", "pckg.feature_id", "f.id")
    .leftJoin(
      table.tbl_Map_customer_package + " as mpckg",
      "mpckg.package_id",
      "pckg.id"
    )
    .where("mpckg.customer_id", customerId);

  const tcPromise = knex
    .select(
      "bp.*",
      "cp.name as call_plan_name",
      knex.raw(
        "if(bp.plan_type = '1','Bundle Plan',if(bp.plan_type = '2','Roaming Plan', if(bp.plan_type = '3','Booster Plan','Tele Consultancy'))) as plan_name"
      ),
      knex.raw("GROUP_CONCAT(bpm.bundle_plan_id) as bundle_plan_id"),
      knex.raw("GROUP_CONCAT(bpm.fee_type) as fee_types"),
      knex.raw(
        "GROUP_CONCAT(bpm.charge) as charges, sum(bpm.charge) as extra_fee_total"
      )
    )
    .from(table.tbl_pbx_bundle_plan + " as bp")
    .leftJoin(table.tbl_Call_Plan + " as cp", "bp.call_plan", "cp.id")
    .leftJoin(
      table.tbl_pbx_bundle_plan_extra_fee_map + " as bpm",
      "bpm.bundle_plan_id",
      "bp.id"
    )
    .leftJoin(
      table.tbl_PBX_features + " as f",
      "f.teleConsultancy_call_plan_id",
      "bp.id"
    )
    .leftJoin(table.tbl_Package + " as pckg", "pckg.feature_id", "f.id")
    .leftJoin(
      table.tbl_Map_customer_package + " as mpckg",
      "mpckg.package_id",
      "pckg.id"
    )
    .where("mpckg.customer_id", customerId);

  Promise.all([bundlePromise, roamingPromise, tcPromise])
    .then((response) => {
      res.json({
        response: response,
      });
    })
    .catch((err) => {
      res.send({ response: { code: err.errno, message: err.sqlMessage } });
    });
}

function minuteAssociatePackage(req, res) {
  let data = req.body;
  let bundleId = data.type == "1" ? data.id : null;
  let roamingId = data.type == "2" ? data.id : null;
  let tcId = data.type == "4" ? data.id : null;
  let sql = knex.raw(
    "call pbx_associate_package(" +
      bundleId +
      "," +
      tcId +
      "," +
      roamingId +
      ")"
  );
  sql.then((response) => {
    if (response) {
      res.send({
        response: response[0][0],
      });
    }
  });
}

module.exports = {
  createBundlePlan,
  viewBundlePlan,
  updateBundlePlan,
  getBundlePlanByFilters,
  viewCustomerBundlePlan,
  viewCustomerRoamingPlan,
  viewCustomerBoosterPlan,
  purchaseBoosterPlanByCustomers,
  viewExtensionCallMinute,
  viewBoosterPlanHistory,
  viewBundleAndRoamingPlanHistory,
  getBoosterPlanHistoryByFilters,
  getAllUsersFromMinutePlan,
  getAllUsersFromBoosterMinutePlan,
  deleteMinutePlan,
  deleteBoosterPlan,
  viewCustomerTeleconsultancyPlan,
  viewBoosterPlanByType,
  viewCustomerBasedByType,
  getCustomerBoosterPlanByFilters,
  getBoosterAssociateRates,
  getMinutePlanForPackageCretion,
  getAllMinutePlanBasedOnPackaedId,
  viewCustomerBundlePlan,
  viewCustomerBundlePlanAllRates,
  minuteAssociatePackage,
};
