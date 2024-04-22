const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const auth = require('../controllers/auth');
const product = require('../controllers/product');
const features = require('../controllers/features');
const user = require('../controllers/user');
const dashboard = require('../controllers/globalDashboard');
const internalUserDashboard = require('../controllers/internalUserDashboard');
const ticket = require('../controllers/ticket');
const accountManager = require('../controllers/accountManager');
const company = require('../controllers/company');
const service = require('../controllers/service');
const serverDetail = require('../controllers/serverDetail');
const codec = require('../controllers/codec');
const gateway = require('../controllers/gateway');
const extension = require('../controllers/extension');
const common = require('../controllers/common');
const contactList = require('../controllers/contactList');
const contactGroup = require('../controllers/contactGroup');
const blackList = require('../controllers/blackList');
const voicemail = require('../controllers/voicemail');
const callforward = require('../controllers/callforward');
const speeddial = require('../controllers/speeddial');
const emailCategory = require('../controllers/emailCategory');
const did = require('../controllers/did');
const provider = require('../controllers/provider');
const billing = require('../controllers/billing');
const supportDashboard = require('../controllers/supportDashboard');
const prompt = require('../controllers/prompt');
const conference = require('../controllers/conference');
const callgroup = require('../controllers/callgroup');
const callqueue = require('../controllers/callqueue');
const assignRights = require('../controllers/assignRights')
const featureCode= require('../controllers/featureCode');
const globalrate= require('../controllers/globalrate');
const gatewayGroup = require('../controllers/gatewayGroup');
const holiday= require('../controllers/holiday');
const timeGroup= require('../controllers/timeGroup');
const callPlan= require('../controllers/callplan');
const callPlanRate= require('../controllers/callplanrate');
const recording =  require('../controllers/recording');
const ivr= require('../controllers/ivr');
const cdr= require('../controllers/cdr');
const ccavenue = require('../controllers/ccavenue');
const invoice= require('../controllers/invoice');
const paytm = require('../controllers/paytm');
const addBalance = require('../controllers/addBalance');
const circle = require('../controllers/circle');
const supportgroup = require('../controllers/supportGroup');
const FeatureRatePlan = require('../controllers/FeatureRatePlan');
const SMS = require('../controllers/sms');
const teleConsultation= require('../controllers/tele-consultation');
const activityLog= require('../controllers/activityLog');
const softPhone = require('../controllers/softphone');
const broadcast= require('../controllers/broadcast');
const softphone_authorize = require('../middleware/softphone_authorize');
const appointment= require('../controllers/appointment');
const permission= require('../controllers/permission');
const backendAPIintegration= require('../controllers/backendIntegrationAPI');
const callRateGroup= require('../controllers/callRateGroup');
const bundlePlan= require('../controllers/bundlePlan');
const report = require('../controllers/report');
const accessRestriction= require('../controllers/accessRestriction');
const viewAccessRestriction = require('../controllers/viewAccessRestriction');
const imGroup = require('../controllers/imGroup');
const plugin = require('../controllers/plugin');
const reseller = require('../controllers/reseller')
const emailTemplate = require("../controllers/emailTemplate");
const extensionDashboard = require("../controllers/extensionDashboard");

router.get('/company/get-info', authorize, company.getCompanyInfo);

//get product
router.get('/product', authorize, product.getproduct);
router.get('/product/get-product-customer', authorize, product.getProductCustomer); //customer wise product
router.post('/product/verify-package-name', authorize, product.verifyPackageName);
router.get('/product/get-product', authorize, product.getproduct);

//config/get circle
router.post('/config/circle-list', authorize, circle.getcircleList);
router.post('/config/add-circle', authorize, circle.addCircle);
router.get('/config/get-circle-by-id', authorize, circle.getCircleById);
router.post('/config/update-circle', authorize, circle.updateCircle);
router.post('/config/delete-circle', authorize, circle.deleteCircle);
router.get('/config/get-circles', authorize, circle.getAllCircle);
router.get('/config/get-all-contact-from-circle', authorize, circle.getAllContactFromCircle);
router.post('/config/create-white-ip', authorize, circle.createWhiteListIP);
router.post('/config/get-white-ip', authorize, circle.viewWhiteListIPDetails);
router.delete('/config/delete-white-iP', authorize, circle.deleteWhiteListIP);
router.post('/config/get-blocked-ip', authorize, circle.getblockedIP);


//dialout rules & group
router.post('/config/dialout-group-list', authorize, circle.getDialoutGroup);
router.post('/config/add-dialout-group', authorize, circle.createDialOutGroup);
router.post('/config/delete-dialout-group', authorize, circle.deleteDialOutGroup);
router.post('/config/add-dialout-rules', authorize, circle.createDialOutRules);
router.post('/config/dialout-rule-list', authorize, circle.getDialoutRule);
router.get('/config/get-all-contact-from-dialout-group', authorize, circle.getAllContactFromDialOutGroup);
router.post('/config/delete-dialout-rule', authorize, circle.deleteDialOutRule);
router.get('/config/get-associated-user', authorize, circle.getAssociatedUser);

//supportUser/supportGroup
router.post('/support-user/get-support-list', authorize, supportgroup.getsupportList);
router.post('/support-user/add-support-group', authorize, supportgroup.addsupportGroup);
router.get('/support-user/get-support-group-by-id', authorize, supportgroup.getsupportGroupById);
router.post('/support-user/update-support-group', authorize, supportgroup.updatesupportGroup);
router.post('/support-user/delete-support-group', authorize, supportgroup.deletesupportGroup);
router.get('/support-user/get-all-support-groups', authorize, supportgroup.getAllsupportGroup);
router.post('/support-user/create-support-user', authorize, supportgroup.assignSupportGroup);
router.get('/support-user/get-user-from-group', authorize, supportgroup.getUserFromGroup);
router.post('/support-user/update-contact-group-with-user', authorize, supportgroup.updateSupportGroupWithUsers);


//Assign user
router.post('/support-user/assign-group/get-assignt-list', authorize, supportgroup.getGroupAssignUser);
router.post('/support-user/assign-group/add-assign-group', authorize, supportgroup.addassigngroup);
router.post('/support-user/assign-group/update-assign-group', authorize, supportgroup.updateassignGroup);
router.post('/support-user/assign-group/delete-assign-group', authorize, supportgroup.deleteassignGroup);
router.get('/support-user/get-all-contact-from-group', authorize, supportgroup.getAllUserFromGroup);

