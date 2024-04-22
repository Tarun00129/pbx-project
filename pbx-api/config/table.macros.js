const tbl_customer_did_history = 'pbx_customer_did_history'; //akshay
const tbl_Customer = 'customer';
const tbl_Package = 'package';      //mayank
const tbl_Product = 'product';
const tbl_Ticket = 'ticket';
const tbl_Server_detail = 'server_details';
const tbl_Gateway = 'gateway';
const tbl_PBX_features = 'pbx_feature';     //mayank
const tbl_OC_features = 'oc_feature';
const tbl_Codec = 'codec';
const tbl_Company_info = 'company_info';
const tbl_Contact_list = 'pbx_contact_list';
const tbl_Country = 'country';
const tbl_Email_template = 'email_template';
const tbl_Extension_master = 'extension_master';
const tbl_Map_customer_package = 'map_customer_package';     //mayank
const tbl_Map_internal_user_product = 'map_internal_user_product';
const tbl_Service = 'service';
const tbl_Ticket_history = 'ticket_history';
const tbl_Time_Zone = 'timezone';
const tbl_Black_list = 'pbx_black_list';
const tbl_voicemail = 'pbx_voicemail';
const tbl_Call_Forward = 'pbx_call_forward';
const tbl_Speed_Dial = 'pbx_speed_dial';
const tbl_Email_Category = 'email_category';
const tbl_DID = 'did';
const tbl_Provider = 'providers';
const tbl_Charge = 'charge';
const tbl_Uses = 'did_uses';
const tbl_PBX_IVR = 'pbx_ivr';
const tbl_PBX_RG = 'pbx_ring_group';
const tbl_PBX_queue = 'pbx_queue';
const tbl_PBX_conference = 'pbx_conference';
const tbl_DID_Destination = 'did_destination';
const tbl_DID_active_feature = 'active_feature';
const tbl_pbx_prompt = 'pbx_prompts';
const tbl_PBX_Conference_Participant = 'pbx_conference_participant';
const tbl_PBX_CALLGROUP = 'pbx_callgroup';
const tbl_PBX_features_Code = 'pbx_feature_code';
const tbl_Gateway_Group= 'gateway_group';
const tbl_MAP_Gateway_GatewayGroup = 'map_gateway_gatewayGroup';
const tbl_Holiday='holiday';
const tbl_Time_Group = 'time_group';
const tbl_im_group ='pbx_im_group'; //Im-group
const tbl_Call_Plan = 'pbx_call_plan';
const tbl_Call_Plan_Rate = 'pbx_call_plan_rates';
const tbl_assignpackage = 'pbx_assignpackage';
//const tbl_Pbx_CDR = 'pbx_cdr';
const tbl_Pbx_CDR = 'pbx_realtime_cdr';
const tbl_Pbx_TerminateCause = 'terminate_cause';
const tbl_Pbx_Invoice = 'pbx_invoice';
const tbl_Invoice_Item = 'pbx_invoice_item';
const tbl_Pbx_Ivr_Master = 'pbx_ivr_master';
const View_Subscriber = 'subscriber';
const tbl_Epayment_Log = 'pbx_epayment_log'; // nagender
const tbl_indian_states = 'indian_states';
const tbl_location = 'location';
const tbl_Pbx_circle = 'pbx_circle';
const tbl_pbx_f2b_ip = 'pbx_f2b_ip'; //bhupendra 
const tbl_Pbx_global_feature_rate = 'pbx_global_feature_rate'; // nagender
const tbl_pbx_support_group = 'pbx_support_group';
const tbl_pbx_feature_plan ='pbx_feature_plan'; 
const tbl_pbx_support_user_map_support_group ='pbx_support_user_map_support_group';
const tbl_pbx_ticket_type ='pbx_ticket_type';
const tbl_pbx_global_feature_mapping = 'pbx_global_feature_mapping'; // nagender
const tbl_pbx_contact_group = 'pbx_contact_group'; // nagender
const tbl_pbx_contact_group_mapping = 'pbx_contact_group_mapping'; // nagender
const tbl_pbx_SMS = 'pbx_sms'; // nagender
const tbl_pbx_tc_plan = 'pbx_tc_plan'; // nagender
const tbl_pbx_tc_plan_mapping = 'pbx_tc_plan_mapping'; // nagender
const tbl_pbx_tc = 'pbx_tc'; // nagender
const tbl_pbx_tc_mapping = 'pbx_tc_mapping'; // nagender
const tbl_pbx_softPhone_logs = 'pbx_softphone_logs';  // nagender
const tbl_pbx_broadcast = 'pbx_broadcast'; // nagender
const tbl_pbx_broadcast_mapping = 'pbx_broadcast_mapping'; // nagender
const tbl_pbx_softPhone_location = 'pbx_softphone_location';  // nagender
const tbl_pbx_ivr_detail = 'pbx_ivr_detail';
const tbl_pbx_sms_api = 'pbx_sms_api'; // nagender
const tbl_pbx_sms_api_mapping = 'pbx_sms_api_mapping'; // nagender
const tbl_pbx_sms_category = 'pbx_sms_category'; // nagender
const tbl_pbx_sms_template = 'pbx_sms_template'; // nagender
const tbl_pbx_sms_service_config = 'pbx_sms_service_config'; // nagender
const tbl_pbx_appointment = 'pbx_appointment'; // nagender
const tbl_pbx_sms_logs = 'pbx_sms_log'; // nagender
const tbl_pbx_sip_location = 'location'; // nagender
const tbl_pbx_menu_permission= 'pbx_menu_permission';
const tbl_pbx_permission= 'pbx_permissions';
const tbl_pbx_realtime_cdr = 'pbx_realtime_cdr'; // nagender
const tbl_pbx_user_permission_map = "pbx_user_permission_mapping";
const tbl_pbx_bundle_plan_extra_fee_map = "pbx_bundle_plan_extra_fee_mapping";// nagender
const tbl_pbx_bundle_plan = "pbx_bundle_plan";// nagender
const tbl_pbx_appointment_mapping = 'pbx_appointment_mapping'; // nagender
const tbl_pbx_min_ext_mapping = 'pbx_min_ext_mapping'; // nagender
const tbl_pbx_recording = 'pbx_recording'; // nagender
const tbl_pbx_voicemail_recording = 'pbx_voicemail_recording'; // nagender
const tbl_pbx_booster_history = 'pbx_booster_history'; // nagender
const tbl_pbx_min_tc_mapping = 'pbx_min_tc_mapping'; // nagender
const tbl_api_logs = 'api_logs'; // nagender
const tbl_pbx_pkg_logs = 'pbx_pkg_logs'; // nagender
const tbl_pbx_service_subscription_history = 'pbx_service_subscription_history'; // nagender
const tbl_pbx_invoice_conf = 'invoice_conf'; // nagender
const tbl_pbx_call_rate_group = 'pbx_call_rate_group'; // nagender
const tbl_pbx_dialout_group = 'pbx_dialout_group'; // nagender
const tbl_pbx_dialout_rule = 'pbx_dialout_rule'; // nagender
const tbl_pbx_acl_node = 'pbx_acl_nodes'; // bhupendra
const tbl_pbx_access_restriction = 'pbx_access_restriction' // bhupendra
const tbl_extra_permission = 'extra_permissions';
const tbl_menu = "pbx_menu"
const tbl_profile_logo = "pbx_profile_logo";
const tbl_gateway_Manipulation = "pbx_caller_header_manipulation";
const tbl_mapped_featured_detail = "pbx_mapped_feature_detail";
const tbl_pbx_appointment_slots = "pbx_appointment_slots";
const tbl_pbx_plugin = "pbx_plugin";
const tbl_plugin_action = "pbx_plugin_action";
const tbl_pbx_plugin_destination = "pbx_plugin_destination";
const tbl_pbx_roles = 'pbx_role';



