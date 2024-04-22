const { knex } = require("../config/knex.db");
const table = require("../config/table.macros");

let pushEmail = require("./pushEmail");
const { tbl_Product } = require("../config/table.macros");

// Add SupportGroup
function addsupportGroup(req, res) {
  let body = req.body;
  // console.log(body);
  let id = parseInt(req.query.id);
  let query = knex
    .select("sg.name")
    .from(table.tbl_pbx_support_group + " as sg")
    .where("sg.name", "=", body.name)
    .where("sg.product_id", "=", body.product_id);
  console.log(query.toString());
  query
    .then((response) => {
      // res.json({
      //         response:response,
      //         code:200
      //     });

      if (response.length == 0) {
        let sql = knex(table.tbl_pbx_support_group).insert({
          name: "" + body.name + "",
          product_id: "" + body.product_id + "",
        });
        console.log(sql.toString());
        sql
          .then((response) => {
            if (response.length > 0) {
              res.json({
                response: response,
                code: 200,
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
        res.json({
          response: response,
          code: 201,
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

function getGroupAssignUser(req, res) {
  var body = req.body;
  console.log(JSON.stringify(body));
  let isFilter = Object.keys(body).length == 0 ? false : true;
  let sql = knex
    .from(table.tbl_pbx_support_user_map_support_group + " as ag")
    .select(
      "ag.id as id",
      "cu.username as customer_name",
      "cu.id as support_user_id",
      "sg.name as group_name",
      "sg.id as support_group_id"
    )
    .leftJoin(table.tbl_Customer + " as cu", "cu.id", "ag.support_user_id")
    .leftJoin(
      table.tbl_pbx_support_group + " as sg",
      "sg.id",
      "ag.support_group_id"
    );
  // console.log(isFilter);
  if (isFilter) {
    sql.where("cu.username", "like", "%" + body.name + "%");
  }
  console.log(sql.toString());
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

//show csupport list
function getsupportList(req, res) {
  var body = req.body;
  console.log(JSON.stringify(body));
  let isFilter = Object.keys(body).length == 0 ? false : true;
  let sql = knex
    .from(table.tbl_pbx_support_group + " as sg")
    .select(
      "sg.id as id",
      "sg.name as name",
      "p.id as product_id",
      "p.name as product_name"
    )
    .leftJoin(table.tbl_Product + " as p", "p.id", "sg.product_id")
    .orderBy("sg.id", "desc");

  // console.log(isFilter);
  if (isFilter) {
    sql.where("sg.name", "like", "%" + body.name + "%");
  }
  console.log(sql.toString());
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

//search with id
function getsupportGroupById(req, res) {
  let id = parseInt(req.query.id);
  knex
    .select("s.id", "s.name", "s.product_id")
    .from(table.tbl_pbx_support_group + " as s")
    .where("s.id", "=", id)
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

//update circle
function updatesupportGroup(req, res) {
  let body = req.body.supportData;
  console.log(JSON.stringify(body));

  knex(table.tbl_pbx_support_user_map_support_group)
    .where("support_group_id", "=", "" + body.id + "")
    .then((response) => {
      if (response.length == 0) {
        let query = knex
          .select("sg.name")
          .from(table.tbl_pbx_support_group + " as sg")
          .where("sg.name", "=", body.name)
          .where("sg.product_id", "=", body.product_id)
          .whereNot("sg.id", body.id);
        console.log(query.toString());
        query.then((response) => {
          if (response.length == 0) {
            let sql = knex(table.tbl_pbx_support_group).where(
              "id",
              "=",
              "" + body.id + ""
            );
            delete body.id;
            sql.update(body);
            console.log(sql.toString());
            sql
              .then((response) => {
                res.json({
                  response: response,
                  code: 200,
                  message: "Support Group Updated Successfully !",
                });
              })
              .catch((err) => {
                console.log(err);
                res
                  .status(401)
                  .send({
                    error: "error",
                    message: "DB Error: " + err.message,
                  });
                throw err;
              });
          } else {
            res.json({
              response: "",
              code: 201,
              message: "User can not be part of same group again",
            });
          }
        });
      } else {
        res.json({
          response: response,
          code: 202,
          message: "This group can not be update",
        });
      }
    });
}

//Delete Circle
function deletesupportGroup(req, res) {
  let body = req.body.supportData;
  knex(table.tbl_pbx_support_user_map_support_group)
    .where("support_group_id", "=", "" + body.id + "")
    .then((response) => {
      if (response.length == 0) {
        let sql = knex(table.tbl_pbx_support_group).where(
          "id",
          "=",
          "" + body.id + ""
        );
        sql.del();
        console.log(sql.toString());
        sql
          .then((response) => {
            if (response) {
              res.json({
                response: response,
                code: 200,
              });
            } else {
              res.status(401).send({ error: "error", message: "DB Error" });
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
        res.json({
          response: "",
          code: 202,
          message: "you can't delete this Support Group",
        });
      }
    });
}

function getAllsupportGroup(req, res) {
  let sql = knex.from(table.tbl_pbx_support_group).select("*");
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

// assign group
function assignSupportGroup(req, res) {}

function addassigngroup(req, res) {
  let userList = req.body.contacts;
  let groupId = req.body.group_id;
  const usersToInsert = userList.map((user) => ({
    support_user_id: user,
    support_group_id: groupId,
  }));
  console.log(usersToInsert);
  let sql = knex(table.tbl_pbx_support_user_map_support_group).insert(
    usersToInsert
  );
  sql
    .then((response) => {
      if (response) {
        res.send({
          response: response,
          message: "Add User successfully",
          code: 200,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(200).send({
        code: err.errno,
        error: "error",
        message: "DB Error: " + err.message,
      });
      throw err;
    });
}

function updateassignGroup(req, res) {
  let body = req.body.assignData;
  console.log(JSON.stringify(body));

  let sql = knex(table.tbl_pbx_support_user_map_support_group).where(
    "id",
    "=",
    "" + body.id + ""
  );
  delete body.id;
  sql.update(body);
  console.log(sql.toString());
  sql
    .then((response) => {
      res.json({
        response: response,
        code: 200,
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

function deleteassignGroup(req, res) {
  let body = req.body.assignData;

  let sql = knex(table.tbl_pbx_support_user_map_support_group).where(
    "id",
    "=",
    "" + body.id + ""
  );
  sql.del();
  console.log(sql.toString());
  sql
    .then((response) => {
      if (response) {
        res.json({
          response: response,
          code: 200,
        });
      } else {
        res.status(401).send({ error: "error", message: "DB Error" });
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

function getAllUserFromGroup(req, res) {
  let groupId = parseInt(req.query.id);
  console.log("groupId", groupId);
  let sql = knex
    .select(
      "cgm.support_user_id",
      "contact.first_name",
      "contact.last_name",
      "contact.email",
      "contact.mobile",
      "contact.company_name"
    )
    .from(table.tbl_pbx_support_user_map_support_group + " as cgm")
    .leftJoin(
      table.tbl_Customer + " as contact",
      "contact.id",
      "cgm.support_user_id"
    )
    .where("support_group_id", groupId)
    .andWhere("role_id", "=", "5")
    .whereIn("status", ["1"])
    .orderBy("cgm.id", "desc");
  console.log(sql.toQuery(), "-----------------to query>>>>>>>>>>>>>>>>>>>");
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

function getUserFromGroup(req, res) {
  let groupId = parseInt(req.query.id);
  knex
    .select("*")
    .from(table.tbl_pbx_support_user_map_support_group)
    .where("support_group_id", groupId)
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

function updateSupportGroupWithUsers(req, res) {
  let body = req.body.supportData;
  var groupId = req.body.supportData.id ? req.body.supportData.id : 0;
  console.log(req.body.supportData);
  let query = knex
    .select("sg.name")
    .from(table.tbl_pbx_support_group + " as sg")
    .where("sg.name", "=", body.name)
    .andWhere("sg.product_id", "=", body.product_id)
    .whereNot("sg.id", groupId);
  query.then((response) => {
    console.log(response);
    if (response.length == 0) {
      let sql = knex(table.tbl_pbx_support_group).where(
        "id",
        "=",
        "" + groupId + ""
      );
      delete body.id;
      sql.update({
        name: "" + body.name + "",
        product_id: "" + body.product_id + "",
      });
      sql
        .then((response) => {
          console.log(">>>>>>>>>>>>", response);
          if (response) {
            let sql2 = knex(table.tbl_pbx_support_user_map_support_group).where(
              "support_group_id",
              "=",
              "" + groupId + ""
            );
            sql2.del();
            sql2
              .then((response) => {
                console.log("<<<<<<<<<<<<<<<<<", response);
                if (response) {
                  let usertList = req.body.supportData.contacts;
                  const usersToInsert = usertList.map((user) => ({
                    support_user_id: user,
                    support_group_id: groupId,
                  }));
                  console.log(usersToInsert);
                  let sql3 = knex(
                    table.tbl_pbx_support_user_map_support_group
                  ).insert(usersToInsert);
                  sql3
                    .then((response) => {
                      if (response) {
                        res.send({
                          response: response,
                          message: "Support Group Updated successfully !",
                          code: 200,
                        });
                      }
                    })
                    .catch((err) => {
                      console.log(err);
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
                console.log(err);
                res
                  .status(401)
                  .send({
                    error: "error",
                    message: "DB Error: " + err.message,
                  });
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
    } else {
      res.json({
        response: "",
        code: 201,
        message: "Group name already exist",
      });
    }
  });
}

module.exports = {
  updateassignGroup,
  deleteassignGroup,
  addassigngroup,
  getGroupAssignUser,
  addsupportGroup,
  getsupportList,
  getsupportGroupById,
  updatesupportGroup,
  deletesupportGroup,
  getAllsupportGroup,
  assignSupportGroup,
  getAllUserFromGroup,
  getUserFromGroup,
  updateSupportGroupWithUsers,
};