//show dashboard data
router.get('/dashboard/get-status-product-wise-dashboard', authorize, dashboard.getStatusProductwiseDashboard);
router.get('/dashboard/active-extensions',authorize,dashboard.ActiveExtensions);
router.get('/dashboard/inactive-extensions',authorize,dashboard.inactiveExtensions);
// router.get('/dashboard/totalExtension',authorize,dashboard.totalExtension);
router.get('/dashboard/get-monthly-revenue', authorize, dashboard.getMonthlyRevenue);
router.get('/dashboard/get-total-monthly-calls', authorize, dashboard.getTotalMonthlyCalls);
router.get('/dashboard/get-total-monthly-incoming-calls', authorize, dashboard.getTotalMonthlyIncomingCalls);
router.get('/dashboard/get-total-monthly-outgoing-calls', authorize, dashboard.getTotalMonthlyOutgoingCalls);
router.get('/dashboard/get-total-monthly-call-duration', authorize, dashboard.getTotalMonthlyCallDuration);
router.get('/dashboard/get-answered-calls', authorize, dashboard.getAnsweredCalls);
router.get('/dashboard/get-failed-calls', authorize, dashboard.getFailedCalls);
router.get('/dashboard/get-forward-calls', authorize, dashboard.getForwaredCalls);
router.get('/dashboard/get-not-answered-calls', authorize, dashboard.getNotAnsweredCalls);
router.get('/dashboard/get-busy-calls', authorize, dashboard.getBusyCalls);
router.get('/dashboard/get-rejected-calls', authorize, dashboard.getRejectedCalls);
router.get('/dashboard/get-minute-consumed-answered-calls', authorize, dashboard.getMinuteConsumedAnsweredCalls);
router.get('/dashboard/get-minute-consume-failed-calls', authorize, dashboard.getMinuteConsumeFailedCalls);
router.get('/dashboard/get-minute-consume-not-answered-calls', authorize, dashboard.getMinuteConsumeNotAnsweredCalls);
router.get('/dashboard/get-disk-space-usage', authorize, dashboard.getDiskSpaceUsage);
router.get('/dashboard/get-calls-per-tenant', authorize, dashboard.getCallsPerTenant);
router.get('/dashboard/get-calls-per-hours', authorize, dashboard.getCallsPerHours);
router.get('/dashboard/get-total-calls-per-tenant', authorize, dashboard.getTotalCallsPerTenant);
router.get('/dashboard/get-total-calls-per-hour', authorize, dashboard.getTotalCallsPerHours);
router.get('/dashboard/get-total-revenue', authorize, dashboard.getTotalRevenue);
router.get('/dashboard/get-total-active-extension', authorize, dashboard.getTotalActiveExtension);
router.get('/dashboard/get-pbx-total-ivr-by-customer', authorize, dashboard.getPbxTotalIvrByCustomer);
router.get('/dashboard/get-active-extension', authorize, dashboard.getActiveExtension);
router.get('/dashboard/get-date-wise-minute-consumed-answered-calls', authorize, dashboard.getDateWiseMinuteConsumedAnsweredCalls);
router.get('/dashboard/get-date-wise-minute-consume-failed-calls', authorize, dashboard.getDateWiseMinuteConsumeFailedCalls);
router.get('/dashboard/get-date-wise-minute-consume-not-answered-calls', authorize, dashboard.getDateWiseMinuteConsumeNotAnsweredCalls);
router.post('/internal-user-dashboard/get-did-id-for-account-manager', authorize, internalUserDashboard.getDidIdForAccountManager);
router.get('/internal-user-dashboard/get-customer', authorize, internalUserDashboard.getCustomer);
router.post('/support-dashboard/get-product-wise-customer', authorize, supportDashboard.getProductWiseCustomer);
router.post('/support-dashboard/get-product-wise-did', authorize, supportDashboard.getProductWiseDid);
router.get('/dashboard/get-asr-calls-per-hours', authorize, dashboard.getAsrCallsPerHours);
router.get('/dashboard/get-total-asr-calls-per-hours', authorize, dashboard.getTotalAsrCallsPerHours);
router.get('/dashboard/get-acd-calls-per-hours', authorize, dashboard.getAcdCallsPerHours);
router.get('/dashboard/get-total-acd-calls-per-hours', authorize, dashboard.getTotalAcdCallsPerHours);
router.get('/dashboard/get-customer-invoice-details', authorize, dashboard.getCustomerInvoiceDetail);
router.get('/dashboard/get-regis-extension',authorize,dashboard.getRegisExtension);



//product and feature get
router.get('/product-pbx-package', authorize, product.getPbxPackage);
router.get('/product-pbx-package-for-customer-creation', authorize, product.getPbxPackageForCustomerCreation);
router.get('/product-oc-package', authorize, product.getOcPackage);
router.post('/get-package-extension-count', authorize, product.getPackageExtensionCount);
router.get('/account-manager', authorize, accountManager.getAccountManager);
router.get('/account-manager-product-pbx-package', authorize, product.getPbxPackageForAccountManagerCustomers);
router.get('/account-manager-product-ocpackage', authorize, product.getOCPackageForAccountManagerCustomers);
router.get('/package/get-circle-package', authorize, product.getCircleBasedPackages);

//post request
router.post('/features/create-pbx-feature', authorize, features.postPbxFeature);
router.post('/features/custom-create-pbx-feature', authorize, features.customPostPbxFeature);
router.post('/features/create-oc-feature', authorize, features.postOcFeature);
router.post('/features/custom-create-oc-feature', authorize, features.customPostOcFeature);
router.post('/features/update-pbx-feature', authorize, features.updatePbxFeature);
router.post('/features/custom-update-pbx-feature', authorize, features.customUpdatePbxFeature);
router.post('/features/custom-update-oc-feature', authorize, features.customUpdateOcFeature);
router.post('/features/update-oc-feature', authorize, features.updateOcFeature);
router.post('/features/get-pbx-features', authorize, features.getPbxFeatures);
router.get('/features/get-product-features', authorize, features.getProductFeatures);
router.get('/features/get-customer-product-features', authorize, features.getCustomerProductFeatures);
router.post('/features/get-blacklist-features', authorize, features.getBlacklistFeatures);
router.get('/features/get-extension-features', authorize, features.getExtensionFeaturesBasedOnCustomer);

// user/customer
router.post('/user/create-user', authorize, user.createUser);
router.get('/user/get-all-users', authorize, user.getAllUser);
router.get('/user/get-customers', authorize, user.getCustomers);
router.post('/user/verify-username', authorize, user.verifyUsername);
router.post('/user/verify-email', authorize, user.verifyEmail);
router.post('/user/verify-company', authorize, user.verifyCompany);
router.post('/user/get-all-user-status-wise', authorize, user.getAllUserStatusWise);
router.post('/user/get-user-info', authorize, user.getUserInfo);
router.get('/user/get-package-product-wise', authorize, user.getPackageProductWise);
// router.put('/user/updateUser', authorize, user.updateUser);
router.put('/user/update-user-profile', authorize, user.updateUserProfile);
router.patch('/user/update-profile', authorize, user.UpdateProfile);
router.post('/user/set-logo-profile', authorize, user.setLogo);
router.get('/user/get-internal-user', authorize, user.getInternalUser);
router.put('/user/delete-customer', authorize, user.deleteUser);
router.put('/user/inactive-customer', authorize, user.inactiveUser);
router.put('/user/active-customer', authorize, user.activeUser);
router.get('/user/get-customer-by-id', authorize, user.getCustomerById);
router.get('/user/get-internal-user-by-id', authorize, user.getInternalUserById);
router.get('/user/get-customer-billing-type-package', authorize, user.getCustomerBillingTypePackage);
router.get('/user/get-customer-billing-type-and-with-out-bundle-package', authorize, user.getCustomerBillingTypeAndWithOutBundlePackage);

// router.post('/user/updateInternalUser', authorize, user.updateInternalUser);
router.post('/user/get-users-by-filters', authorize, user.getUsersByFilters);
router.post('/user/get-internal-users-by-filters', authorize, user.getInternalUsersByFilters);
router.post('/user/get-users-for-account-manager-by-filters', authorize, user.getUsersForAccountManagerByFilters);
router.get('/user/get-all-user-for-account-manager', authorize, user.getAllUserForAccountManager);
router.post('/user/get-users-for-support-by-filters', authorize, user.getUsersForSupportByFilters);
router.get('/user/get-all-user-for-support', authorize, user.getAllUserForSupport);
router.get('/user/get-all-support-user', authorize, user.getAllSupportUser);
router.get('/user/get-customer-company', authorize, user.getCustomercompany);
router.get('/user/get-account-manager-customer-company', authorize, user.getAccountManagerCustomercompany);
router.get('/user/get-all-customer-company', authorize, user.getAllCustomerCompany);
router.post('/user/get-all-user-status-wise-filters', authorize, user.getAllUserStatusWiseFilters);
router.get('/user/get-account-manager-product-customercompany', authorize, user.getAccountManagerProductCustomercompany);
router.get('/user/get-company', authorize, user.getCompany);
router.get('/user/get-assigned-user', authorize, user.getAssignedUser);
router.get('/user/get-user-by-type', authorize, user.getUserByType);
router.get('/user/is-support-contact-associate-group', authorize, user.checkContactAssociateOrNot)
router.get('/user/get-minute-plan-user', authorize, user.getUserHasMinutePlan)
router.post('/user/sendmail', authorize, user.sendUserEmail);




