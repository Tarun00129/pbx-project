const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth');
const email = require('../controllers/email');
const emailTemplate =  require('../controllers/emailTemplate');
const user = require('../controllers/user');
const extension =require('../controllers/extension');
const extensionDashboard = require('../controllers/extensionDashboard');
const paytm = require('../controllers/paytm');
const softPhone = require('../controllers/softphone');

//auth
router.route('/auth/login').post(auth.login);
router.route('/auth/update-password/user').put(auth.updatePassword);
router.route('/auth/email-exist').post(auth.emailExist);
router.route('/sendmail').post(email.sendmail);
router.route('/auth/get-menu-list-for-oc-pbx').post(auth.getMenuListForOcPbx);
router.route('/auth/getHistory').post(auth.getHistory);
router.route('/auth/make-notification-as-read').post(auth.makeNotificationAsRead);
router.route('/auth/get-ip').get(auth.getSystemIP);

// router.route('/extensionDashboard/getExtensionDashboardSpeeddial').get(extensionDashboard.getExtensionDashboardSpeeddial);
router.route('/paytm/callback').post(paytm.getPaytmCallback);

// Softphone logs
router.route('/soft-phone/login').post(softPhone.login);
router.route('/soft-phone/location').post(softPhone.location);
router.route('/soft-phone/customer-info').post(softPhone.createSoftPhoneLogs);

module.exports = router;
