const { knex } = require('../config/knex.db');
const table = require('../config/table.macros');

function getAdminUrls(req, res) {
    knex.raw("Call pbx_getAdminUrls()")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function getExtraPermission(req, res) {
    knex.raw("Call pbx_getExtraPermission()")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ code: err.errno, message: err.sqlMessage });
        });
}

function createPermission(req, res) {
    let permissionName = req.body.permission.permission_name;
    let permissionId = req.body.permission.permissionObj;
    let toInsertObj = {};
    let arr = [];

    knex(table.tbl_pbx_permission).insert({ permission_name: "" + permissionName + "" }).then((resp) => {
        let lastInsertedId = resp;
        for (var i = 0; i < permissionId.length; i++) {
            toInsertObj = {
                menu_id: permissionId[i]['id'], permission_id: lastInsertedId, add_permission: permissionId[i]['permission']['add'], modify_permission: permissionId[i]['permission']['modify'], view_permission: permissionId[i]['permission']['view'],
                delete_permission: permissionId[i]['permission']['delete']
            };
            arr.push(toInsertObj);
        }

        knex(table.tbl_pbx_menu_permission).insert(arr).then((response) => {
            res.json({
                response
            });
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    });
}

function updatePermission(req, res) {
    let permissionId = req.body.permission.permissionId;
    let permissionName = req.body.permission.permission_name;
    let menusId = req.body.permission.permissionObj;
    let count = 0;
    for (var i = 0; i < menusId.length; i++) {

        let sql = knex(table.tbl_pbx_menu_permission).update({
            add_permission: menusId[i]['permission']['add'], modify_permission: menusId[i]['permission']['modify'], view_permission: menusId[i]['permission']['view'],
            delete_permission: menusId[i]['permission']['delete']
        })
            .where('permission_id', permissionId).andWhere('menu_id', menusId[i]['id']);
        sql.then((response) => {
            count = 1 + count;
            }).catch((err) => { console.log(err); res.status(400).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
            if((i + 1) == (menusId.length)){

                res.json({
                    response: true
                });

            }
    }

}

function getPermissionList(req, res) {
    knex.raw("Call pbx_get_permissionList(" + req.body.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getPermissionById(req, res) {
    knex.raw("Call pbx_get_permissionById(" + req.body.id + ")")
        .then((response) => {
            if (response) {
                res.send({ response: response[0][0] });
            }
        }).catch((err) => {
            res.send({ response: { code: err.errno, message: err.sqlMessage } });
        });
}

function getPermissionUsers(req, res){
    let id = req.body.id;
    var sql = knex.select('c.id','c.company_name', 'c.first_name', 'c.last_name', 'comp.name as company')
        .from(table.tbl_pbx_user_permission_map + ' as map')
        .leftJoin(table.tbl_Customer + ' as c', 'c.id', 'map.user_id')
        .leftJoin(table.tbl_Company_info + ' as comp', 'comp.id', 'comp.id')
        .where('c.status', '=', "1").andWhere('map.permission_id', '=', "" + id + "");
    sql.then((response) => {
        if (response) {
            res.json({
                response
            });
        } else {
            res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        }
    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });
}

function createExtraPermission(req, res){
    let menu_id = req.body.permission.menu_id.id;
    let permission = req.body.permission.permission;
    let s = knex(table.tbl_extra_permission).insert({ permission_name: "" + permission + "", menu_id: menu_id });
    s.then((resp) => {
        // res.json({
        //     response,""
        // });
        let sql = knex(table.tbl_menu).update({
            is_extra_permission: 1
        })
            .where('id', menu_id);
            sql.then((response) => {
                if (response) {
                    res.json({
                        response
                    });
                } else {
                    res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
                }
            }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

    }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message }); throw err });

}


module.exports = {
    createExtraPermission,getAdminUrls, createPermission, getPermissionList, getPermissionById, updatePermission, getPermissionUsers,getExtraPermission
}