//package
router.get('/get-package', authorize, product.getPackage);
router.get('/get-package-by-id', authorize, product.getPackageById);//by get req
router.post('/get-package-by-filters', authorize, product.getPackageByFilters);
router.post('/get-customer-package', authorize, product.getUserPackage);
router.post('/get-package-customers', authorize, product.getPackageCustomers);
router.post('/delete-package', authorize, product.deletePackage);
router.get('/feature-users-count', authorize, product.featureUsersCount);
router.get('/get-gateway-group', authorize, product.getGatewayGroup);
router.get('/get-call-plan', authorize, product.getCallPlan);
router.post('/get-circle-call-plan', authorize, product.getCircleCallPlan);
router.get('/get-call-plan-list', authorize, product.getCallPlanList);
router.get('/get-tccall-plan-list', authorize, product.getTCCallPlanList);
router.post('/delete-associate-booster-from-minute-plan', authorize, product.deleteBoosterDuringChangeMinutePlan);


//ticket
//put request
router.post('/ticket/ticket-history', authorize, ticket.ticketHistory);
router.post('/ticket/get-ticket-history', authorize, ticket.getTicketHistory);
router.post('/ticket/get-ticket-by-filters', authorize, ticket.getTicketByFilters);
router.post('/ticket/get-customer-ticket-by-filters', authorize, ticket.getCustomerTicketByFilters);
router.post('/ticket/create-ticket', authorize, ticket.createTicket);
router.post('/ticket/view-ticket-id', authorize, ticket.viewTicketId);
router.post('/ticket/view-ticket-customer-wise', authorize, ticket.viewTicketCustomerWise);
router.post('/ticket/view-ticket-productand-customerwise', authorize, ticket.viewTicketProductandCustomerwise);
router.post('/ticket/view-ticket', authorize, ticket.viewTicket);
router.get('/ticket/view-ticket-for-pbx', authorize, ticket.viewTicketFORPBX);
router.get('/ticket/view-ticket-for-pbx-for-support', authorize, ticket.viewTicketFORPBXForSupport);
router.get('/ticket/view-ticket-for-oc', authorize, ticket.viewTicketFOROC);
router.post('/ticket/view-account-manager-ticket', authorize, ticket.viewAccountManagerTicket);
router.post('/ticket/get-account-manager-ticket-by-filters', authorize, ticket.getAccountManagerTicketByFilters);
router.post('/ticket/get-customer-with-product-ticket-by-filters', authorize, ticket.getCustomerWithProductTicketByFilters);
router.post('/ticket/get-support-ticket-by-filters', authorize, ticket.getSupportTicketByFilters);
router.put('/ticket/update-ticket-new-status', authorize, ticket.updateTicketNewStatus);
router.post('/ticket/ticket-list', authorize, ticket.getticketList);
router.post('/ticket/add-ticket', authorize, ticket.addticket);
router.post('/ticket/update-ticket', authorize, ticket.updateTicket);

//get service
router.get('/service/get-services', authorize, service.getServices);


//get and post server detail
router.post('/serverDetail/create-server', authorize, serverDetail.createServer);
router.post('/serverDetail/view-server-details', authorize, serverDetail.viewServerDetails);
router.post('/serverDetail/delete-server-detail', authorize, serverDetail.deleteServerDetail);
router.put('/serverDetail/update-server-status', authorize, serverDetail.updateServerStatus);
router.post('/serverDetail/get-server-by-filters', authorize, serverDetail.getServerByFilters);
router.post('/serverDetail/verify-port', authorize, serverDetail.verifyPort);
//get codec info
router.get('/codec/get-codec-info', authorize, codec.getCodecInfo);

//get gateway info
router.post('/gateway/create-gateway', authorize, gateway.createGateway);
router.post('/gateway/view-gateway', authorize, gateway.viewGateway);
router.get('/gateway/view-gateway-by-id', authorize, gateway.viewGatewayById);
router.put('/gateway/update-gateway', authorize, gateway.updateGateway);
router.post('/gateway/delete-gateway', authorize, gateway.deleteGateway);
router.put('/gateway/update-gateway-status', authorize, gateway.updateGatewayStatus);
router.post('/gateway/get-gateway-by-filters', authorize, gateway.filterGateway);
router.get('/gateway/gateway-provider', authorize, gateway.gatewayProvider);
router.post('/gateway/update-gateway-manipulation', authorize, gateway.updateGatewayManipulation);
router.get('/gateway/view-gateway-dialog', authorize, gateway.viewGatewayialog);
router.post('/gateway/get-data', authorize, gateway.getdata);






//extension
router.get('/extension/get-extension-by-ext-id',authorize,extension.getExtensionByExtId);//
router.post('/extension/create-extension', authorize, extension.createExtension);
router.get('/extension/get-all-extension', authorize, extension.getAllExtension);
router.get('/extension/get-all-extension-with-plugin', authorize, extension.getAllExtensionWithPlugin);
router.post('/extension/verify-extension', authorize, extension.verifyExtension);
router.get('/extension/get-extension-limit', authorize, extension.getExtensionLimit);
router.get('/extension/get-total-extension', authorize, extension.getTotalExtension);
router.get('/extension/get-monthly-total-extension', authorize, extension.getMonthlyTotalExtension);
router.delete('/extension/delete-extension', authorize, extension.deleteExtension);
router.get('/extension/get-extension-by-id', authorize, extension.getExtensionById);
router.post('/extension/update-extension', authorize, extension.updateExtension);
router.patch('/extension/update-profile', authorize, extension.UpdateProfile);
router.post('/extension/get-extension-by-filters', authorize, extension.getExtensionByFilters);
router.post('/extension/get-extension-setting', authorize, extension.getExtensionSetting);
router.put('/extension/update-extension-settings', authorize, extension.updateExtensionSettings);
router.put('/extension/update-extension-fmfm-settings', authorize, extension.updateExtension_FMFM_Settings);
router.post('/extension/get-extension-fmfm-setting', authorize, extension.getExtension_FMFM_Setting);


// //get email template info
router.route('/email-template/create-email-template').post(emailTemplate.createEmailTemplate);
router.route('/email-template/view-email-template').post(emailTemplate.viewEmailTemplate);
router.route('/email-template/delete-email-template').post(emailTemplate.deleteEmailTemplate);
router.route('/email-template/update-email-template-status').put(emailTemplate.updateEmailTemplateStatus);
router.route('/email-template/get-email-content-using-category').get(emailTemplate.getEmailContentUsingCategory);
router.route('/email-template/check-existed-category').get(emailTemplate.checkExistedCategory);
router.route('/email-template/get-email-template-by-filters').post(emailTemplate.getEmailTemplateByFilters);
router.route('/email-template/check-multiple-status').post(emailTemplate.checkMultipleStatus);
router.route('/email-template/count-email-template').get(emailTemplate.countEmailTemplate);
router.route('/email-template/get-product-email-category').get(emailTemplate.getProductEmailCategory);

router.route('/user/get-customer-name').get(user.getCustomerName);
// router.route('/user/getCustomerNameandEmail').get(user.getCustomerNameandEmail);
router.route('/user/get-customer-email').get(user.getCustomerEmail);
router.route ('/user/reset-password').get(user.resetPassword);

router.route('/extension/get-extension-name').get(extension.getExtensionName);
router.route('/extension/extension-email-exist').post(extension.extensionEmailExist);
router.route('/extension/get-customer-extension-features').get(extension.getCustomerExtensionFeatures);
router.route('/extension/get-extension-features-by-filters').post(extension.getExtensionFeaturesByFilters);


//show extension dashboard data
router.route('/extensionDashboard/get-extension-dashboard-speeddial').get(extensionDashboard.getExtensionDashboardSpeeddial);
router.route('/extensionDashboard/get-extension-dashboard-call-forward').get(extensionDashboard.getExtensionDashboardCallForward);
router.route('/extensionDashboard/get-extension-dashboard-features').get(extensionDashboard.getExtensionDashboardFeatures);
router.route('/extensionDashboard/get-extension-dashboard-voice-mail').get(extensionDashboard.getExtensionDashboardVoiceMail);


