var express = require('express');
const cronTest = express();
const { knex } = require('../config/knex.db');
const table = require('../config/table.macros.js');
const cron = require("node-cron");
const config = require('../config/app');
const pushEmail = require('./pushEmail');

// ------------------------------------------------  THIRD CRON JOB IS USE FOR RESET BOOSTER PLAN ---------------------------------------------------------------------------------------  
// ------------------------------------------------  First CRON JOB IS USE FOR all_service_charges(did, minute plan, pstn call charge, sms) PLAN -------------------------------------------  
// ------------------------------------------------  SECOND CRON JOB IS USE FOR CONVERT INVOICE ITEM INTO SINGLE ENTRY THEN FIRED AN INVOICE MAIL TO USER -----------------------------------



cron.schedule("0 01 * * *", function () {  //for every day at 1:00 AM   */25 * * * * * 0 01 * * *
    console.log("running a task every 30 second");
    var now = new Date();
    var n = now.getMonth() - 1;
    var currentDate = now.getDate();
    var months = ['December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var invoice_month = months[++n];
    var current_total_balance  = 0;
    if (currentDate === 1) { // First date of month like : 1 sep/ 1 oct
        knex.from(table.tbl_Customer)
            .select('id', 'email', 'company_name', 'invoice_day','balance')
            .whereIn('role_id', ['1'])
            .andWhere('status', '=', '1')
            .then((response) => {
                for (let i = 0; i < response.length; i++) {
                    current_total_balance = response[i].balance;
                    generate_all_service_charges(response[i].id, response[i].balance, response[i].billing_type);
                }
            });

        const generate_all_service_charges = async (customer_id, current_balance,billing_type ) => {
            var now = new Date();
            var currentDay = parseInt(now.getDate());
            var currentMonth = parseInt(now.getMonth() + 1);
            var currentYear = parseInt(now.getFullYear());
            var previousMonth = parseInt(now.getMonth());
            // var current_total_balance = current_balance;
            // --------------------------------- SMS PLAN MODULE FOR CHARGE TABLE --------------------------------------------
            await knex.select('sms.charge as sms_charge', 'sms.name as sms_name', 'sms.validity as sms_validity', 'c.*', knex.raw('DATE_FORMAT(mcp.sms_active_at, "%m") as sms_activate_month'),
                  knex.raw('DATE_FORMAT(mcp.sms_active_at, "%y") as sms_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,mcp.sms_active_at,NOW()) as expiry_date'))
                .from(table.tbl_Customer + ' as c')
                .leftJoin(table.tbl_Map_customer_package + ' as mcp', 'c.id', 'mcp.customer_id')
                .leftJoin(table.tbl_Package + ' as p', 'p.id', 'mcp.package_id')
                .leftJoin(table.tbl_PBX_features + ' as pf', 'p.feature_id', 'pf.id')
                .leftJoin(table.tbl_pbx_SMS + ' as sms', 'sms.id', 'pf.sms_id')
                .where('c.id', '=', customer_id)
                .then((response) => {
                    let data = response[0] ? response[0] : '';
                    let sms_charge = data ? data.sms_charge : '';
                    let sms_name = data ? data.sms_name : '';
                    let sms_validity = data ? data.sms_validity : '';
                    //  let sms_active_date = data ? data.sms_active_at : new Date();
                    let sms_activate_month = data ? parseInt(data.sms_activate_month) : 0;
                    let sms_activate_year = data ? parseInt(data.sms_activate_year) : 0;
                    let sms_expiry = data ? data.expiry_date > 0 ? true : false : false;

                    if (data['billing_type'] == '2') // check customer billing type Postpaid
                    {
                        if (sms_validity == '1' && sms_expiry) { // Monthly Validity
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: sms_charge,
                                charge_type: "3", description: 'Charge for SMS - ' + sms_name, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                let current_time = new Date();
                                current_time = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                                let sql = knex(table.tbl_Map_customer_package).update({
                                    sms_active_at: "" + current_time + ""
                                }).where('customer_id', '=', "" + customer_id + "")
                                sql.then((response) => {
                                    console.log('customer is postpaid type and insert data into charge table along with updated map_customer_package for sms activated date and charge=' + sms_charge);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        } else if (sms_validity == '2' && currentYear > sms_activate_year && currentMonth > sms_activate_month) {// Yearly Validity
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: sms_charge,
                                charge_type: "3", description: 'Charge for SMS - ' + sms_name, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                let current_time = new Date();
                                current_time = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                                let sql = knex(table.tbl_Map_customer_package).update({
                                    sms_active_at: "" + current_time + ""
                                }).where('customer_id', '=', "" + customer_id + "")
                                sql.then((response) => {
                                    console.log('customer is postpaid type and insert data into charge table along with updated map_customer_package for sms activated date and charge=' + sms_charge);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        } else {
                            console.log('sms have invalid validity type...it should be either monthly and yearly')
                        }
                    } else { // check customer billing type Prepaid billing_type = 1
                        let isCheckCustomerBalance = data ? data['balance'] : 0;
                        if (isCheckCustomerBalance && isCheckCustomerBalance > sms_charge) {  // customer have sufficient balance for next sms invoice
                            if (sms_validity == '1' && sms_expiry) { // Monthly Validity
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: sms_charge,
                                    charge_type: "3", description: 'Charge for SMS - ' + sms_name, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    let current_time = new Date();
                                    current_time = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                                    let sql = knex(table.tbl_Map_customer_package).update({
                                        sms_active_at: "" + current_time + ""
                                    }).where('customer_id', '=', "" + customer_id + "")
                                    sql.then( (response) => {
                                        update_user_current_balance('Charge for SMS',Number(sms_charge), customer_id);
                                        console.log('customer is prepaid type and insert data into charge table along with updated map_customer_package for sms activated date and charge=', sms_charge);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            } else if (sms_validity == '2' && currentYear > sms_activate_year && currentMonth > sms_activate_month) {// Yearly Validity
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: sms_charge,
                                    charge_type: "3", description: 'Charge for SMS - ' + sms_name, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    let current_time = new Date();
                                    current_time = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                                    let sql = knex(table.tbl_Map_customer_package).update({
                                        sms_active_at: "" + current_time + ""
                                    }).where('customer_id', '=', "" + customer_id + "")
                                    sql.then((response) => {
                                         update_user_current_balance('Charge for SMS',Number(sms_charge),customer_id);
                                        console.log('customer is prepaid type and insert data into charge table along with updated map_customer_package for sms activated date and charge=', sms_charge);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            } else {
                                console.log('sms have invalid validity type with prepaid...it should be either monthly and yearly')
                            }
                        } else {  // customer have not sufficient balance for renew sms plan
                            let sql = knex(table.tbl_pbx_sms_api).update({
                                status: "0"
                            }).where('customer_id', '=', "" + customer_id + "")
                            sql.then((response) => {
                                console.log('customer is prepaid type but have not not sufficient balance for renew sms plan thats why i updated status = 0 in pbx_sms_api', response);
                                // ALSO NEED TO FIRE A EMAIL NOTIFICATION FOR THIS PLAN THAT THIS PLAN HAS BEEN STOP....SMTHN SMTHNG
                            }).catch((err) => { console.log(err) });
                        }
                    }
                }).catch((err) => { console.log(err) });

         //------------------------- CALL CHARGES OF PSTN FOR SINGLE ENTRY IN CHARGE TABLE -------------------------------------  
            await knex.from(table.tbl_Customer)
                .select('balance',knex.raw('MONTH(CURRENT_DATE()- INTERVAL 1 MONTH) as month'))
                .where('id', '=', customer_id)
                .then((result) => {
                    if (result[0]['balance'] < 0 ) {
                        cdr_amount = parseFloat(result[0]['balance']).toFixed(2);
                        knex(table.tbl_Charge).insert({
                            did_id: '', customer_id: customer_id, amount: cdr_amount,
                            charge_type: "2", description: 'Charge for Calls (PSTN) :- Month = ' + result[0]['month'], charge_status: 1,
                            invoice_status: 0, product_id: 1
                        }).then((resp) => {
                            console.log('CALL CHARGES OF PSTN for -Neg Balance type');
                            knex.from(table.tbl_Customer)
                                .where('id', '=', customer_id)
                                .update({ balance: 0 })
                                .then((resp) => {
                                    console.log('Set balance zero 0 in customer table');
                                }).catch((err) => { console.log(err) });
                        }).catch((err) => { console.log(err) });
                    }
                }).catch((err) => { console.log(err) });

            //------------------------------- MINUTE PLAN (BP, RP, TC) IN CHARGE TABLE -------------------------------  
            await knex.select('pf.*','c.billing_type')
                .from(table.tbl_Customer + ' as c')
                .leftJoin(table.tbl_Map_customer_package + ' as mcp', 'c.id', 'mcp.customer_id')
                .leftJoin(table.tbl_Package + ' as p', 'p.id', 'mcp.package_id')
                .leftJoin(table.tbl_PBX_features + ' as pf', 'p.feature_id', 'pf.id')
                .where('c.id', '=', customer_id)
                .then((response) => {
                    console.log('--------------- minute ppkak ---------------------------');
                    console.log(response[0]);
                    let data = response[0] ? response[0] : '';
                    let isBundlePlan = data ? parseInt(data['is_bundle_type']) : 0;
                    let bundlePlanId = data ? data['bundle_plan_id'] : 0;
                    let isRoamingPlan = data ? parseInt(data['is_roaming_type']) : 0;
                    let roamingPlanId = data ? data['roaming_plan_id'] : 0;
                    let isTeleconsultPlan = data ? parseInt(data['teleconsultation']) : 0;
                    let teleconsultPlandId = data ? data['teleConsultancy_call_plan_id'] : 0;
                    let customerBillingType = data ? data['billing_type'] : '1';
                    if (isBundlePlan && isRoamingPlan && isTeleconsultPlan) {
                        console.log('--------------- 1 ---------------------------');
                        manage_all_three_minute_plan(bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id, customerBillingType);
                    } else if (isBundlePlan && isRoamingPlan) {
                        console.log('--------------- 2 ---------------------------');
                        manage_bundle_plan_and_roaming_plan(bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id);
                    } else if (isBundlePlan && isTeleconsultPlan) {
                        console.log('--------------- 3 ---------------------------');
                        manage_tc_plan_and_bundle_plan(bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id);
                    } else if (isRoamingPlan && isTeleconsultPlan) {
                        console.log('--------------- 4 ---------------------------');
                        manage_tc_plan_and_roaming_plan(bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id);
                    } else if (isBundlePlan) {
                        console.log('--------------- 5 ---------------------------');
                        manage_bungle_plan(bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id);
                    } else if (isRoamingPlan) {
                        console.log('--------------- 6 ---------------------------');
                        manage_roaming_plan(bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id);
                    } else {
                        console.log('--------------- 7 ---------------------------');
                        manage_tc_plan(bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id);
                    }

                }).catch((err) => { console.log(err) });

            //---------------------------------- DID IN CHARGE TABLE ----------------------------------------------  
            await knex.from(table.tbl_DID)
                .select('id', 'fixrate', 'did')
                .where('customer_id', '=', customer_id).then((response) => {
                    const productId = response['product_id'] ? response['product_id'] : 0;
                    console.log('productId', productId);
                    for (let j = 0; j < response.length; j++) {
                        knex.from(table.tbl_Uses).where('did_id', "" + response[j].id + "")
                            .select(knex.raw('DATE_FORMAT(`reservation_date`, "%m") as month'), 'id')
                            .andWhere('customer_id', "" + customer_id + "")
                            .first()
                            .orderBy('id', 'desc').then((resp) => {
                                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>');
                                console.log(resp);
                                console.log(currentMonth);
                                var did_amount = 0;
                                reservation_month = resp ? parseInt(resp.month) : 0;
                               if(billing_type == '1'){ // check customer billing type Prepaid 
                                if (current_total_balance > response[j].fixrate){  // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    if (response[j].fixrate > 0) {
                                        knex(table.tbl_Charge).insert({
                                            did_id: response[j].id, customer_id: customer_id, amount: response[j].fixrate,
                                            charge_type: "1", description: 'Charge for DID - ' + response[j].did, charge_status: 0,
                                            invoice_status: 0, product_id: 1
                                        }).then((resp) => {
                                            console.log(resp);
                                        }).catch((err) => { console.log(err) });
                                    }
                                     update_user_current_balance('Charge for DID for update current balance',response[j].fixrate,customer_id);
                                }else{ // IF USER HAVE not SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_DID).update({
                                        activated: 0
                                    }).where('id', '=', "" + response[j].id + "")
                                    sql.then((response2) => {
                                        console.log('chages the status of did 1 to 0');
                                        // Fired the email Notification
                                    }).catch((err) => { console.log(err) });
                                }
                               }else{ //check customer billing type Postpaid
                                if (response[j].fixrate > 0 ) {
                                    knex(table.tbl_Charge).insert({
                                        did_id: response[j].id, customer_id: customer_id, amount: response[j].fixrate,
                                        charge_type: "1", description: 'Charge for DID - ' + response[j].did, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        console.log(resp);
                                    }).catch((err) => { console.log(err) });
                                }
                               }
                            }).catch((err) => { console.log(err) });
                    }
                });

            }


     

        const manage_all_three_minute_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id, customerBillingType) => {
            console.log('--------------------->>>>>>>>>>>>>>>.-------------------------------------');
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'), knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'),knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date') )
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
                .where('bp.id', '=', bundlePlanId)
                .limit(1)
                .orderBy('bps.id', 'desc')
                .then(async (response) => {  // For Budle plan
                    if (response[0]) {
                        let data = response[0];
                        let bundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                        extra_fee_charge_type_list.forEach((element1,i) => {
                            extra_fee_charge_list.forEach((element2,j) => {
                               if(i === j && (element1 === '1' || element1 === '2')){
                                bundleCharge = bundleCharge + Number(element2)
                               }
                            });
                        });
                        let minutePlanBundleName = response[0]['name'];
                        let bundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                        let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                        let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                        let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;
      
                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(data.apply_at) : new Date();
                        let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                        let isValidForWeeklPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;
 
                         console.log('bundlePlanValidity',bundlePlanValidity);
                         console.log('isValidForWeeklPlan',isValidForWeeklPlan);
                        if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                     reset_minute_plan_minutes(bundlePlanId);
                                     knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { console.log(err) });
                                    }).catch((err) => { console.log(err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                     reset_minute_plan_minutes(bundlePlanId);
                                     knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge,
                                        charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { console.log(err) });
                                    }).catch((err) => { console.log(err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        }else{
                            return;
                        }
                    }
                }).catch((err) => { console.log(err) });
    
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'),knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date') )
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
                .where('bp.id', '=', roamingPlanId)
                .limit(1)
                .orderBy('bps.id', 'desc')
                .then((response) => {  // For Roaming plan
                    if (response[0]) {
                        let data = response[0];
                        let roamingCharge = response[0]['charge'];
                        let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                        extra_fee_charge_type_list.forEach((element1,i) => {
                            extra_fee_charge_list.forEach((element2,j) => {
                               if(i === j && (element1 === '1' || element1 === '2')){
                                roamingCharge = roamingCharge + Number(element2)
                               }
                            });
                        });
                        let minutePlanRoamingName = response[0]['name'];
                        let roamingPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                        let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                        let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                        let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(data.apply_at) : new Date();
                        let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                        if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                     reset_minute_plan_minutes(bundlePlanId);
                                     knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { console.log(err) });
                                    }).catch((err) => { console.log(err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                     reset_minute_plan_minutes(bundlePlanId);
                                     knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { console.log(err) });
                                    }).catch((err) => { console.log(err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        }else{
                            return;
                        }
                    }
                }).catch((err) => { console.log(err) });
    
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                 knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
                .where('bp.id', '=', teleconsultPlandId)
                .limit(1)
                .orderBy('bps.id', 'desc')
                .then((response) => {  // For TC plan
                    if (response[0]) {
                        let data = response[0];
                        let tcCharge = response[0]['charge'];
                        let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                        extra_fee_charge_type_list.forEach((element1,i) => {
                            extra_fee_charge_list.forEach((element2,j) => {
                               if(i === j && (element1 === '1' || element1 === '2')){
                                tcCharge = tcCharge + Number(element2)
                               }
                            });
                        });
                        let minutePlanTCName = response[0]['name'];
                        let tcPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                        let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                        let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                        let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(data.apply_at) : new Date();
                        let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                        if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                     reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                     reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        }else{
                            return;
                        }
                    }
                }).catch((err) => { console.log(err) });
        }
    
        const manage_bundle_plan_and_roaming_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'),  knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            .from(table.tbl_pbx_bundle_plan + ' as bp')
            .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            .where('bp.id', '=', bundlePlanId)
            .limit(1)
            .orderBy('bps.id', 'desc')
            .then((response) => {  // For Budle plan
                if (response[0]) {
                    let data = response[0];
                    let bundleCharge = Number(response[0]['charge']);
                    let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                    let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                    extra_fee_charge_type_list.forEach((element1,i) => {
                        extra_fee_charge_list.forEach((element2,j) => {
                           if(i === j && (element1 === '1' || element1 === '2')){
                            bundleCharge = bundleCharge + Number(element2)
                           }
                        });
                    });
                    let minutePlanBundleName = response[0]['name'];
                    let bundlePlanValidity = response[0]['validity'];
                    let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                    let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                    let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                    let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;
  
                    let currentDate = new Date();
                    let planApplyDate = data ? new Date(data.apply_at) : new Date();
                    let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                    planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                    customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                    let isValidForWeeklPlan = planApplyDate.getTime() < currentDate.getTime();
                    let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                    let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;
                     console.log('bundlePlanValidity',bundlePlanValidity);
                     console.log('isValidForWeeklPlan',isValidForWeeklPlan);
                    if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge,
                                charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge,
                                charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - yearly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    }else{
                        return;
                    }
                }
            }).catch((err) => { console.log(err) });;

        await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
              knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
              knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
              knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            .from(table.tbl_pbx_bundle_plan + ' as bp')
            .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            .where('bp.id', '=', roamingPlanId)
            .limit(1)
            .orderBy('bps.id', 'desc')
            .then((response) => {  // For Roaming plan
                if (response[0]) {
                    let data = response[0];
                    let roamingCharge = response[0]['charge'];
                    let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                    let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                    extra_fee_charge_type_list.forEach((element1,i) => {
                        extra_fee_charge_list.forEach((element2,j) => {
                           if(i === j && (element1 === '1' || element1 === '2')){
                            roamingCharge = roamingCharge + Number(element2)
                           }
                        });
                    });
                    let minutePlanRoamingName = response[0]['name'];
                    let roamingPlanValidity = response[0]['validity'];
                    let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                    let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                    let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                    let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                    let currentDate = new Date();
                    let planApplyDate = data ? new Date(data.apply_at) : new Date();
                    let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                    planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                    customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                    let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                    let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                    let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                    if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + roamingPlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {// Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: roamingCharge,
                                charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Roaming plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'RP',
                                    subscription_type_id: roamingPlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(roamingPlanId);
                                    console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + roamingPlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {// Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: roamingCharge,
                                charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Roaming plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'RP',
                                    subscription_type_id: roamingPlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(roamingPlanId);
                                    console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    }else{
                        return;
                    }
                }
            }).catch((err) => { console.log(err) });
        }
        
        const manage_tc_plan_and_roaming_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
                .where('bp.id', '=', roamingPlanId)
                .limit(1)
                .orderBy('bps.id', 'desc')
                .then((response) => {  // For Roaming plan
                    if (response[0]) {
                        let data = response[0];
                        let roamingCharge = response[0]['charge'];
                        let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                        extra_fee_charge_type_list.forEach((element1,i) => {
                            extra_fee_charge_list.forEach((element2,j) => {
                               if(i === j && (element1 === '1' || element1 === '2')){
                                roamingCharge = roamingCharge + Number(element2)
                               }
                            });
                        });
                        let minutePlanRoamingName = response[0]['name'];
                        let roamingPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                        let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                        let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                        let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(data.apply_at) : new Date();
                        let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                        if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                     reset_minute_plan_minutes(roamingPlanId);
                                     knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { console.log(err) });
                                    }).catch((err) => { console.log(err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                     reset_minute_plan_minutes(roamingPlanId);
                                     knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { console.log(err) });
                                    }).catch((err) => { console.log(err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        }else{
                            return;
                        }
                    }
                }).catch((err) => { console.log(err) });
    
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
                .where('bp.id', '=', teleconsultPlandId)
                .limit(1)
                .orderBy('bps.id', 'desc')
                .then((response) => {  // For TC plan
                    if (response[0]) {
                        let data = response[0];
                        let tcCharge = response[0]['charge'];
                        let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                        extra_fee_charge_type_list.forEach((element1,i) => {
                            extra_fee_charge_list.forEach((element2,j) => {
                               if(i === j && (element1 === '1' || element1 === '2')){
                                tcCharge = tcCharge + Number(element2)
                               }
                            });
                        });
                        let minutePlanTCName = response[0]['name'];
                        let tcPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                        let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                        let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                        let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(data.apply_at) : new Date();
                        let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                        if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                     reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                     reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        }else{
                            return;
                        }
                    }
                }).catch((err) => { console.log(err) });
          
        }
    
        const manage_tc_plan_and_bundle_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            .from(table.tbl_pbx_bundle_plan + ' as bp')
            .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            .where('bp.id', '=', teleconsultPlandId)
            .limit(1)
            .orderBy('bps.id', 'desc')
            .then((response) => {  // For TC plan
                if (response[0]) {
                    let data = response[0];
                    let tcCharge = response[0]['charge'];
                    let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                    let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                    extra_fee_charge_type_list.forEach((element1,i) => {
                        extra_fee_charge_list.forEach((element2,j) => {
                           if(i === j && (element1 === '1' || element1 === '2')){
                            tcCharge = tcCharge + Number(element2)
                           }
                        });
                    });
                    let minutePlanTCName = response[0]['name'];
                    let tcPlanValidity = response[0]['validity'];
                    let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                    let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                    let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                    let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                    let currentDate = new Date();
                    let planApplyDate = data ? new Date(data.apply_at) : new Date();
                    let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                    planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                    customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                    let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                    let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                    let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                    if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                 reset_minute_plan_minutes(teleconsultPlandId);
                            } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + teleconsultPlandId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else { // Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: tcCharge,
                                charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for TC Plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'TC',
                                    subscription_type_id: teleconsultPlandId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                    console.log('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                 reset_minute_plan_minutes(teleconsultPlandId);
                            } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + teleconsultPlandId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else { // Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: tcCharge,
                                charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for TC Plan - yearly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'TC',
                                    subscription_type_id: teleconsultPlandId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                    console.log('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    }else{
                        return;
                    }
                }
            }).catch((err) => { console.log(err) });
    
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            .from(table.tbl_pbx_bundle_plan + ' as bp')
            .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            .where('bp.id', '=', bundlePlanId)
            .limit(1)
            .orderBy('bps.id', 'desc')
            .then((response) => {  // For Budle plan
                if (response[0]) {
                    let data = response[0];
                    let bundleCharge = Number(response[0]['charge']);
                    let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                    let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                    extra_fee_charge_type_list.forEach((element1,i) => {
                        extra_fee_charge_list.forEach((element2,j) => {
                           if(i === j && (element1 === '1' || element1 === '2')){
                            bundleCharge = bundleCharge + Number(element2)
                           }
                        });
                    });
                    let minutePlanBundleName = response[0]['name'];
                    let bundlePlanValidity = response[0]['validity'];
                    let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                    let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                    let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                    let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;
  
                    let currentDate = new Date();
                    let planApplyDate = data ? new Date(data.apply_at) : new Date();
                    let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                    planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                    customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                    let isValidForWeeklPlan = planApplyDate.getTime() < currentDate.getTime();
                    let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                    let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;
                     console.log('bundlePlanValidity',bundlePlanValidity);
                     console.log('isValidForWeeklPlan',isValidForWeeklPlan);
                    if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge,
                                charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge,
                                charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - yearly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else{
                        return;
                    }
                }
            }).catch((err) => { console.log(err) });
        }
        
        const manage_bungle_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                 knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            .from(table.tbl_pbx_bundle_plan + ' as bp')
            .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            .where('bp.id', '=', bundlePlanId)
            .limit(1)
            .orderBy('bps.id', 'desc')
            .then((response) => {  // For Budle plan
                if (response[0]) {
                    let data = response[0];
                    let bundleCharge = Number(response[0]['charge']);
                    let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                    let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                    extra_fee_charge_type_list.forEach((element1,i) => {
                        extra_fee_charge_list.forEach((element2,j) => {
                           if(i === j && (element1 === '1' || element1 === '2')){
                            bundleCharge = bundleCharge + Number(element2)
                           }
                        });
                    });
                    let minutePlanBundleName = response[0]['name'];
                    let bundlePlanValidity = response[0]['validity'];
                    let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                    let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                    let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                    let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;
  
                    let currentDate = new Date();
                    let planApplyDate = data ? new Date(data.apply_at) : new Date();
                    let customePlanApplyDate = data ? new Date(new Date(data.apply_at)) : new Date();
                    planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                    customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                    let isValidForWeeklPlan = planApplyDate.getTime() < currentDate.getTime();
                    let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                    let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;
                     console.log('bundlePlanValidity',bundlePlanValidity);
                     console.log('isValidForWeeklPlan',isValidForWeeklPlan);
                    if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge,
                                charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge,
                                charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - yearly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else{
                        return;
                    }
                }
            }).catch((err) => { console.log(err) });;
        }
    
        const manage_roaming_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            .from(table.tbl_pbx_bundle_plan + ' as bp')
            .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            .where('bp.id', '=', roamingPlanId)
            .limit(1)
            .orderBy('bps.id', 'desc')
            .then((response) => {  // For Roaming plan
                if (response[0]) {
                    let data = response[0];
                    let roamingCharge = response[0]['charge'];
                    let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                    let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                    extra_fee_charge_type_list.forEach((element1,i) => {
                        extra_fee_charge_list.forEach((element2,j) => {
                           if(i === j && (element1 === '1' || element1 === '2')){
                            roamingCharge = roamingCharge + Number(element2)
                           }
                        });
                    });
                    let minutePlanRoamingName = response[0]['name'];
                    let roamingPlanValidity = response[0]['validity'];
                    let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                    let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                    let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                    let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                    let currentDate = new Date();
                    let planApplyDate = data ? new Date(data.apply_at) : new Date();
                    let customePlanApplyDate = data ? new Date(new Date(data.apply_at)) : new Date();
                    planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                    customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                    let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                    let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                    let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                    if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                 reset_minute_plan_minutes(roamingPlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + roamingPlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {// Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: roamingCharge,
                                charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Roaming plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'RP',
                                    subscription_type_id: roamingPlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(roamingPlanId);
                                    console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(roamingPlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + roamingPlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {// Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: roamingCharge,
                                charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Roaming plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'RP',
                                    subscription_type_id: roamingPlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(roamingPlanId);
                                    console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else{
                        return;
                    }
                }
            }).catch((err) => { console.log(err) });
        }
    
        const manage_tc_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            .from(table.tbl_pbx_bundle_plan + ' as bp')
            .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            .where('bp.id', '=', teleconsultPlandId)
            .limit(1)
            .orderBy('bps.id', 'desc')
            .then((response) => {  // For Budle plan
                if (response[0]) {
                    let data = response[0];
                    let tcCharge = Number(response[0]['charge']); //tcCharge
                    let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                    let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                    extra_fee_charge_type_list.forEach((element1,i) => {
                        extra_fee_charge_list.forEach((element2,j) => {
                           if(i === j && (element1 === '1' || element1 === '2')){
                            tcCharge = tcCharge + Number(element2)
                           }
                        });
                    });
                    let minutePlanBundleName = response[0]['name'];
                    let bundlePlanValidity = response[0]['validity'];
                    let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                    let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                    let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                    let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;
  
                    let currentDate = new Date();
                    let planApplyDate = data ? new Date(data.apply_at) : new Date();
                    let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                    planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                    customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                    let isValidForWeeklPlan = planApplyDate.getTime() < currentDate.getTime();
                    let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                    let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;
                    console.log('bundlePlanValidity',bundlePlanValidity);
                     console.log('isValidForWeeklPlan',isValidForWeeklPlan);
                    if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for tc plan', Number(tcCharge), customer_id);
                                 reset_minute_plan_minutes(teleconsultPlandId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "5", description: 'Payment adjusment for tc Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for tc Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for tc Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + teleconsultPlandId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: tcCharge,
                                charge_type: "5", description: 'Payment adjusment for tc Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for tc Plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: teleconsultPlandId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                    console.log('Payment adjusment for tc Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for tc plan', Number(tcCharge), customer_id);
                                 reset_minute_plan_minutes(teleconsultPlandId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "5", description: 'Payment adjusment for tc Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for tc Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for tc Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + teleconsultPlandId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: tcCharge,
                                charge_type: "5", description: 'Payment adjusment for tc Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for tc Plan - yearly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: teleconsultPlandId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                    console.log('Payment adjusment for tc Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else{
                        return;
                    }
                }
            }).catch((err) => { console.log(err) });
        } //working here 

        const update_user_current_balance = (service_type, service_charge, customer_id) => {
            console.log('current_total_balance',current_total_balance);
            console.log('service_charge',service_charge);
            current_total_balance = current_total_balance - service_charge;
            knex.from(table.tbl_Customer)
            .where('id', '=', customer_id).decrement('balance', service_charge)
            .then((resp) => {
                console.log('Balance has been detected for ',service_type, ' with charge ', service_charge);
            }).catch((err) => { console.log(err) });
        }

        const reset_minute_plan_minutes = (minutePlanId) =>{
            let sql = knex(table.tbl_Call_Plan_Rate).update({
                used_minutes: 0
            }).where('call_plan_id', '=', "" + minutePlanId + "")
            sql.then((response) => {
                console.log('Reset the call rates minute for particular minute plan');
            }).catch((err) => { console.log(err) });
        }
    }else{  // every day in months but not will run at 29,30,31 bcz of validity date should be less than 29
        knex.from(table.tbl_Customer)
        .select('id', 'email', 'company_name', 'invoice_day','balance')
        .whereIn('role_id', ['1'])
        .andWhere('status', '=', '1')
        // .andWhere('id', '=', '1263')
        .then((response) => {
            console.log('----------------------- invoice customers-----------------------');
            console.log(response);
            for (let i = 0; i < response.length; i++) {
                current_total_balance = response[i].balance;
                generate_minute_service_charges(response[i].id, response[i].balance);
            }
        });

        const generate_minute_service_charges = async (customer_id, current_balance) => {
            var now = new Date();
            var currentDay = parseInt(now.getDate());
            var currentMonth = parseInt(now.getMonth() + 1);
            var currentYear = parseInt(now.getFullYear());
            var previousMonth = parseInt(now.getMonth());

             // --------------------------------- SMS PLAN MODULE FOR CHARGE TABLE --------------------------------------------
             await knex.select('sms.charge as sms_charge', 'sms.name as sms_name', 'sms.validity as sms_validity', 'c.*', knex.raw('DATE_FORMAT(mcp.sms_active_at, "%m") as sms_activate_month'),
              knex.raw('DATE_FORMAT(mcp.sms_active_at, "%y") as sms_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,mcp.sms_active_at,NOW()) as expiry_date'))
             .from(table.tbl_Customer + ' as c')
             .leftJoin(table.tbl_Map_customer_package + ' as mcp', 'c.id', 'mcp.customer_id')
             .leftJoin(table.tbl_Package + ' as p', 'p.id', 'mcp.package_id')
             .leftJoin(table.tbl_PBX_features + ' as pf', 'p.feature_id', 'pf.id')
             .leftJoin(table.tbl_pbx_SMS + ' as sms', 'sms.id', 'pf.sms_id')
             .where('c.id', '=', customer_id)
             .then((response) => {
                 let data = response[0] ? response[0] : '';
                 let sms_charge = data ? data.sms_charge : '';
                 let sms_name = data ? data.sms_name : '';
                 let sms_validity = data ? data.sms_validity : '';
                 //  let sms_active_date = data ? data.sms_active_at : new Date();
                 let sms_activate_month = data ? parseInt(data.sms_activate_month) : 0;
                 let sms_activate_year = data ? parseInt(data.sms_activate_year) : 0;
                 let sms_expiry = data ? data.expiry_date > 0 ? true : false : false;

                 if (data['billing_type'] == '2') // check customer billing type Postpaid
                 {
                     if (sms_validity == '1' && sms_expiry) { // Monthly Validity
                         
                         knex(table.tbl_Charge).insert({
                             did_id: '', customer_id: customer_id, amount: sms_charge,
                             charge_type: "3", description: 'Charge for SMS - ' + sms_name, charge_status: 0,
                             invoice_status: 0, product_id: 1
                         }).then((resp) => {
                             let current_time = new Date();
                             current_time = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                             let sql = knex(table.tbl_Map_customer_package).update({
                                 sms_active_at: "" + current_time + ""
                             }).where('customer_id', '=', "" + customer_id + "")
                             sql.then((response) => {
                                 console.log('customer is postpaid type and insert data into charge table along with updated map_customer_package for sms activated date and charge=' + sms_charge);
                             }).catch((err) => { console.log(err) });
                         }).catch((err) => { console.log(err) });
                     } else if (sms_validity == '2' && currentYear > sms_activate_year && currentMonth > sms_activate_month) {// Yearly Validity
                         knex(table.tbl_Charge).insert({
                             did_id: '', customer_id: customer_id, amount: sms_charge,
                             charge_type: "3", description: 'Charge for SMS - ' + sms_name, charge_status: 0,
                             invoice_status: 0, product_id: 1
                         }).then((resp) => {
                             let current_time = new Date();
                             current_time = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                             let sql = knex(table.tbl_Map_customer_package).update({
                                 sms_active_at: "" + current_time + ""
                             }).where('customer_id', '=', "" + customer_id + "")
                             sql.then((response) => {
                                 console.log('customer is postpaid type and insert data into charge table along with updated map_customer_package for sms activated date and charge=' + sms_charge);
                             }).catch((err) => { console.log(err) });
                         }).catch((err) => { console.log(err) });
                     } else {
                         console.log('sms have invalid validity type...it should be either monthly and yearly')
                     }
                 } else { // check customer billing type Prepaid billing_type = 1
                     let isCheckCustomerBalance = data ? data['balance'] : 0;
                     if (isCheckCustomerBalance && isCheckCustomerBalance > sms_charge) {  // customer have sufficient balance for next sms invoice
                         if (sms_validity == '1' && sms_expiry) { // Monthly Validity
                             knex(table.tbl_Charge).insert({
                                 did_id: '', customer_id: customer_id, amount: sms_charge,
                                 charge_type: "3", description: 'Charge for SMS - ' + sms_name, charge_status: 0,
                                 invoice_status: 0, product_id: 1
                             }).then((resp) => {
                                 let current_time = new Date();
                                 current_time = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                                 let sql = knex(table.tbl_Map_customer_package).update({
                                     sms_active_at: "" + current_time + ""
                                 }).where('customer_id', '=', "" + customer_id + "")
                                 sql.then( (response) => {
                                     update_user_current_balance('Charge for SMS',Number(sms_charge), customer_id);
                                     console.log('customer is prepaid type and insert data into charge table along with updated map_customer_package for sms activated date and charge=', sms_charge);
                                 }).catch((err) => { console.log(err) });
                             }).catch((err) => { console.log(err) });
                         } else if (sms_validity == '2' && currentYear > sms_activate_year && currentMonth > sms_activate_month) {// Yearly Validity
                             knex(table.tbl_Charge).insert({
                                 did_id: '', customer_id: customer_id, amount: sms_charge,
                                 charge_type: "3", description: 'Charge for SMS - ' + sms_name, charge_status: 0,
                                 invoice_status: 0, product_id: 1
                             }).then((resp) => {
                                 let current_time = new Date();
                                 current_time = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                                 let sql = knex(table.tbl_Map_customer_package).update({
                                     sms_active_at: "" + current_time + ""
                                 }).where('customer_id', '=', "" + customer_id + "")
                                 sql.then((response) => {
                                      update_user_current_balance('Charge for SMS',Number(sms_charge),customer_id);
                                     console.log('customer is prepaid type and insert data into charge table along with updated map_customer_package for sms activated date and charge=', sms_charge);
                                 }).catch((err) => { console.log(err) });
                             }).catch((err) => { console.log(err) });
                         } else {
                             console.log('sms have invalid validity type with prepaid...it should be either monthly and yearly')
                         }
                     } else {  // customer have not sufficient balance for renew sms plan
                         let sql = knex(table.tbl_pbx_sms_api).update({
                             status: "0"
                         }).where('customer_id', '=', "" + customer_id + "")
                         sql.then((response) => {
                             console.log('customer is prepaid type but have not not sufficient balance for renew sms plan thats why i updated status = 0 in pbx_sms_api', response);
                             // ALSO NEED TO FIRE A EMAIL NOTIFICATION FOR THIS PLAN THAT THIS PLAN HAS BEEN STOP....SMTHN SMTHNG
                         }).catch((err) => { console.log(err) });
                     }
                 }
             }).catch((err) => { console.log(err) });

         //------------------------------- MINUTE PLAN (BP, RP, TC) IN CHARGE TABLE -------------------------------  
            await knex.select('pf.*','c.billing_type')
            .from(table.tbl_Customer + ' as c')
            .leftJoin(table.tbl_Map_customer_package + ' as mcp', 'c.id', 'mcp.customer_id')
            .leftJoin(table.tbl_Package + ' as p', 'p.id', 'mcp.package_id')
            .leftJoin(table.tbl_PBX_features + ' as pf', 'p.feature_id', 'pf.id')
            .where('c.id', '=', customer_id)
            .then((response) => {
                console.log('--------------- minute ppkak ---------------------------');
                console.log(response[0]);
                let data = response[0] ? response[0] : '';
                let isBundlePlan = data ? parseInt(data['is_bundle_type']) : 0;
                let bundlePlanId = data ? data['bundle_plan_id'] : 0;
                let isRoamingPlan = data ? parseInt(data['is_roaming_type']) : 0;
                let roamingPlanId = data ? data['roaming_plan_id'] : 0;
                let isTeleconsultPlan = data ? parseInt(data['teleconsultation']) : 0;
                let teleconsultPlandId = data ? data['teleConsultancy_call_plan_id'] : 0;
                let customerBillingType = data ? data['billing_type'] : '1';
                if (isBundlePlan && isRoamingPlan && isTeleconsultPlan) {
                    console.log('--------------- 1 ---------------------------');
                    manage_all_three_minute_plan(bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id, customerBillingType);
                } else if (isBundlePlan && isRoamingPlan) {
                    console.log('--------------- 2 ---------------------------');
                    manage_bundle_plan_and_roaming_plan(bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id);
                } else if (isBundlePlan && isTeleconsultPlan) {
                    console.log('--------------- 3 ---------------------------');
                    manage_tc_plan_and_bundle_plan(bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id);
                } else if (isRoamingPlan && isTeleconsultPlan) {
                    console.log('--------------- 4 ---------------------------');
                    manage_tc_plan_and_roaming_plan(bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id);
                } else if (isBundlePlan) {
                    console.log('--------------- 5 ---------------------------');
                    manage_bungle_plan(bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id);
                } else if (isRoamingPlan) {
                    console.log('--------------- 6 ---------------------------');
                    manage_roaming_plan(bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id);
                } else {
                    console.log('--------------- 7 ---------------------------');
                    manage_tc_plan(bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id);
                }

            }).catch((err) => { console.log(err) });
        }

        const manage_all_three_minute_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id, customerBillingType) => {
            console.log('--------------------->>>>>>>>>>>>>>>.-------------------------------------');
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
                .where('bp.id', '=', bundlePlanId)
                .limit(1)
                .orderBy('bps.id', 'desc')
                .then((response) => {  // For Budle plan
                    if (response[0]) {
                        let data = response[0];
                        let bundleCharge = Number(response[0]['charge']);
                        let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                        extra_fee_charge_type_list.forEach((element1,i) => {
                            extra_fee_charge_list.forEach((element2,j) => {
                               if(i === j && (element1 === '1' || element1 === '2')){
                                bundleCharge = bundleCharge + Number(element2)
                               }
                            });
                        });
                        let minutePlanBundleName = response[0]['name'];
                        let bundlePlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                        let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                        let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                        let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;
      
                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(data.apply_at) : new Date();
                        let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                        let isValidForWeeklPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;
 
                        if (bundlePlanValidity == 'weekly' && isValidForWeeklPlan) {   //bundle Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                     reset_minute_plan_minutes(bundlePlanId);
                                     knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id :bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { console.log(err) });
                                    }).catch((err) => { console.log(err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then( async (response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id :bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - WEEKLY', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('Payment adjusment for Bundle Plan - WEEKLY with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        } else if (bundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                     reset_minute_plan_minutes(bundlePlanId);
                                     knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id :bundlePlanId,
                                        charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - CUSTOM', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'BP',
                                            subscription_type_id: bundlePlanId
                                        }).then((resp) => {
                                            console.log('Payment adjusment for Bundle Plan - CUSTOM with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { console.log(err) });
                                    }).catch((err) => { console.log(err) });

                                } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + bundlePlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(bundlePlanId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else {
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id :bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        }else if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                           if (customerBillingType == '1') { // Prepaid type customer
                               if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                       did_id: '', customer_id: customer_id, amount: bundleCharge,
                                       charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                       invoice_status: 0, product_id: 1
                                   }).then((resp) => {
                                       console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                       knex(table.tbl_pbx_service_subscription_history).insert({
                                           customer_id: customer_id, subscription_type: 'BP',
                                           subscription_type_id: bundlePlanId
                                       }).then((resp) => {
                                           console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                       }).catch((err) => { console.log(err) });
                                   }).catch((err) => { console.log(err) });

                               } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                   knex(table.tbl_pbx_bundle_plan).update({
                                       status: 0
                                   }).where('id', '=', "" + bundlePlanId + "")
                                       .then((response) => {
                                           reset_minute_plan_minutes(bundlePlanId);
                                           console.log('user minute plan has been removed due of balance', response);
                                           //    Email notification fired.................
                                       }).catch((err) => { console.log(err) });
                               }
                           } else {
                               knex(table.tbl_Charge).insert({
                                   did_id: '', customer_id: customer_id, amount: bundleCharge,
                                   charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                   invoice_status: 0, product_id: 1
                               }).then((resp) => {
                                   console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                   knex(table.tbl_pbx_service_subscription_history).insert({
                                       customer_id: customer_id, subscription_type: 'BP',
                                       subscription_type_id: bundlePlanId
                                   }).then((resp) => {
                                       reset_minute_plan_minutes(bundlePlanId);
                                       console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                   }).catch((err) => { console.log(err) });
                               }).catch((err) => { console.log(err) });
                           }
                       } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                           if (customerBillingType == '1') { // Prepaid type customer
                               if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                    update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                    reset_minute_plan_minutes(bundlePlanId);
                                    knex(table.tbl_Charge).insert({
                                       did_id: '', customer_id: customer_id, amount: bundleCharge,
                                       charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                       invoice_status: 0, product_id: 1
                                   }).then((resp) => {
                                       console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                       knex(table.tbl_pbx_service_subscription_history).insert({
                                           customer_id: customer_id, subscription_type: 'BP',
                                           subscription_type_id: bundlePlanId
                                       }).then((resp) => {
                                           console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                       }).catch((err) => { console.log(err) });
                                   }).catch((err) => { console.log(err) });

                               } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                   knex(table.tbl_pbx_bundle_plan).update({
                                       status: 0
                                   }).where('id', '=', "" + bundlePlanId + "")
                                       .then((response) => {
                                           reset_minute_plan_minutes(bundlePlanId);
                                           console.log('user minute plan has been removed due of balance', response);
                                           //    Email notification fired.................
                                       }).catch((err) => { console.log(err) });
                               }
                           } else {
                               knex(table.tbl_Charge).insert({
                                   did_id: '', customer_id: customer_id, amount: bundleCharge,
                                   charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                   invoice_status: 0, product_id: 1
                               }).then((resp) => {
                                   console.log('Payment adjusment for Bundle Plan - yearly', resp)
                                   knex(table.tbl_pbx_service_subscription_history).insert({
                                       customer_id: customer_id, subscription_type: 'BP',
                                       subscription_type_id: bundlePlanId
                                   }).then((resp) => {
                                       reset_minute_plan_minutes(bundlePlanId);
                                       console.log('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                   }).catch((err) => { console.log(err) });
                               }).catch((err) => { console.log(err) });
                           }
                       }else{
                            console.log('not generated today For Bundle plan', bundlePlanId);
                          return;
                        }
                    }
                }).catch((err) => { console.log(err) });
    
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
                .where('bp.id', '=', roamingPlanId)
                .limit(1)
                .orderBy('bps.id', 'desc')
                .then((response) => {  // For Roaming plan
                    if (response[0]) {
                        let data = response[0];
                        let roamingCharge = response[0]['charge'];
                        let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                        extra_fee_charge_type_list.forEach((element1,i) => {
                            extra_fee_charge_list.forEach((element2,j) => {
                               if(i === j && (element1 === '1' || element1 === '2')){
                                roamingCharge = roamingCharge + Number(element2)
                               }
                            });
                        });
                        let minutePlanRoamingName = response[0]['name'];
                        let roamingPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                        let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                        let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                        let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(data.apply_at) : new Date();
                        let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                        if (roamingPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                     reset_minute_plan_minutes(bundlePlanId);
                                     knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id :roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { console.log(err) });
                                    }).catch((err) => { console.log(err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,ref_id :roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        } else if (roamingPlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                     reset_minute_plan_minutes(bundlePlanId);
                                     knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,ref_id :roamingPlanId,
                                        charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { console.log(err) });
                                    }).catch((err) => { console.log(err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id :roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        } else if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                     reset_minute_plan_minutes(bundlePlanId);
                                     knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { console.log(err) });
                                    }).catch((err) => { console.log(err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                     reset_minute_plan_minutes(bundlePlanId);
                                     knex(table.tbl_Charge).insert({
                                        did_id: '', customer_id: customer_id, amount: roamingCharge,
                                        charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                        invoice_status: 0, product_id: 1
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly', resp)
                                        knex(table.tbl_pbx_service_subscription_history).insert({
                                            customer_id: customer_id, subscription_type: 'RP',
                                            subscription_type_id: roamingPlanId
                                        }).then((resp) => {
                                            console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                        }).catch((err) => { console.log(err) });
                                    }).catch((err) => { console.log(err) });

                                } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + roamingPlanId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(roamingPlanId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else {// Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        } else{
                            console.log('not generated today For Roaming plan = ', roamingPlanId );
                            return;
                        }
                    }
                }).catch((err) => { console.log(err) });
    
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'),  knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
                .from(table.tbl_pbx_bundle_plan + ' as bp')
                .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
                .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
                .where('bp.id', '=', teleconsultPlandId)
                .limit(1)
                .orderBy('bps.id', 'desc')
                .then((response) => {  // For TC plan
                    if (response[0]) {
                        let data = response[0];
                        let tcCharge = response[0]['charge'];
                        let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                        let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                        extra_fee_charge_type_list.forEach((element1,i) => {
                            extra_fee_charge_list.forEach((element2,j) => {
                               if(i === j && (element1 === '1' || element1 === '2')){
                                tcCharge = tcCharge + Number(element2)
                               }
                            });
                        });
                        let minutePlanTCName = response[0]['name'];
                        let tcPlanValidity = response[0]['validity'];
                        let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                        let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                        let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                        let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                        let currentDate = new Date();
                        let planApplyDate = data ? new Date(data.apply_at) : new Date();
                        let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                        planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                        customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                        let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                        let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                        let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                        if (tcPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                     reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id :teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        } else if (tcPlanValidity == 'custom' && isValidForCustomlPlan) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                     reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge, ref_id :teleconsultPlandId,
                                    charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        } else if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                     reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for TC Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                            if (customerBillingType == '1') { // Prepaid type customer
                                if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                     update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                     reset_minute_plan_minutes(teleconsultPlandId);
                                } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                    knex(table.tbl_pbx_bundle_plan).update({
                                        status: 0
                                    }).where('id', '=', "" + teleconsultPlandId + "")
                                        .then((response) => {
                                            reset_minute_plan_minutes(teleconsultPlandId);
                                            console.log('user minute plan has been removed due of balance', response);
                                            //    Email notification fired.................
                                        }).catch((err) => { console.log(err) });
                                }
                            } else { // Postpaid type customer
                                knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: tcCharge,
                                    charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for TC Plan - yearly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'TC',
                                        subscription_type_id: teleconsultPlandId
                                    }).then((resp) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });
                            }
                        }else{
                            console.log('not generated today For tc plan = ', teleconsultPlandId );
                            return;
                        }
                    }
                }).catch((err) => { console.log(err) });
        }
    
        const manage_bundle_plan_and_roaming_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            .from(table.tbl_pbx_bundle_plan + ' as bp')
            .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            .where('bp.id', '=', bundlePlanId)
            .limit(1)
            .orderBy('bps.id', 'desc')
            .then((response) => {  // For Budle plan
                if (response[0]) {
                    let data = response[0];
                    let bundleCharge = Number(response[0]['charge']);
                    let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                    let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                    extra_fee_charge_type_list.forEach((element1,i) => {
                        extra_fee_charge_list.forEach((element2,j) => {
                           if(i === j && (element1 === '1' || element1 === '2')){
                            bundleCharge = bundleCharge + Number(element2)
                           }
                        });
                    });
                    let minutePlanBundleName = response[0]['name'];
                    let bundlePlanValidity = response[0]['validity'];
                    let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                    let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                    let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                    let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;
  
                    let currentDate = new Date();
                    let planApplyDate = data ? new Date(data.apply_at) : new Date();
                    let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                    planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                    customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                    let isValidForWeeklPlan = planApplyDate.getTime() < currentDate.getTime();
                    let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                    let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                     console.log('bundlePlanValidity',bundlePlanValidity);
                     console.log('isValidForWeeklPlan',isValidForWeeklPlan);
                    if (bundlePlanValidity == 'weekly' && isValidForWeeklPlan) {   //bundle Plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id :bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id :bundlePlanId,
                                charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (bundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,ref_id :bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id :bundlePlanId,
                                charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - yearly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    }else if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge,
                                charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge,
                                charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - yearly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    }else{
                        console.log('not generated today For Bundle plan', bundlePlanId);
                          return;
                    }
                }
            }).catch((err) => { console.log(err) });;

        await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
              knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
              knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
              knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            .from(table.tbl_pbx_bundle_plan + ' as bp')
            .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            .where('bp.id', '=', roamingPlanId)
            .limit(1)
            .orderBy('bps.id', 'desc')
            .then((response) => {  // For Roaming plan
                if (response[0]) {
                    let data = response[0];
                    let roamingCharge = response[0]['charge'];
                    let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                    let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                    extra_fee_charge_type_list.forEach((element1,i) => {
                        extra_fee_charge_list.forEach((element2,j) => {
                           if(i === j && (element1 === '1' || element1 === '2')){
                            roamingCharge = roamingCharge + Number(element2)
                           }
                        });
                    });
                    let minutePlanRoamingName = response[0]['name'];
                    let roamingPlanValidity = response[0]['validity'];
                    let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                    let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                    let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                    let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                    let currentDate = new Date();
                    let planApplyDate = data ? new Date(data.apply_at) : new Date();
                    let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                    planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                    customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                    let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                    let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                    let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                    if (roamingPlanValidity ==  'weekly' && isValidForWeeklyPlan) {   //Roaming plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id :roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + roamingPlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {// Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: roamingCharge,ref_id :roamingPlanId,
                                charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Roaming plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'RP',
                                    subscription_type_id: roamingPlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(roamingPlanId);
                                    console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (roamingPlanValidity == 'custom' && isValidForCustomlPlan) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for roaming plan', Number(roamingCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,ref_id :roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + roamingPlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {// Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id :roamingPlanId,
                                charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Roaming plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'RP',
                                    subscription_type_id: roamingPlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(roamingPlanId);
                                    console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + roamingPlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {// Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: roamingCharge,
                                charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Roaming plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'RP',
                                    subscription_type_id: roamingPlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(roamingPlanId);
                                    console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + roamingPlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {// Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: roamingCharge,
                                charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Roaming plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'RP',
                                    subscription_type_id: roamingPlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(roamingPlanId);
                                    console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    }else{
                        console.log('not generated today For Roaming plan', bundlePlanId);
                        return;
                    }
                }
            }).catch((err) => { console.log(err) });
        }
        
        const manage_tc_plan_and_roaming_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            .from(table.tbl_pbx_bundle_plan + ' as bp')
            .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            .where('bp.id', '=', roamingPlanId)
            .limit(1)
            .orderBy('bps.id', 'desc')
            .then((response) => {  // For Roaming plan
                if (response[0]) {
                    let data = response[0];
                    let roamingCharge = response[0]['charge'];
                    let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                    let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                    extra_fee_charge_type_list.forEach((element1,i) => {
                        extra_fee_charge_list.forEach((element2,j) => {
                           if(i === j && (element1 === '1' || element1 === '2')){
                            roamingCharge = roamingCharge + Number(element2)
                           }
                        });
                    });
                    let minutePlanRoamingName = response[0]['name'];
                    let roamingPlanValidity = response[0]['validity'];
                    let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                    let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                    let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                    let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                    let currentDate = new Date();
                    let planApplyDate = data ? new Date(data.apply_at) : new Date();
                    let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                    planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                    customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                    let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                    let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                    let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                    if (roamingPlanValidity ==  'weekly' && isValidForWeeklyPlan) {   //Roaming plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                 reset_minute_plan_minutes(roamingPlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id :roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + roamingPlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {// Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id :roamingPlanId,
                                charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Roaming plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'RP',
                                    subscription_type_id: roamingPlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(roamingPlanId);
                                    console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (roamingPlanValidity == 'custom' && isValidForCustomlPlan) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for roaming plan', Number(roamingCharge), customer_id);
                                 reset_minute_plan_minutes(roamingPlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id :roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + roamingPlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {// Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id :roamingPlanId,
                                charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Roaming plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'RP',
                                    subscription_type_id: roamingPlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(roamingPlanId);
                                    console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                 reset_minute_plan_minutes(roamingPlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + roamingPlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {// Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: roamingCharge,
                                charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Roaming plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'RP',
                                    subscription_type_id: roamingPlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(roamingPlanId);
                                    console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(roamingPlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + roamingPlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {// Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: roamingCharge,
                                charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Roaming plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'RP',
                                    subscription_type_id: roamingPlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(roamingPlanId);
                                    console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else{
                        console.log('not generated today For Roaming plan', roamingPlanId);
                        return;
                    }
                }
            }).catch((err) => { console.log(err) });
    
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            .from(table.tbl_pbx_bundle_plan + ' as bp')
            .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            .where('bp.id', '=', teleconsultPlandId)
            .limit(1)
            .orderBy('bps.id', 'desc')
            .then((response) => {  // For TC plan
                if (response[0]) {
                    let data = response[0];
                    let tcCharge = response[0]['charge'];
                    let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                    let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                    extra_fee_charge_type_list.forEach((element1,i) => {
                        extra_fee_charge_list.forEach((element2,j) => {
                           if(i === j && (element1 === '1' || element1 === '2')){
                            tcCharge = tcCharge + Number(element2)
                           }
                        });
                    });
                    let minutePlanTCName = response[0]['name'];
                    let tcPlanValidity = response[0]['validity'];
                    let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                    let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                    let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                    let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                    let currentDate = new Date();
                    let planApplyDate = data ? new Date(data.apply_at) : new Date();
                    let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                    planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                    customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                    let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                    let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                    let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                    if (tcPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //TC Plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                 reset_minute_plan_minutes(teleconsultPlandId);
                            } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + teleconsultPlandId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else { // Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: tcCharge, ref_id :teleconsultPlandId,
                                charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for TC Plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'TC',
                                    subscription_type_id: teleconsultPlandId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                    console.log('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (tcPlanValidity == 'custom' && isValidForCustomlPlan) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                 reset_minute_plan_minutes(teleconsultPlandId);
                            } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + teleconsultPlandId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else { // Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: tcCharge, ref_id :teleconsultPlandId,
                                charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for TC Plan - yearly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'TC',
                                    subscription_type_id: teleconsultPlandId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                    console.log('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                 reset_minute_plan_minutes(teleconsultPlandId);
                            } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + teleconsultPlandId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else { // Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: tcCharge,
                                charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for TC Plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'TC',
                                    subscription_type_id: teleconsultPlandId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                    console.log('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                 reset_minute_plan_minutes(teleconsultPlandId);
                            } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + teleconsultPlandId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else { // Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: tcCharge,
                                charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for TC Plan - yearly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'TC',
                                    subscription_type_id: teleconsultPlandId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                    console.log('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    }else{
                        console.log('not generated today For tc plan = ', teleconsultPlandId );
                        return;
                    }
                }
            }).catch((err) => { console.log(err) });
          
        }
    
        const manage_tc_plan_and_bundle_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            .from(table.tbl_pbx_bundle_plan + ' as bp')
            .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            .where('bp.id', '=', teleconsultPlandId)
            .limit(1)
            .orderBy('bps.id', 'desc')
            .then((response) => {  // For TC plan
                if (response[0]) {
                    let data = response[0];
                    let tcCharge = response[0]['charge'];
                    let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                    let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                    extra_fee_charge_type_list.forEach((element1,i) => {
                        extra_fee_charge_list.forEach((element2,j) => {
                           if(i === j && (element1 === '1' || element1 === '2')){
                            tcCharge = tcCharge + Number(element2)
                           }
                        });
                    });
                    let minutePlanTCName = response[0]['name'];
                    let tcPlanValidity = response[0]['validity'];
                    let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                    let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                    let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                    let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                    let currentDate = new Date();
                    let planApplyDate = data ? new Date(data.apply_at) : new Date();
                    let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                    planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                    customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                    let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                    let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                    let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                    if (tcPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //TC Plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                 reset_minute_plan_minutes(teleconsultPlandId);
                            } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + teleconsultPlandId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else { // Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: tcCharge, ref_id :teleconsultPlandId,
                                charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for TC Plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'TC',
                                    subscription_type_id: teleconsultPlandId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                    console.log('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (tcPlanValidity == 'custom' && isValidForCustomlPlan) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                 reset_minute_plan_minutes(teleconsultPlandId);
                            } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + teleconsultPlandId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else { // Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: tcCharge, ref_id :teleconsultPlandId,
                                charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for TC Plan - yearly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'TC',
                                    subscription_type_id: teleconsultPlandId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                    console.log('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                 reset_minute_plan_minutes(teleconsultPlandId);
                            } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + teleconsultPlandId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else { // Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: tcCharge,
                                charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for TC Plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'TC',
                                    subscription_type_id: teleconsultPlandId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                    console.log('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                 reset_minute_plan_minutes(teleconsultPlandId);
                            } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + teleconsultPlandId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else { // Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: tcCharge,
                                charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for TC Plan - yearly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'TC',
                                    subscription_type_id: teleconsultPlandId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                    console.log('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else{
                        console.log('not generated today For tc plan = ', teleconsultPlandId );
                        return;
                    }
                }
            }).catch((err) => { console.log(err) });
    
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'), knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            .from(table.tbl_pbx_bundle_plan + ' as bp')
            .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            .where('bp.id', '=', bundlePlanId)
            .limit(1)
            .orderBy('bps.id', 'desc')
            .then((response) => {  // For Budle plan
                if (response[0]) {
                    let data = response[0];
                    let bundleCharge = Number(response[0]['charge']);
                    let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                    let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                    extra_fee_charge_type_list.forEach((element1,i) => {
                        extra_fee_charge_list.forEach((element2,j) => {
                           if(i === j && (element1 === '1' || element1 === '2')){
                            bundleCharge = bundleCharge + Number(element2)
                           }
                        });
                    });
                    let minutePlanBundleName = response[0]['name'];
                    let bundlePlanValidity = response[0]['validity'];
                    let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                    let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                    let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                    let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;
  
                    let currentDate = new Date();
                    let planApplyDate = data ? new Date(data.apply_at) : new Date();
                    let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                    planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                    customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                    let isValidForWeeklPlan = planApplyDate.getTime() < currentDate.getTime();
                    let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                    let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                     console.log('bundlePlanValidity',bundlePlanValidity);
                     console.log('isValidForWeeklPlan',isValidForWeeklPlan);
                    if (bundlePlanValidity == 'weekly' && isValidForWeeklPlan) {   //bundle Plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge, ref_id :bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge,  ref_id :bundlePlanId,
                                charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (bundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,  ref_id :bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge,  ref_id :bundlePlanId,
                                charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - yearly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge,
                                charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge,
                                charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - yearly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else{
                        console.log('not generated today For Bundle plan', bundlePlanId);
                          return;
                    }
                }
            }).catch((err) => { console.log(err) });;
        }
        
        const manage_bungle_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'), 
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'),  knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            .from(table.tbl_pbx_bundle_plan + ' as bp')
            .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            .where('bp.id', '=', bundlePlanId)
            .limit(1)
            .orderBy('bps.id', 'desc')
            .then((response) => {  // For Budle plan
                if (response[0]) {
                    let data = response[0];
                    let bundleCharge = Number(response[0]['charge']);
                    let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                    let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                    extra_fee_charge_type_list.forEach((element1,i) => {
                        extra_fee_charge_list.forEach((element2,j) => {
                           if(i === j && (element1 === '1' || element1 === '2')){
                            bundleCharge = bundleCharge + Number(element2)
                           }
                        });
                    });
                    console.log('new bundleCharge', bundleCharge);
                    let minutePlanBundleName = response[0]['name'];
                    let bundlePlanValidity = response[0]['validity'];
                    let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                    let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                    let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                    let bundlePlanValidityDays = data ? parseInt(data.number_of_days) : 0;
  
                    let currentDate = new Date();
                    let planApplyDate = data ? new Date(data.apply_at) : new Date();
                    let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                    planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                    customePlanApplyDate.setDate(customePlanApplyDate.getDate() + bundlePlanValidityDays);
                    let isValidForWeeklPlan = planApplyDate.getTime() < currentDate.getTime();
                    let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                    let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                     console.log('bundlePlanValidity',bundlePlanValidity);
                     console.log('isValidForWeeklPlan',isValidForWeeklPlan);
                    if (bundlePlanValidity == 'weekly' && isValidForWeeklPlan) {   //bundle Plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,  ref_id :bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge,  ref_id :bundlePlanId,
                                charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (bundlePlanValidity == 'custom' && isValidForCustomlPlan) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,  ref_id :bundlePlanId,
                                    charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge,  ref_id :bundlePlanId,
                                charge_type: "5", description: 'Charges for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - yearly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (bundlePlanValidity == 'monthly' && plan_expiry) {   //bundle Plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge,
                                charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (bundlePlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > bundleCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(bundlePlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: bundleCharge,
                                    charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Bundle Plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'BP',
                                        subscription_type_id: bundlePlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Bundle Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else {  // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + bundlePlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(bundlePlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: bundleCharge,
                                charge_type: "5", description: 'Payment adjusment for Bundle Plan -' + minutePlanBundleName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Bundle Plan - yearly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'BP',
                                    subscription_type_id: bundlePlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(bundlePlanId);
                                    console.log('Payment adjusment for Bundle Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else{
                        console.log('not generated today For Bundle plan', bundlePlanId);
                          return;
                    }
                }
            }).catch((err) => { console.log(err) });;
        }
    
        const manage_roaming_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'),  knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            .from(table.tbl_pbx_bundle_plan + ' as bp')
            .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            .where('bp.id', '=', roamingPlanId)
            .limit(1)
            .orderBy('bps.id', 'desc')
            .then((response) => {  // For Roaming plan
                if (response[0]) {
                    let data = response[0];
                    let roamingCharge = response[0]['charge'];
                    let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                    let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                    extra_fee_charge_type_list.forEach((element1,i) => {
                        extra_fee_charge_list.forEach((element2,j) => {
                           if(i === j && (element1 === '1' || element1 === '2')){
                            roamingCharge = roamingCharge + Number(element2)
                           }
                        });
                    });
                    let minutePlanRoamingName = response[0]['name'];
                    let roamingPlanValidity = response[0]['validity'];
                    let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                    let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                    let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                    let roamingPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                    let currentDate = new Date();
                    let planApplyDate = data ? new Date(data.apply_at) : new Date();
                    let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                    planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                    customePlanApplyDate.setDate(customePlanApplyDate.getDate() + roamingPlanValidityDays);
                    let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                    let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                    let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                    if (roamingPlanValidity ==  'weekly' && isValidForWeeklyPlan) {   //Roaming plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                 reset_minute_plan_minutes(roamingPlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,  ref_id :roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + roamingPlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {// Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id :roamingPlanId,
                                charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Roaming plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'RP',
                                    subscription_type_id: roamingPlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(roamingPlanId);
                                    console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (roamingPlanValidity == 'custom' && isValidForCustomlPlan) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for roaming plan', Number(roamingCharge), customer_id);
                                 reset_minute_plan_minutes(roamingPlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge, ref_id :roamingPlanId,
                                    charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + roamingPlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {// Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: roamingCharge,  ref_id :roamingPlanId,
                                charge_type: "6", description: 'Charges for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Roaming plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'RP',
                                    subscription_type_id: roamingPlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(roamingPlanId);
                                    console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (roamingPlanValidity == 'monthly' && plan_expiry) {   //Roaming plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Roaming plan', Number(roamingCharge), customer_id);
                                 reset_minute_plan_minutes(roamingPlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + roamingPlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {// Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: roamingCharge,
                                charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Roaming plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'RP',
                                    subscription_type_id: roamingPlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(roamingPlanId);
                                    console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (roamingPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > roamingCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for Bundle plan', Number(bundleCharge), customer_id);
                                 reset_minute_plan_minutes(roamingPlanId);
                                 knex(table.tbl_Charge).insert({
                                    did_id: '', customer_id: customer_id, amount: roamingCharge,
                                    charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                    invoice_status: 0, product_id: 1
                                }).then((resp) => {
                                    console.log('Payment adjusment for Roaming plan - monthly', resp)
                                    knex(table.tbl_pbx_service_subscription_history).insert({
                                        customer_id: customer_id, subscription_type: 'RP',
                                        subscription_type_id: roamingPlanId
                                    }).then((resp) => {
                                        console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                    }).catch((err) => { console.log(err) });
                                }).catch((err) => { console.log(err) });

                            } else { // IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + roamingPlanId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(roamingPlanId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else {// Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: roamingCharge,
                                charge_type: "6", description: 'Payment adjusment for Roaming Plan -' + minutePlanRoamingName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for Roaming plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'RP',
                                    subscription_type_id: roamingPlanId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(roamingPlanId);
                                    console.log('Payment adjusment for Roaming plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else{
                        console.log('not generated today For Roaming plan', roamingPlanId);
                        return;
                    }
                }
            }).catch((err) => { console.log(err) });
        }
    
        const manage_tc_plan = async (bundlePlanId, roamingPlanId, teleconsultPlandId, currentDay, currentMonth, currentYear, customer_id) => {
            await knex.select('bp.charge', 'bp.name', 'bp.validity', 'bp.number_of_days', 'bps.apply_at', knex.raw('DATE_FORMAT(bps.apply_at, "%d") as plan_activate_day'), knex.raw('DATE_FORMAT(bps.apply_at, "%m") as plan_activate_month'),
                  knex.raw('GROUP_CONCAT(bpm.charge) as extra_fee_charge'),
                  knex.raw('GROUP_CONCAT(bpm.fee_type) as extra_fee_charge_type'),
                  knex.raw('DATE_FORMAT(bps.apply_at, "%y") as plan_activate_year'),  knex.raw('TIMESTAMPDIFF(MONTH,bps.apply_at,NOW()) as expiry_date'))
            .from(table.tbl_pbx_bundle_plan + ' as bp')
            .leftJoin(table.tbl_pbx_service_subscription_history + ' as bps', 'bps.subscription_type_id', 'bp.id')
            .leftJoin(table.tbl_pbx_bundle_plan_extra_fee_map + ' as bpm', 'bpm.bundle_plan_id', 'bp.id')
            .where('bp.id', '=', teleconsultPlandId)
            .limit(1)
            .orderBy('bps.id', 'desc')
            .then((response) => {  // For TC plan
                if (response[0]) {
                    let data = response[0];
                    let tcCharge = response[0]['charge'];
                    let extra_fee_charge_list  = response[0]['extra_fee_charge'] ? (response[0]['extra_fee_charge']).split([',']) : [];
                    let extra_fee_charge_type_list = response[0]['extra_fee_charge_type'] ? (response[0]['extra_fee_charge_type']).split([',']): [];
                    extra_fee_charge_type_list.forEach((element1,i) => {
                        extra_fee_charge_list.forEach((element2,j) => {
                           if(i === j && (element1 === '1' || element1 === '2')){
                            tcCharge = tcCharge + Number(element2)
                           }
                        });
                    });
                    let minutePlanTCName = response[0]['name'];
                    let tcPlanValidity = response[0]['validity'];
                    let plan_activate_day = data ? parseInt(data.plan_activate_day) + 6 : 0;
                    let plan_activate_month = data ? parseInt(data.plan_activate_month) : 0;
                    let plan_activate_year = data ? parseInt(data.plan_activate_year) : 0;
                    let tcPlanValidityDays = data ? parseInt(data.number_of_days) : 0;

                    let currentDate = new Date();
                    let planApplyDate = data ? new Date(data.apply_at) : new Date();
                    let customePlanApplyDate = data ? new Date(data.apply_at) : new Date();
                    planApplyDate.setDate(planApplyDate.getDate() + 6);  // ITS NEXT 7 DAYS DATE FOR WEEKLY PLAN
                    customePlanApplyDate.setDate(customePlanApplyDate.getDate() + tcPlanValidityDays);
                    let isValidForWeeklyPlan = planApplyDate.getTime() < currentDate.getTime();
                    let isValidForCustomlPlan = customePlanApplyDate.getTime() < currentDate.getTime();
                    let plan_expiry = data ? data.expiry_date > 0 ? true : false : false;

                    if (tcPlanValidity == 'weekly' && isValidForWeeklyPlan) {   //TC Plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                 reset_minute_plan_minutes(teleconsultPlandId);
                            } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + teleconsultPlandId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else { // Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: tcCharge, ref_id :teleconsultPlandId,
                                charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for TC Plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'TC',
                                    subscription_type_id: teleconsultPlandId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                    console.log('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (tcPlanValidity == 'custom' && isValidForCustomlPlan) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                 reset_minute_plan_minutes(teleconsultPlandId);
                            } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + teleconsultPlandId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else { // Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: tcCharge,ref_id :teleconsultPlandId,
                                charge_type: "7", description: 'Charges for TC Plan -' + minutePlanTCName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for TC Plan - yearly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'TC',
                                    subscription_type_id: teleconsultPlandId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                    console.log('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (tcPlanValidity == 'monthly' && plan_expiry) {   //TC Plan Validity Monthly
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                 reset_minute_plan_minutes(teleconsultPlandId);
                            } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + teleconsultPlandId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else { // Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: tcCharge,
                                charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for TC Plan - monthly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'TC',
                                    subscription_type_id: teleconsultPlandId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                    console.log('Payment adjusment for TC Plan - monthly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else if (tcPlanValidity == 'yearly' && currentYear > plan_activate_year && currentMonth > plan_activate_month) {
                        if (customerBillingType == '1') { // Prepaid type customer
                            if (current_total_balance > tcCharge) {   // IF USER HAVE SUFFICIENT BALANCE FOR PURCHASE IT.
                                 update_user_current_balance('Charge for TC plan', Number(tcCharge), customer_id);
                                 reset_minute_plan_minutes(teleconsultPlandId);
                            } else {// IF USER HAVE NOT SUFFICIENT BALANCE FOR PURCHASE IT.
                                knex(table.tbl_pbx_bundle_plan).update({
                                    status: 0
                                }).where('id', '=', "" + teleconsultPlandId + "")
                                    .then((response) => {
                                        reset_minute_plan_minutes(teleconsultPlandId);
                                        console.log('user minute plan has been removed due of balance', response);
                                        //    Email notification fired.................
                                    }).catch((err) => { console.log(err) });
                            }
                        } else { // Postpaid type customer
                            knex(table.tbl_Charge).insert({
                                did_id: '', customer_id: customer_id, amount: tcCharge,
                                charge_type: "7", description: 'Payment adjusment for TC Plan -' + minutePlanTCName, charge_status: 0,
                                invoice_status: 0, product_id: 1
                            }).then((resp) => {
                                console.log('Payment adjusment for TC Plan - yearly', resp)
                                knex(table.tbl_pbx_service_subscription_history).insert({
                                    customer_id: customer_id, subscription_type: 'TC',
                                    subscription_type_id: teleconsultPlandId
                                }).then((resp) => {
                                    reset_minute_plan_minutes(teleconsultPlandId);
                                    console.log('Payment adjusment for TC Plan - yearly with insert new entry in tbl_pbx_service_subscription_history', resp);
                                }).catch((err) => { console.log(err) });
                            }).catch((err) => { console.log(err) });
                        }
                    } else{
                        console.log('not generated today For tc plan = ', teleconsultPlandId );
                        return;
                    }
                }
            }).catch((err) => { console.log(err) });
        } 

        const update_user_current_balance = (service_type, service_charge, customer_id) => {
            console.log('current_total_balance',current_total_balance);
            console.log('service_charge',service_charge);
            current_total_balance = current_total_balance - service_charge;
            knex.from(table.tbl_Customer)
            .where('id', '=', customer_id).decrement('balance', service_charge)
            .then((resp) => {
                console.log('Balance has been detected for ',service_type, ' with charge ', service_charge);
            }).catch((err) => { console.log(err) });
        }

        const reset_minute_plan_minutes = (minutePlanId) =>{
            let sql = knex(table.tbl_Call_Plan_Rate).update({
                used_minutes: 0
            }).where('call_plan_id', '=', "" + minutePlanId + "")
            sql.then((response) => {
                console.log('Reset the call rates minute for particular minute plan');
            }).catch((err) => { console.log(err) });
        }
    }

});   


cron.schedule("0 03 * * *", function () {  //for every day at 3:00 AM   0 03 * * *  */25 * * * * *
    console.log("running a task every day at 3 AM");
    var now = new Date();
    var n = now.getMonth() - 1;
    var currentDate = now.getDate();
    var months = ['December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var invoice_month = months[++n];
    var current_total_balance = 0;
    let query = knex.from(table.tbl_Customer)
        .select('id', 'email', 'company_name', 'invoice_day', 'balance','advance_payment','created_by')
        .where('invoice_day', currentDate)
        .andWhere('status', '=', '1');
        // console.log(query.toString());
        query.then((response) => {
            // console.log('customer of invoice',response);
            for (let i = 0; i < response.length; i++) {
                
                current_total_balance = response[i].balance;
                //unique Invoice number     
                var numbs = "1234567890";
                var number_lehgth = 6;
                var randomNum = '';
                for (var k = 0; k < number_lehgth; k++) {
                    var rnum = Math.floor(Math.random() * numbs.length);
                    randomNum += numbs.substring(rnum, rnum + 1);
                }
                let InvoiceNumberDisplay = randomNum;
                let sql = knex(table.tbl_Pbx_Invoice).insert({
                    reference_num: '' + InvoiceNumberDisplay + '', customer_id: response[i].id,
                });
                console.log("insert invoice ", sql.toString());
                sql.then((resp) => {
                    console.log('invID', resp);
                    let invoiceId = resp;
                    let sql = knex.from(table.tbl_Charge + ' as c')
                        .select('c.*',knex.raw('DATE_FORMAT(c.created_at, "%d") as did_activate_day'))
                        .where('customer_id', response[i].id)
                        .andWhere('charge_status',0)
                        .andWhere('invoice_status',0);
                        console.log(sql.toString());
                        sql.then( async (response2) => {
                            // console.log('customer of charge',response2);
                            let allTypeChargeData = response2;
                            let didRegularCount = 0 ; //DID
                            let didRegularTotalRate = 0;  //DID
                            let didRetroCount = 0; // DID -RETRO
                            let SMSCount = 0;  //SMS
                            let SMSTotalRate = 0;  //SMS
                            let PSTNCount = 0;  //PSTN
                            let PSTNTotalRate = 0;  // PSTN
                            let boosterCount = 0;  // booster
                            let boosterTotalRate = 0; // booster
                            let bundleCount = 0;  // BUNDLE
                            let bundleTotalRate = 0; // BUNDLE
                            let roamingCount = 0;  // ROAMING
                            let roamingTotalRate = 0;  // ROAMING
                            let TCCount = 0;  // TC
                            let TCTotalRate = 0;  //TC
                            let SIPTotalRate = 0; //SIP
                            let SIPCount = 0; //SIP
                            let feature = '';

                           
                            for (let j = 0; j < allTypeChargeData.length; j++) {
                                console.log("---------------alltypeChargeDataaaa-----------------------",allTypeChargeData);
                                if (allTypeChargeData[j]['charge_type'] == '1' && allTypeChargeData[j]['did_activate_day'] == 1) { // DID
                                    didRegularCount++;
                                    didRegularTotalRate = didRegularTotalRate + allTypeChargeData[j]['amount'];
                                }else if(allTypeChargeData[j]['charge_type'] == '1' && allTypeChargeData[j]['did_activate_day'] != 1){ // DID RETRO
                                    didRetroCount++;
                                    let retroDIDname = allTypeChargeData[j]['description'] ? (allTypeChargeData[j]['description']).split('-')[1] : '';
                                    // didRetroTotalRate++;
                                    knex(table.tbl_Invoice_Item).insert({
                                        invoice_id: '' + invoiceId + '',
                                        amount: allTypeChargeData[j]['amount'],
                                        description: 'DID Retro rental charge :' + retroDIDname + '-'+'1',
                                        item_type: '1'
                                    }).then((response3) => {
                                        console.log('Data transfer from charge to invoice item for all retro did');
                                    }).catch(err => { console.log(err) });
                                }else if(allTypeChargeData[j]['charge_type'] == '2'){ // PSTN
                                    PSTNCount++;
                                    PSTNTotalRate = PSTNTotalRate + allTypeChargeData[j]['amount'];
                                }else if(allTypeChargeData[j]['charge_type'] == '3'){ // SMS
                                    SMSCount++;
                                    SMSTotalRate = SMSTotalRate + allTypeChargeData[j]['amount'];
                                }else if(allTypeChargeData[j]['charge_type'] == '4'){ // Booster
                                    boosterCount++;
                                    boosterTotalRate = boosterTotalRate + allTypeChargeData[j]['amount'];
                                }else if(allTypeChargeData[j]['charge_type'] == '5'){ // Bundle
                                    bundleCount++;
                                    bundleTotalRate = bundleTotalRate + allTypeChargeData[j]['amount'];
                                }else if(allTypeChargeData[j]['charge_type'] == '6'){ // Roaming
                                    roamingCount++;
                                    roamingTotalRate = roamingTotalRate + allTypeChargeData[j]['amount'];
                                }else if(allTypeChargeData[j]['charge_type'] == '7'){ // TC
                                    TCCount++;
                                    TCTotalRate = TCTotalRate + allTypeChargeData[j]['amount'];
                                }else if(allTypeChargeData[j]['charge_type'] == '8'){ //SIP
                                    SIPCount++;
                                    SIPTotalRate = SIPTotalRate + allTypeChargeData[j]['amount'];
                                    feature = "SIP";
                                }
                            }
                            
                            if (didRegularCount > 0) {
                                await knex(table.tbl_Invoice_Item).insert({
                                    invoice_id: '' + invoiceId + '',
                                    amount: didRegularTotalRate,
                                    description: 'DID rental charge' + '-' + didRegularCount,
                                    item_type: '1'
                                }).then((response3) => {
                                    console.log('Data transfer from charge to invoice item for all did');
                                }).catch(err => { console.log(err) });
                            }
                            if (PSTNCount > 0) {
                                await knex(table.tbl_Invoice_Item).insert({
                                    invoice_id: '' + invoiceId + '',
                                    amount: PSTNTotalRate,
                                    description: 'PSTN Call charges',
                                    item_type: '2'
                                }).then((response3) => {
                                    console.log('Data transfer from charge to invoice item for all pstn calls');
                                }).catch(err => { console.log(err) });
                            }
                            if (SMSCount > 0) {
                                await knex(table.tbl_Invoice_Item).insert({
                                    invoice_id: '' + invoiceId + '',
                                    amount: SMSTotalRate,
                                    description: 'SMS charges'+  '-' + SMSCount,
                                    item_type: '3'
                                }).then((response3) => {
                                    console.log('Data transfer from charge to invoice item for all sms charges');
                                }).catch(err => { console.log(err) });
                            }
                            if (bundleCount > 0) {
                                await knex(table.tbl_Invoice_Item).insert({
                                    invoice_id: '' + invoiceId + '',
                                    amount: bundleTotalRate,
                                    description: 'Bundle charges'  + '-' + bundleCount,
                                    item_type: '5'
                                }).then((response3) => {
                                    console.log('Data transfer from charge to invoice item for all bundle charges');
                                }).catch(err => { console.log(err) });
                            }
                            if (roamingCount > 0) {
                                await knex(table.tbl_Invoice_Item).insert({
                                    invoice_id: '' + invoiceId + '',
                                    amount: roamingTotalRate,
                                    description: 'Roaming charges' + '-' + roamingCount,
                                    item_type: '6'
                                }).then((response3) => {
                                    console.log('Data transfer from charge to invoice item for all roaming charges');
                                }).catch(err => { console.log(err) });
                            }
                            if (TCCount > 0) {
                                await knex(table.tbl_Invoice_Item).insert({
                                    invoice_id: '' + invoiceId + '',
                                    amount: TCTotalRate,
                                    description: 'Tele Consultation charges' + '-' + TCCount,
                                    item_type: '7'
                                }).then((response3) => {
                                    console.log('Data transfer from charge to invoice item for all tc charges');
                                }).catch(err => { console.log(err) });
                            }
                            if (boosterCount > 0) {
                                await knex(table.tbl_Invoice_Item).insert({
                                    invoice_id: '' + invoiceId + '',
                                    amount: boosterTotalRate,
                                    description: 'Booster charges' + '-' + boosterCount,
                                    item_type: '4'
                                }).then((response3) => {
                                    console.log('Data transfer from charge to invoice item for all Booster charges');
                                }).catch(err => { console.log(err) });
                            }
                            if(SIPCount > 0){
                                console.log("in sip condition", )
                                await knex(table.tbl_Invoice_Item).insert({
                                    invoice_id: '' + invoiceId + '',
                                    amount: SIPTotalRate,
                                    description: 'Feature Charges' + '-' + feature,
                                    item_type: '8'
                                }).then((response3)=>{
                                    console.log('Data transfer from charge to invoice item for all SIP charges');
                                }).catch(err =>{console.log(err )});
                            }
                            await update_invoice_with_single_entry(invoiceId, response[i].id, response[i].company_name, response[i].email,InvoiceNumberDisplay, invoice_month, response[i].advance_payment, response[i].created_by );

                        }).catch(err => { console.log(err) })
                }).catch(err=>{ console.log(err)});
            }
        });

    const update_invoice_with_single_entry =  (invoiceId, customer_id, company_name, customer_email, InvoiceNumberDisplay, invoice_month, cust_advance_payment,created_by) => {
        let sql = knex.from(table.tbl_Invoice_Item)
        .select(knex.raw('(now()- INTERVAL 1 MONTH) as invoice_period'))
        .sum('amount as amount')
        .where('invoice_id', '=', invoiceId);
        console.log(sql.toString());
        sql.then((response4) => {
            console.log(response4, "responce 4444444444444");
            console.log('get total amount from invoice item table for next calculation = invoiceId', invoiceId);
            let paid_status = '2';
            var gst_on_amount = 0.00;
            var amount_with_gst = 0.00;
            var cgst_on_amount = 0.00;
            var sgst_on_amount = 0.00;
            var fare_amount = 0.00;
            let invoice_period_day = response4[0]['invoice_period']
            //console.log('amount',response[0]['amount']);
            if (response4[0]['amount'] > 0) {
                paid_status = '2';
                fare_amount = response4[0]['amount'].toFixed(2),
                cgst_on_amount = ((response4[0]['amount'].toFixed(2) * config.cgst) / 100).toFixed(2);
                sgst_on_amount = ((response4[0]['amount'].toFixed(2) * config.sgst) / 100).toFixed(2);
                gst_on_amount = parseFloat(cgst_on_amount) + parseFloat(sgst_on_amount);
                amount_with_gst = parseFloat(response4[0]['amount'].toFixed(2)) + parseFloat(cgst_on_amount) + parseFloat(sgst_on_amount);
            } else {
                paid_status = '4';
            }
            //console.log('jhgtyyuyhfggfg',amount_with_gst);
            knex.from(table.tbl_pbx_invoice_conf)
                .select('*')
                .where('id', created_by)
                .then((resp) => {  // get user due date record
                    console.log('get organization info for manage payment_day....',resp[0]);
                    let orgInfo = resp[0];
                    let currentDate = new Date();
                    let currentDate2 = new Date();
                    let current_time = new Date(currentDate.setDate(currentDate.getDate() + orgInfo.payment_day));
                    // let current_time_one_less = new Date(currentDate2.setDate(currentDate2.getDate() - 1));
                    let current_time_one_less = new Date(currentDate2.setDate(currentDate2.getDate()));
                    let invoiceDueDate = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
                    let invoiceDate = current_time_one_less.toISOString().split('T')[0] + ' ' + current_time_one_less.toTimeString().split(' ')[0];
                     console.log('invoiceDueDate=',invoiceDueDate);
                    knex(table.tbl_Pbx_Invoice).where('id', '=', invoiceId)
                        .update({ 
                            amount: response4[0]['amount'].toFixed(2), paid_status: paid_status, cgst_percentage: config.cgst, sgst_percentage: config.cgst, total_gst_percentage: config.gst,
                            amount_with_gst: amount_with_gst, cgst_amount: cgst_on_amount, sgst_amount: sgst_on_amount, total_gst_amount: gst_on_amount,
                            invoice_period: invoice_period_day,
                            invoice_due_date: invoiceDueDate,
                            advance_balance: cust_advance_payment,
                            invoice_date : invoiceDate
                        })
                        .then((response5) => {
                            console.log('invoice table update as per all recordss........', invoiceId);
                            let sql = knex(table.tbl_Charge)
                                .update({
                                    charge_status: 1,
                                    invoice_status: 1
                                })
                                .where('customer_id', '=', "" + customer_id + "")
                            sql.then((response6) => {
                                console.log('update charge table as per for charge_status: 1 and invoice_status : 1 of customer = ', customer_id);
                                let newdata = {
                                    userName: company_name,
                                    email: customer_email,
                                    invoice_number: InvoiceNumberDisplay,
                                    amount: amount_with_gst.toFixed(2),
                                    fare_amount: fare_amount,
                                    gst_amount: gst_on_amount.toFixed(2),
                                    invoice_month: invoice_month,
                                };
                                pushEmail.getEmailContentUsingCategory('InvoiceCreation').then(val => {
                                    pushEmail.sendmail({ data: newdata, val: val, username: company_name, email: customer_email }).then((data1) => {
                                        console.log('email fired of customer with mail id= ', customer_email);
                                    });
                                });
                            }).catch((err) => { console.log(err) });
                        }).catch(err => { console.log(err) });
                }).catch(err => { console.log(err) });
        }).catch(err => { console.log(err) });
    }

});

cron.schedule("0 04 * * *", function () {  //for every day at 4:00 AM   */25 * * * * * 0 01 * * *
    console.log("running a task every day at 1:00 AM");
    var now = new Date(); 
    let sql = knex.from(table.tbl_Call_Plan_Rate)
        .select('*',)
        .where('expiry_date', 'like', "%" + now.toISOString().split('T')[0] + "%")
    console.log(sql.toQuery());
    sql.then((response) => {
        console.log(response);
        for (let i = 0; i < response.length; i++) {
            let actual_minutes = response[i]['actual_minutes']; 
            if(actual_minutes == 0){ // its means its purchased by booster and add via booster plan.
                knex(table.tbl_Call_Plan_Rate)
                .update({
                    booster_minutes: 0,
                    expiry_date: "0000-00-00 00:00:00.000000",
                    actual_minutes : 0,
                })
                .then((response) => {
                   console.log('update booster plan which have date of ',now.toISOString().split('T')[0]);
                }).catch((err) => { console.log(err) });
            }else{  // its means its add by admin call plan rates
                knex(table.tbl_Call_Plan_Rate)
                .update({
                    booster_minutes: 0,
                    expiry_date: "0000-00-00 00:00:00.000000",
                    talktime_minutes: 0
                })
                .then((response) => {
                   console.log('update booster plan which have date of ',now.toISOString().split('T')[0]);
                }).catch((err) => { console.log(err) });
            }
           
        }
    }).catch((err) => { console.log(err) });
});

module.exports = cronTest;