module.exports = {
    tbl_Customer, tbl_Package, tbl_Product, tbl_Ticket, tbl_Server_detail,
    tbl_Gateway, tbl_PBX_features, tbl_OC_features, tbl_Codec, tbl_Company_info, tbl_Contact_list,
    tbl_Country, tbl_Email_template, tbl_Extension_master, tbl_Map_customer_package,
    tbl_Map_internal_user_product, tbl_Service, tbl_Ticket_history, tbl_Time_Zone, tbl_Black_list,
    tbl_voicemail, tbl_Call_Forward, tbl_Speed_Dial, tbl_DID, tbl_Provider, tbl_Email_Category, tbl_Charge,
    tbl_Uses, tbl_PBX_IVR, tbl_PBX_RG, tbl_PBX_queue, tbl_PBX_conference, tbl_DID_Destination, tbl_DID_active_feature,
    tbl_pbx_prompt, tbl_PBX_Conference_Participant, tbl_PBX_CALLGROUP,tbl_PBX_features_Code,tbl_Gateway_Group,
    tbl_MAP_Gateway_GatewayGroup,tbl_Holiday,tbl_Time_Group,tbl_Call_Plan,tbl_Call_Plan_Rate,tbl_assignpackage,
    tbl_Pbx_CDR,tbl_Pbx_TerminateCause, tbl_Pbx_Invoice, tbl_Invoice_Item,tbl_Pbx_Ivr_Master,
    View_Subscriber,tbl_Epayment_Log,tbl_location, tbl_indian_states,tbl_Pbx_circle,tbl_pbx_f2b_ip,tbl_Pbx_global_feature_rate,tbl_pbx_support_group,
    tbl_pbx_feature_plan, tbl_pbx_support_user_map_support_group,tbl_pbx_ticket_type, tbl_pbx_global_feature_mapping,
    tbl_pbx_contact_group,tbl_pbx_contact_group_mapping, tbl_pbx_SMS, tbl_pbx_tc_plan, tbl_pbx_tc_plan_mapping,
    tbl_pbx_tc, tbl_pbx_tc_mapping, tbl_pbx_softPhone_logs,tbl_pbx_broadcast, tbl_pbx_broadcast_mapping, tbl_pbx_ivr_detail,
    tbl_pbx_sms_api, tbl_pbx_sms_api_mapping, tbl_pbx_sms_category, tbl_pbx_sms_template,tbl_pbx_sms_service_config,
    tbl_pbx_appointment, tbl_pbx_sms_logs, tbl_pbx_sip_location, tbl_pbx_menu_permission,tbl_pbx_permission,tbl_pbx_realtime_cdr,
    tbl_pbx_user_permission_map,tbl_pbx_bundle_plan, tbl_pbx_bundle_plan_extra_fee_map, tbl_pbx_appointment_mapping, tbl_pbx_min_ext_mapping,
    tbl_pbx_recording, tbl_pbx_voicemail_recording, tbl_pbx_booster_history, tbl_pbx_min_tc_mapping, tbl_api_logs, tbl_pbx_pkg_logs, 
    tbl_pbx_service_subscription_history, tbl_pbx_invoice_conf, tbl_pbx_call_rate_group, tbl_pbx_dialout_group, tbl_pbx_dialout_rule,tbl_customer_did_history,
    tbl_pbx_acl_node,
    tbl_extra_permission, tbl_menu,tbl_im_group,
    tbl_profile_logo, tbl_gateway_Manipulation,
    tbl_mapped_featured_detail
    ,tbl_pbx_appointment_slots,tbl_pbx_plugin,tbl_plugin_action,
    tbl_pbx_plugin_destination, tbl_pbx_roles
};