router.get('/extension/get-extension-nameand-number', authorize, extension.getExtensionNameandNumber);
router.put('/extension/update-extension-password', authorize, extension.updateExtensionPassword);
router.post('/extension/verify-email', authorize, extension.verifyEmail);
router.post('/extension/get-extension-for-support', authorize, extension.getExtensionForSupport);
router.post('/extension/verify-ext-username', authorize, extension.verifyExtUsername);
router.post('/extension/update-package-minute-bal', authorize, extension.updatePackageMinuteBal);
router.post('/extension/manage-ext-minute', authorize, extension.updateExtensionMinute);
router.post('/extension/deduct-customer-ext-minute', authorize, extension.deductCustomExtensionMinute);
router.post('/extension/deduct-all-ext-minute', authorize, extension.deductAllExtensionMinute);
router.get('/extension-count', authorize, extension.getExtensionCount);
router.get('/extension/get-destination-did', authorize, extension.getDestinationDID);
router.post('/extension/bulk-extension', authorize, extension.bulkExtensionUpdate);
router.get('/extension/get-extension-realtime', authorize, extension.getExtensionForRealtimeDashboard);
router.post('/extension/make-favorite', authorize, extension.makeFavoriteContactByExtension);
router.post('/extension/bundle-plan-minute-assign', authorize, extension.assignBundlePlanMinuteForExtension);
router.post('/extension/get-extension-assign-minutes', authorize, extension.getExtensionAssignMinutes);
router.post('/extension/get-extension-assign-minutes-by-ext-id', authorize, extension.getExtensionAssignMinutesByExtnId);
router.post('/extension/bundle-plan-minute-adjust', authorize, extension.adjustBundlePlanMinuteForExtension);
router.put('/extension/inactive-extension', authorize, extension.inactiveExtension);
router.put('/extension/active-extension', authorize, extension.activeExtension);

//common service
router.get('/common/get-country-list', authorize, common.getCountryList);
router.get('/common/get-time-zone', authorize, common.getTimeZone);
router.get('/common/customer-wise-country', authorize, common.customerWiseCountry);
router.get('/common/get-providers', authorize, common.getProviders);
router.get('/common/get-customer-country', authorize, common.getCustomerCountry);
router.get('/common/get-india-states', authorize, common.getIndiaStates);

//contact list
router.post('/contactList/create-contact', authorize, contactList.createContact);
router.post('/contactList/view-contact-list', authorize, contactList.viewContactList);
router.post('/contactList/delete-contact', authorize, contactList.deleteContact);
router.post('/contactList/copy-to-black-list', authorize, contactList.copyToBlackList);
router.post('/contactList/get-contact-list-by-filters', authorize, contactList.getContactListByFilters);
router.get('/contactList/get-customer-email-contact', authorize, contactList.getCustomerEmailContact);
router.post('/contactList/delete-contact-group', authorize, contactList.deleteContactGroup);
router.post('/contactList/check-contact-exist-in-black-list', authorize, contactList.checkNumberExistInBlackList);

//contact group
router.post('/contact/create-contact-group', authorize, contactGroup.createContactGroup);
router.get('/contact/view-contact-group', authorize, contactGroup.viewContactGroup);
router.get('/contact/view-group', authorize, contactGroup.viewSingleContactGroup);
router.post('/contact/update-contact-group', authorize, contactGroup.updateContactGroup);
router.post('/contact/create-contact-in-group', authorize, contactGroup.createContactInGroup);
router.get('/contact/get-contact-from-group', authorize, contactGroup.getContactFromGroup);
router.get('/contact/get-all-contact-from-group', authorize, contactGroup.getAllContactFromGroup);
router.post('/contact/get-contact-group-by-filters', authorize, contactGroup.getContactGroupByFilters);
router.post('/contact/update-contact-group-with-contact', authorize, contactGroup.updateContactGroupWithContacts);
router.get('/contact/get-group-name', authorize, contactGroup.getGroupNameExist);
router.get('/contact/is-contact-associate-group', authorize, contactGroup.checkContactAssociateOrNot)
//black list contact
router.post('/blackList/create-black-list-contact', authorize, blackList.createBlackListContact);
router.post('/blackList/view-black-list', authorize, blackList.viewBlackList);
router.post('/blackList/delete-black-list-contact', authorize, blackList.deleteBlackListContact);
router.put('/blackList/update-black-list-contact-status', authorize, blackList.updateBlackListContactStatus);
router.post('/blackList/check-number-exist-in-black-list', authorize, blackList.checkNumberExistInBlackList);
router.post('/blackList/get-black-list-by-filters', authorize, blackList.getBlackListByFilters);

//voicemail
router.post('/voicemail/create-voicemail', authorize, voicemail.createVoicemail);
router.post('/voicemail/view-voice-mail-by-id', authorize, voicemail.viewVoiceMailById);


//callforward
router.post('/call-forward/create-call-forward', authorize, callforward.createCallForward);
router.post('/call-forward/viewCallForwardById', authorize, callforward.viewCallForwardById);
router.get('/call-forward/extFeatureCallForward', authorize, callforward.extFeatureCallForward);
router.get('/call-forward/extVoiceMailSetting', authorize, callforward.extVoiceMailSetting);

//speeddial
router.post('/speed-dial/create-speed-dial', authorize, speeddial.createSpeedDial);
router.post('/speed-dial/view-speed-dial-by-id', authorize, speeddial.viewSpeedDialById);

//get email category info
router.post('/email-category/create-email-category', authorize, emailCategory.createEmailCategory);
router.get('/email-category/view-email-category', authorize, emailCategory.viewEmailCategory);
router.get('/get-email-category', authorize, emailCategory.getEmailCategory);
router.post('/email-category/get-email-catgeory-by-filters', authorize, emailCategory.getEmailCatgeoryByFilters);

//DID
router.post('/did/create-did', authorize, did.createDID);
router.post('/did/update-did', authorize, did.updateDID);
router.get('/did/get-all-did', authorize, did.getAllDID);
router.post('/did/verify-did', authorize, did.verifyDID);
router.put('/did/delete-did', authorize, did.deleteDID);
router.put('/did/inactive-did', authorize, did.inactiveDID);
router.put('/did/active-did', authorize, did.activeDID);
router.put('/did/inactive-customer-did', authorize, did.inactiveCustomerDID);
router.put('/did/active-customer-did', authorize, did.activeCustomerDID);
router.patch('/did/make-master-did', authorize, did.makeMasterDID);  //masterDID
// router.patch('/did/remove-master-did', authorize, did.removeMasterDID); //change master DID
router.post('/did/get-did-by-filters', authorize, did.getDIDByFilters);
router.get('/did/get-did-by-id', authorize, did.getDIDById);
router.get('/did/get-did-by-country', authorize, did.getDIDByCountry);
router.post('/did/assign-did', authorize, did.assignDID);
router.get('/did/get-customer-did', authorize, did.getCustomerDID);
router.post('/did/release-did', authorize, did.releaseDID);
router.get('/did/get-active-feature', authorize, did.getActiveFeature);
router.get('/did/get-destination', authorize, did.getDestination);
router.post('/did/create-destination', authorize, did.createDestination);
router.post('/did/update-destination', authorize, did.updateDestination);
router.get('/did/get-did-destination', authorize, did.getDIDDestination);
router.post('/did/get-customer-did-by-filters', authorize, did.getCustomerDIDByFilters);
router.post('/did/get-internal-user-did-by-filters', authorize, did.getInternalUserDIDByFilters);
router.get('/did/get-intenal-user-did', authorize, did.getIntenalUserDID);
router.post('/did/get-support-did-by-filters', authorize, did.getSupportDIDByFilters);
router.get('/did/get-support-product-wise-did', authorize, did.getSupportProductWiseDID);
router.get('/did/get-product-wise-customer', authorize, did.getProductWiseCustomer);
router.get('/did/get-all-mapped-did-history', authorize, did.getAllMappedDIDHistroy);
router.post('/did/get-all-mapped-did-history-by-filters', authorize, did.getMappedDIDByFilters);
router.get('/did/get-all-feature-did-history',authorize, did.getAllFeatureDIDHistory); //akshay
router.get('/extension/get-did-list-by-id', authorize, extension.getDidListById); //akshay


