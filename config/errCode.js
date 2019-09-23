'use strict'

const errCode = {
  OauthController: {
    code: '1001',
  },
  UserController: {
    code: '1002',
    getUserLesson_time_error: '01',
  },
  OauthService: {
    code: '2001',
    network_error: '01',
    password_error: '02',
    authorize_error: '03',
    token_error: '04',
    refreshLoginState_invalid_refresh_key: '05',
  },
  StuService: {
    code: '2002',
    update_user_error: '01',
  },
  CreditService: {
    code: '2003',
    login_credit_network_error: '01',
    login_credit_param_error: '02',
    login_credit_password_error: '03',
    getUserLessonFromCredit_param_error: '04',
    getUserLessonFromCredit_cookie_error: '05',
    getUserLessonFromCredit_unknow_error: '00',
  },
  NewsaoService: {
    code: '2004',
    login_newsao_request_page_unknow_error: '00',
    login_newsao_password_error: '01',
    login_newsao_param_error: '02',
    login_newsao_unknow_error: '03',
    syncUserStuInfoFromNewsao_request_unknow_error: '04',
    syncUserStuInfoFromNewsao_param_error: '05',
    syncUserStuInfoFromNewsao_Unknow_error: '06',
  },
  SmartcardService: {
    code: '2005',
    getSmartcardExpRecord_param_error: '01',
    getSmartcardInfo_unknow_error: '00',
  },
}

module.exports = errCode