//providers
router.post('/provider/create-provider', authorize, provider.createProvider);
router.post('/provider/update-provider', authorize, provider.updateProvider);
router.get('/provider/get-provider-by-id', authorize, provider.getProviderById);
router.get('/provider/view-provider-details', authorize, provider.viewProviderDetails);
router.delete('/provider/delete-provider', authorize, provider.deleteProvider);
router.post('/provider/verify-provider', authorize, provider.verifyProvider);
router.get('/provider/is-provider-in-use', authorize, provider.isProviderInUse);
router.get('/provider/get-did-details', authorize, provider.viewDIDDetailsBasedOnDID);

//billing
router.get('/billing/get-billing-info', authorize, billing.getBillingInfo);
router.post('/billing/get-billing-by-filters', authorize, billing.getBillingByFilters);
router.get('/billing/get-customer-billing-info', authorize, billing.getCustomerBillingInfo);
router.post('/billing/get-customer-billing-by-filters', authorize, billing.getCustomerBillingByFilters);
router.get('/billing/get-all-billing-info', authorize, billing.getAllBillingInfo);
router.post('/billing/get-all-billing-info-by-filters', authorize, billing.getAllBillingInfoByFilters);

//prompts
router.post('/prompt/view-prompt', authorize, prompt.promptDetails);
router.post('/prompt/get-prompt-by-filters', authorize, prompt.getPromptByFilters);
router.put('/prompt/delete-prompt', authorize, prompt.deletePrompt);
router.get('/prompt/get-prompt-by-id', authorize, prompt.getPromptById);
router.post('/prompt/update-prompt', authorize, prompt.updatePrompt);
router.get('/prompt/get-moh-prompt', authorize, prompt.getMOHPrompt);
router.get('/prompt/get-conference-prompt', authorize, prompt.getConferencePrompt);
router.get('/prompt/get-queue-prompt', authorize, prompt.getQueuePrompt);
router.get('/prompt/get-ivr-prompt', authorize, prompt.getIVRPrompt);
router.get('/prompt/get-time-group-prompt', authorize, prompt.getTimeGroupPrompt);
router.get('/prompt/get-tc-prompt', authorize, prompt.getTCPrompt);
router.get('/prompt/get-broadcast-prompt', authorize, prompt.getBCPrompt);
router.get('/prompt/prompt-associate', authorize, prompt.getPromptAssociated);
router.get('/prompt/get-time-group-prompt-for-extn', authorize, prompt.getTimeGroupPromptForExtension);
router.get('/prompt/get-call-group-prompt', authorize, prompt.getCallGroupPrompt);




//conference
router.post('/conference/create-conference', authorize, conference.createConference);
router.post('/conference/view-conference', authorize, conference.viewConference);
router.post('/conference/delete-conference', authorize, conference.deleteConference);
router.post('/conference/get-conference-by-filters', authorize, conference.getConferenceByFilters);
router.get('/conference/get-total-conference', authorize, conference.getTotalConference);
router.get('/conference-count', authorize, conference.getConferenceCount);


//call-group
router.post('/call-group/save-call-group', authorize, callgroup.saveCallGroup);
router.post('/call-group/delete-call-group', authorize, callgroup.deleteCallgroup);
router.post('/call-group/get-call-group', authorize, callgroup.getCallgroup);
router.post('/call-group/get-call-group-by-filters', authorize, callgroup.getCallgroupByFilters);
router.post('/call-group/get-exten', authorize, callgroup.getExten);
router.get('/call-group-count', authorize, callgroup.getCallGroupCount);


//call-queue
router.post('/call-queue/create-call-queue', authorize, callqueue.createCallQueue);
router.post('/call-queue/view-call-queue', authorize, callqueue.viewCallqueue);
router.post('/call-queue/get-call-queue-by-filters', authorize, callqueue.getCallQueueByFilters);
router.post('/call-queue/delete-call-queue', authorize, callqueue.deleteCallQueue);
router.get('/call-queue/get-total-queue', authorize, callqueue.getTotalQueue);
router.get('/call-queue-count', authorize, callqueue.getCallQueueCount);
router.post('/call-queue/get-ivr', authorize, callqueue.getfeedbackIVR);



//assign-rights
router.post('/assign-rights/get-user-package-detail', authorize, assignRights.getUserPackageDetails);
router.post('/assign-rights/save-assign-rights', authorize, assignRights.saveAssignRights);
router.get('/assign-rights/get-assign-rights', authorize, assignRights.getAssignRights);
router.post('/assign-rights/get-saved-assign-rights', authorize, assignRights.getSavedAssignRights);
router.post('/assign-rights/delete-assign-rights', authorize, assignRights.deleteAssignRights);
router.post('/assign-rights/get-assign-rights-filter', authorize, assignRights.getAssignRightsFilter);

//Featurecode
router.get('/feature-code/view-feature-code', authorize, featureCode.viewFeatureCode);
router.post('/feature-code/get-feature-code-by-filters', authorize, featureCode.getFeatureCodeByFilters);

//FeatureGlobalRate
router.post('/feature/view-global-rate', authorize,globalrate.viewGlobalRate);
router.get('/feature/get-global-rate-by-id', authorize, globalrate.getglobalRateById);
router.post('/feature/update-global-rate', authorize, globalrate.UpdateGlobalRate);
router.post('/feature/delete-global-rate', authorize, globalrate.deleteGlobalRate);
router.post('/feature/view-global-rate-mapping', authorize,globalrate.viewGlobalFeatureMappingRate);

// router.post('/featureCode/get-global-rate-by-filters', authorize, featureCode.getglobalRateByFilters);

//FeatureRatePlan
router.post('/feature/view-feature-plan', authorize,FeatureRatePlan.viewFeaturePlan);
router.get('/feature/get-feature-plan-by-id', authorize, FeatureRatePlan.getFeaturePlanById);
router.post('/feature/update-feature-plan', authorize, FeatureRatePlan.updateFeaturePlan);
router.post('/feature/delete-feature-plan', authorize, FeatureRatePlan.deleteFeaturePlan);
router.post('/feature/add-feature-plan', authorize, FeatureRatePlan.addFeaturePlan);
router.get('/feature/get-feature-packages', authorize, FeatureRatePlan.getFeaturePlanPackagesById);
router.post('/feature/upgrade-feature-rate-plan', authorize, FeatureRatePlan.UpgradeFeatureRatePlan);


//GatewayGroup
router.post('/gateway-group/create-gateway-group', authorize, gatewayGroup.createGatewayGroup);
router.post('/gateway-group/view-gateway-group', authorize, gatewayGroup.viewGatewayGroup);
router.post('/gateway-group/get-gateway-group-filter', authorize, gatewayGroup.getGatewayGroupFilter);
router.post('/gateway-group/delete-gateway-group', authorize, gatewayGroup.deleteGatewayGroup);

//Holiday
router.post('/holiday/create-holiday', authorize, holiday.createHoliday);
router.post('/holiday/view-holiday', authorize, holiday.viewHoliday);
router.post('/holiday/delete-holiday', authorize, holiday.deleteHoliday);
router.post('/holiday/get-holiday-filters',authorize, holiday.getHolidayFilters);
router.post('/holiday/create-holiday-from-excel', authorize, holiday.createHolidayFromExcel);

//Time Group
router.post('/timeGroup/create-time-group',authorize, timeGroup.createTimeGroup);
router.post('/timeGroup/view-time-group',authorize, timeGroup.viewTimeGroup);
router.post('/timeGroup/get-time-group-filters',authorize, timeGroup.getTimeGroupFilters);
router.post('/timeGroup/delete-time-group', authorize, timeGroup.deleteTimeGroup);

//Access Restriction created by bhupendra
router.post('/access-restriction/create-access-restriction',authorize,accessRestriction.createAccessRestriction);
router.get('/access-restriction/view-access-category',authorize, accessRestriction.viewAccessCategory);
router.post('/access-restriction/get-access-filter', authorize, accessRestriction.getAccessFilter);
router.post('/access-restriction/delete-access-group', authorize, accessRestriction.deleteAccessGroup);
router.patch('/access-restriction/update-access-group', authorize, accessRestriction.updateAccessGroup);
router.post('/access-restriction/view-access-group-by-id', authorize, accessRestriction.viewAccessGroupById);
router.post('/access-restriction/validate-ip',authorize, accessRestriction.ValidateIP);


//view Access Restriction created by bhupendra
// router.get('/viewAccessRestriction/getAccessRestrictionCustomer', authorize, viewAccessRestriction.getAccessRestrictionCustomer);
router.post('/view-access-restriction/create-view-access-restriction',authorize,viewAccessRestriction.createviewAccessRestriction);
router.post('/view-access-restriction/get-view-access-filter', authorize, viewAccessRestriction.getViewAccessFilter);
router.get('/view-access-restriction/view-access-restriction',authorize, viewAccessRestriction.viewAccessRestriction);
router.post('/view-access-restriction/delete-view-access-group', authorize, viewAccessRestriction.deleteviewAccessGroup);
router.post('/view-access-restriction/view-access-rest-group-by-id', authorize, viewAccessRestriction.viewAccessRestGroupById);
router.post('/view-access-restriction/validate-access-restriction-ip',authorize, viewAccessRestriction.ValidateAccessRestrictionIP);
router.patch('/view-access-restriction/update-access-restriction-group', authorize, viewAccessRestriction.updateAccessRestrictionGroup);
router.get('/view-access-restriction/get-customer-company-by-id', authorize, viewAccessRestriction.getCustomercompanyByID);

//Call Plan
router.post('/call-plan/create-call-plan', authorize, callPlan.createCallPlan);
router.post('/call-plan/view-call-plan', authorize, callPlan.viewCallPlan);
router.post('/call-plan/delete-call-plan', authorize, callPlan.deleteCallPlan);
router.get('/call-plan/get-call-plan', authorize, callPlan.getcallPlan);
router.post('/call-plan/get-call-plan-by-filter', authorize, callPlan.getCallPlanByFilter);
router.post('/call-plan/get-call-exist', authorize, callPlan.getCallPlanIsExist);
router.get('/call-plan/get-manager-customer-call-plan', authorize, callPlan.getManagerCustomerscallPlan);
router.post('/call-plan/delete-call-rate-group', authorize, callPlan.deleteCallRateGroup);

// router.get('/call-plan/call-rate-group-count', authorize, callPlan.getCallRateGroupCount);


//Call Plan Rate
router.post('/call-plan-rate/create-call-plan-rate', authorize, callPlanRate.createCallPlanRate);
router.post('/call-plan-rate/view-call-plan-rate', authorize, callPlanRate.viewCallPlanRate);
router.post('/call-plan-rate/delete-call-plan-rate', authorize, callPlanRate.deleteCallPlanRate);
router.post('/call-plan-rate/get-call-plan-rate-by-filters',authorize, callPlanRate.getCallPlanRateByFilters);
router.post('/call-plan-rate/check-unique-gateway-prefix', authorize, callPlanRate.checkUniqueGatewayPrefix);
router.post('/call-plan-rate/view-customer-call-plan-rate', authorize, callPlanRate.viewCustomerCallPlanRate);
router.post('/call-plan-rate/get-customer-call-plan-rate-by-filters', authorize, callPlanRate.getCustomerCallPlanRateByFilters);
router.post('/call-plan-rate/view-extension-call-plan-rate', authorize, callPlanRate.viewExtensionCallPlanRate);
router.post('/call-plan-rate/get-extension-call-plan-rate-by-filters', authorize, callPlanRate.getExtensionCallPlanRateByFilters);
router.post('/call-plan-rate/view-user-detail-call-plan-rate', authorize, callPlanRate.viewUserDetailCallPlanRate);
router.post('/call-plan-rate/view-manager-call-plan-rate', authorize, callPlanRate.viewManagerCustomerCallPlanRate);
router.post('/call-plan-rate/get-manager-call-plan-rate-by-filters', authorize, callPlanRate.getManagerCustomerCallPlanRateByFilters);
router.post('/call-plan-rate/check-unique-call-group', authorize, callPlanRate.checkUniqueCallGroup);
router.put('/call-plan-rate/gatewa-update', authorize, callPlanRate.GatewaUpdate);

//recording
router.post('/recording/delete-recording', authorize, recording.deleteRecording);
router.post('/recording/get-recording-list', authorize, recording.getRecordingList);
router.post('/recording/filter-recording-list', authorize, recording.filterRecordingList);
router.post('/recording/get-tele-consultation-recording', authorize, recording.getTeleConsultRecordingList);

//ivr
router.post('/ivr/create-ivr', authorize, ivr.createIVR);
router.get('/ivr/get-ivr-action', authorize, ivr.getIVRAction);
router.post('/ivr/create-basic-ivr', authorize, ivr.createBasicIVR);
router.post('/ivr/view-basic-ivr', authorize, ivr.viewBasicIVR);
router.post('/ivr/get-basic-ivrby-filters', authorize, ivr.getBasicIVRByFilters);
router.post('/ivr/delete-basic-ivr', authorize, ivr.deleteBasicIVR);
router.post('/ivr/get-ivrmaster', authorize, ivr.getIVRMaster);
router.get('/ivr-count', authorize, ivr.getIVRCount);
router.get('/ivr/get-all-associated-ivr', authorize, ivr.getAllAssociateIVR);
router.get('/ivr/get-ivrmapped-with-did', authorize, ivr.getIVRCount);

//cdr
router.get('/cdr/get-admin-cdr-info', authorize, cdr.getAdminCdrInfo);
router.post('/cdr/get-admin-cdr-by-filters', authorize, cdr.getAdminCdrByFilters);
router.get('/cdr/get-customer-cdr-info', authorize, cdr.getCustomerCdrInfo);
router.post('/cdr/get-customer-cdr-by-filters', authorize, cdr.getCustomerCdrByFilters);
router.get('/cdr/get-account-manager-cdr-info', authorize, cdr.getAccountManagerCdrInfo);
router.post('/cdr/get-account-manager-cdr-by-filters', authorize, cdr.getAccountManagerCdrByFilters);
router.get('/cdr/get-support-cdr-info', authorize, cdr.getSupportCdrInfo);
router.post('/cdr/get-support-cdr-by-filters', authorize, cdr.getSupportCdrByFilters);
router.get('/cdr/get-extension-cdr-info', authorize, cdr.getExtensionCdrInfo);
router.post('/cdr/get-extension-cdr-by-filters', authorize, cdr.getExtensionCdrByFilters);
router.get('/cdr/get-terminate-cause', authorize, cdr.getTerminateCause);
router.get('/cdr/get-feedback-report', authorize, cdr.viewFeedback_Report);
router.post('/cdr/get-feedback-report-by-filters', authorize, cdr.getFeedback_ReportByFilters);
router.get('/cdr/get-customer-sticky-agent-info', authorize, cdr.getCustomerStickyAgentInfo);
router.post('/cdr/get-customer-sticky-agent-by-filters', authorize, cdr.getCustomerStickyAgentByFilters);

//ccavenue payment gateway
router.post('/ccavenue/pay-here', authorize, ccavenue.payHere);
//invoice
router.get('/invoice/get-all-invoices', authorize, invoice.viewAllInvoice);
router.get('/invoice/get-invoice-detail', authorize, invoice.getInvoiceDetail);
router.get('/invoice/get-invoice-cdr-detail', authorize, invoice.getInvoiceCdrDetail);
router.get('/invoice/get-all-invoices-of-customer', authorize, invoice.getAllInvoicesOfCustomer);
router.get('/invoice/get-all-invoices-of-manager-customer', authorize, invoice.getAllInvoicesOfManagerCustomer);
router.post('/invoice/get-invoice-by-filters', authorize, invoice.getInvoiceByFilters); //get invoiveFilter
router.post('/invoice/get-invoices-of-manager-customer-by-filters', authorize, invoice.getInvoicesOfManagerCustomerByFilters); //get invoiveFilter

//paytm payment gateway
router.post('/paytm/get-checksum', authorize, paytm.getPaytmCheckSum );
//router.post('/paytm/callback', authorize, paytm.getPaytmCallback);
//Add balance in user
router.post('/add-balance/create-add-balance', authorize, addBalance.createAddBalance);
router.post('/add-balance/view-add-balance', authorize, addBalance.viewAddBalance);
router.post('/add-balance/delete-add-balance', authorize, addBalance.deleteAddBalance);
router.post('/add-balance/get-add-balance-by-filters', authorize, addBalance.getAddBalanceByFilters);

// TeleConsultation
router.post('/tele-consultation/add-tcplan', authorize, teleConsultation.addTCPlan);
router.post('/tele-consultation/get-tcplan', authorize, teleConsultation.viewTCPlan);
router.put('/tele-consultation/update-tcplan', authorize, teleConsultation.updateTCPlan);
router.get('/tele-consultation/get-my-assign-minutes', authorize, teleConsultation.getMyAssignedMinutes);
router.post('/tele-consultation/assign-minute-to-user', authorize, teleConsultation.assignMinuteToUser);
router.post('/tele-consultation/get-assign-user', authorize, teleConsultation.viewAssignUsers);
router.put('/tele-consultation/updateassign-minute-to-user',  authorize, teleConsultation.updateassignMinuteToUser);
router.post('/tele-consultation/add-tc', authorize, teleConsultation.addTC);
router.post('/tele-consultation/get-tc', authorize, teleConsultation.viewTC);
router.get('/tele-consultation/get-single-tc', authorize, teleConsultation.viewSingleTCFullDetails);
router.put('/tele-consultation/update-tc', authorize, teleConsultation.updateTC);
router.delete('/tele-consultation/delete-tc', authorize, teleConsultation.deleteTC);
router.delete('/tele-consultation/delete-tc-minute-mapping', authorize, teleConsultation.deleteTCMinuteMapping);
router.delete('/tele-consultation/delete-tc-list', authorize, teleConsultation.deleteTCPlan);
router.get('/tele-consultation/tc-plan-associate-users', authorize, teleConsultation.viewTCPlanAssociateUsers);
router.post('/tele-consultation/get-assign-minute-user', authorize, teleConsultation.viewAssignMinuteUsers);
router.get('/tele-consultation/get-cdr-info', authorize, teleConsultation.viewTC_CDR);
router.post('/tele-consultation/get-cdr-by-filters', authorize, teleConsultation.getTC_CdrByFilters);

// ActivityLogs
router.get('/activity-log/get-activity-log', authorize, activityLog.getActivityLog);
router.put('/user/update-logout-log', authorize, user.updateLogoutLog);
router.post('/activity-log/get-activity-log-by-filter', authorize, activityLog.getActivityLogByFilter);

//Broadcasting
router.post('/broadcasting/add-bc', authorize, broadcast.addBC);
router.post('/broadcasting/get-bc', authorize, broadcast.viewBC);
router.get('/broadcasting/get-single-bc', authorize, broadcast.viewSingleBCFullDetails);
router.put('/broadcasting/update-bc', authorize, broadcast.updateBC);
router.patch('/broadcasting/partially-update-bc', authorize, broadcast.partiallyUpdateBC);
router.get('/broadcasting/get-cdr-info', authorize, broadcast.viewBC_CDR);
router.post('/broadcasting/get-cdr-by-filters', authorize, broadcast.getBC_CdrByFilters);
router.get('/broadcast-count', authorize, broadcast.getBroadcastCount);
router.delete('/broadcast/delete-bc', authorize, broadcast.deleteBC);
router.get('/broadcasting/is-broadcast-exist', authorize, broadcast.getIsBroadcastExist);

// Softphone logs
router.get('/soft-phone/contacts',softphone_authorize, softPhone.getContact);
router.get('/soft-phone/call-history',softphone_authorize,softPhone.getCallHistory);

//SMS
router.get('/sms/get-all-sms', authorize, SMS.viewAllSMS);
router.post('/sms/create-sms-plan', authorize, SMS.createSMSPlan);
router.post('/sms/create-sms-plan-by-filters', authorize, SMS.createSMSPlanFilters);
router.get('/sms/view-sms-by-id', authorize, SMS.getSMSById);
router.put('/sms/update-sms-plan', authorize, SMS.updateSMSPlan);
router.post('/sms/create-sms-api', authorize, SMS.createSMSApi);
router.get('/sms/get-all-sms-api', authorize, SMS.viewAllSMSApi);
router.get('/sms/view-sms-api-by-id', authorize, SMS.getSMSApiById);
router.put('/sms/update-sms-api', authorize, SMS.updateSMSApi);
router.post('/sms/view-sms-api-by-filters', authorize, SMS.viewSMSPlanFilters);
router.get('/sms/get-sms-category', authorize, SMS.viewSMSCategories);
router.post('/sms/create-sms-template', authorize, SMS.createSMSTemplate);
router.get('/sms/get-sms-template', authorize, SMS.viewSMSTemplate);
router.post('/sms/view-sms-template-by-filters', authorize, SMS.viewSMSTemplateFilters);
router.put('/sms/update-sms-template', authorize, SMS.updateSMSTemplate);
router.put('/sms/update-sms-template-status', authorize, SMS.updateSMSTemplateStatus);
router.delete('/sms/delete-sms-api', authorize, SMS.deleteSMSApi);
router.delete('/sms/delete-sms-plan', authorize, SMS.deleteSMSPlan);
router.delete('/sms/delete-sms-template', authorize, SMS.deleteSMSTemplate);
router.post('/sms/create-service', authorize, SMS.CreateSMSService);
router.get('/sms/get-sms-service', authorize, SMS.viewSMSConfigService);
router.get('/sms/associate-users', authorize, SMS.viewSMSPlanAssociateUsers);
router.get('/sms/customer-sms-id', authorize, SMS.getCustomerSMSid);
router.post('/sms/get-customer-remaining-sms', authorize, SMS.getCustomerSMSInfo);
router.post('/sms/reset-customer-sms-package', authorize, SMS.resetCustomerSMSPackage);
router.get('/sms/get-admin-sms-report-info', authorize, SMS.getAdminSMSReportInfo);
router.post('/sms/get-admin-sms-report-by-filters', authorize, SMS.getAdminSMSReportByFilters);
router.get('/sms/get-customer-sms-report-info', authorize, SMS.getCustomerSMSReportInfo);
router.post('/sms/get-customer-sms-report-by-filters', authorize, SMS.getCustomerSMSReportByFilters);
router.post('/sms/create-sms-charge', authorize, SMS.createSMSCharge);

//Appointment
router.post('/appointment/create-appointment-ivr', authorize, appointment.createAppointmentIVR);
router.get('/appointment/get-all-appointment-ivr', authorize, appointment.viewAllAppointmentIVR);
router.get('/appointment/view-appointment-history', authorize, appointment.viewAppointmentHistory);

router.post('/appointment/get-appointment-ivr-by-filters', authorize, appointment.getAppointmentIVRByFilters);
// router.post('/appointment/get-appointment-history-by-filters', authorize, appointment.getAppointmentHistoryByFilters); //filter appointment History od data

router.put('/appointment/update-appointment-ivr', authorize, appointment.updateAppointmentIVR);
router.delete('/appointment/delete-appointment-ivr', authorize, appointment.deleteAppointmentIVR);
router.get('/appointment/get-cdr-info', authorize, appointment.viewAppointment_CDR);
router.post('/appointment/get-cdr-by-filters', authorize, appointment.getAppointment_CdrByFilters);

//Realtime-dashboard
router.get('/dashboard/get-registered-extension', authorize, dashboard.getRegisteredExtension);
router.get('/realtime-dashboard/get-customer-full-details', authorize, dashboard.getCustomerFullDetails);
router.get('/realtime-dashboard/get-customer-call-details', authorize, dashboard.getCustomerCallDetails);
router.get('/realtime-dashboard/all-call-details', authorize, dashboard.getAllCallDetails);
router.get('/dashboard/get-customer-extension', authorize, dashboard.getCustomerExtensionInfo);


//permission
router.post('/permission/get-admin-urls', authorize, permission.getAdminUrls);
router.post('/permission/create', authorize, permission.createPermission);
router.post('/permission/get-permission-list', authorize, permission.getPermissionList);
router.post('/permission/get-permission-by-id', authorize, permission.getPermissionById);
router.post('/permission/update', authorize, permission.updatePermission);
router.post('/permission/get-permission-users', authorize, permission.getPermissionUsers);
router.post('/permission/create-extra-permission', authorize, permission.createExtraPermission);
router.post('/permission/get-extra-permission', authorize, permission.getExtraPermission);

//API Integration
 router.post('/esl-api', authorize, backendAPIintegration.createCallQueueAPI);

 //Call Rate Group
router.post('/call-plan/create-call-rate-group', authorize, callRateGroup.createCallRateGroup);
router.post('/call-plan/view-call-rate-group', authorize, callRateGroup.viewCallRateGroup);
router.post('/call-plan-rate/get-call-rate-group-by-filters',authorize, callRateGroup.getCallRateGroupByFilters);
router.get('/call-plan/get-all-rates-from-group', authorize, callRateGroup.getAllRatesFromGroup);
router.post('/call-plan-rate/viewget-call-rate-group',authorize, callRateGroup.ViewgetCallRateGroup);
router.post('/call-plan/associate-call-rates', authorize, callRateGroup.getAssociateCallRates);


//IM-Group
router.get('/im-group/view-im-group',authorize, imGroup.viewImGroup);
router.post('/im-group/delete-im-group',authorize, imGroup.deleteImGroup);
router.post('/im-group/create-im-group',authorize, imGroup.createImGroup);
router.get('/im-group/get-group-by-id',authorize, imGroup.getGroupById);
router.post('/im-group/update-im-group',authorize, imGroup.updateImGroup);
router.post('/im-group/filter-im-group',authorize, imGroup.filterImGroup);


 //Minute Plan
 router.post('/call-plan/create-bundle-plan', authorize, bundlePlan.createBundlePlan);
 router.post('/call-plan/view-bundle-plan', authorize, bundlePlan.viewBundlePlan);
 router.post('/call-plan/update-bundle-plan', authorize, bundlePlan.updateBundlePlan);
 router.post('/call-plan/get-bundle-plan-by-filters',authorize, bundlePlan.getBundlePlanByFilters);
 router.post('/minute-plan/view-customer-bundle-plan', authorize, bundlePlan.viewCustomerBundlePlan);
 router.post('/minute-plan/view-customer-bundle-plan-all-rates', authorize, bundlePlan.viewCustomerBundlePlanAllRates);

 router.post('/minute-plan/viewCustomerRoamingPlan', authorize, bundlePlan.viewCustomerRoamingPlan);
 router.post('/minute-plan/view-customer-booster-plan', authorize, bundlePlan.viewCustomerBoosterPlan);
 router.post('/minute-plan/purchase-booster-plan', authorize, bundlePlan.purchaseBoosterPlanByCustomers);
 router.post('/minute-plan/view-extension-call-minutes', authorize, bundlePlan.viewExtensionCallMinute);
 router.get('/minute-plan/view-booster-history', authorize, bundlePlan.viewBoosterPlanHistory);
 router.post('/minute-plan/get-booster-plan-history-by-filters',authorize, bundlePlan.getBoosterPlanHistoryByFilters);
 router.get('/minute-plan/view-bundle-and-roaming-history', authorize, bundlePlan.viewBundleAndRoamingPlanHistory);
 router.get('/call-plan/get-all-users-from-plan', authorize, bundlePlan.getAllUsersFromMinutePlan);
 router.get('/call-plan/get-all-users-from-booster-plan', authorize, bundlePlan.getAllUsersFromBoosterMinutePlan);
 router.delete('/call-plan/delete-minute-plan', authorize, bundlePlan.deleteMinutePlan);
 router.delete('/call-plan/delete-booster-plan', authorize, bundlePlan.deleteBoosterPlan);
 router.post('/minute-plan/view-customer-tele-consultancy-plan', authorize, bundlePlan.viewCustomerTeleconsultancyPlan);
 router.post('/minute-plan/view-booster-plan-by-type', authorize, bundlePlan.viewBoosterPlanByType);
 router.post('/minute-plan/view-customer-according-by-type', authorize, bundlePlan.viewCustomerBasedByType);
 router.post('/minute-plan/get-customer-booster-plan-by-filters',authorize, bundlePlan.getCustomerBoosterPlanByFilters);
 router.get('/minute-plan/get-booster-associate-rates', authorize, bundlePlan.getBoosterAssociateRates);
 router.post('/minute-plan/get-bundle-plan-by-filters',authorize, bundlePlan.getMinutePlanForPackageCretion);
 router.get('/minute-plan/get-all-minute-plan-based-on-package', authorize, bundlePlan.getAllMinutePlanBasedOnPackaedId);
 router.post('/minute/get-all-mapped-package', authorize, bundlePlan.minuteAssociatePackage);

 //Report
 router.get('/report/get-call-date-hour-wise', authorize, report.viewCallDateHourWise);
 router.post('/report/get-call-date-hour-wise-by-filters',authorize, report.getCallDateHourWiseByFilters);
 router.get('/report/get-call-charges-date-wise', authorize, report.viewCallChargesDateWise);
 router.post('/report/get-call-charges-date-wise-by-filters',authorize, report.getCallChargesDateWiseByFilters);
 router.get('/report/get-customers-charges-date-wise', authorize, report.viewCustomersChargesDateWise);
 router.post('/report/get-customers-charges-date-wise-by-filters',authorize, report.getCustomersChargesDateWiseByFilters);
 router.get('/report/get-customers-call-details', authorize, report.viewCustomersCallDetails);
 router.post('/report/get-customers-call-details-by-filters',authorize, report.getCustomersCallDetailsByFilters);
 router.get('/report/get-providers-call-charges-date-wise', authorize, report.viewProvidersCallChargesDateWise);
 router.post('/report/get-providers-call-charges-date-wise-by-filters',authorize, report.getProvidersCallChargesDateWiseByFilters);
 router.get('/report/get-minute-plan-call-details',authorize,report.getMinutePlanCallDetails);
 router.post('/report/get-minute-plan-call-details-by-filters',authorize,report.getMinutePlanCallDetailsByFilters);

 // ALL BACKEND API lOGS
router.get('/api-logs/audit-by-id', authorize, activityLog.auditbyId);// for dialoge
router.get('/api-logs/get-all-api-log', authorize, activityLog.getAllBackendAPILog);
router.post('/api-logs/get-api-log-by-filter', authorize, activityLog.getAllBackendAPILogByFilter);
router.get('/api-logs/package-audit-log', authorize, activityLog.getAllPackageAuditLog);
router.post('/api-logs/package-audit-log-by-filter', authorize, activityLog.getAllPackageAuditLogByFilter);

//C2C
router.get('/c2c/get-status', authorize, activityLog.getC2CStatus);

//RESELLER
router.get('/reseller/user-list', authorize, reseller.getReseller);
//plugin
router.get('/plugin/get-plugin-by-customer',authorize, plugin.getPluginByCustomer)
router.post('/plugin/create-plugin',authorize, plugin.createPlugin);


module.exports = router;
