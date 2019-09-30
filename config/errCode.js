'use strict'

const errCode = {
  UserService: {
    code: '1001',
    network_error: '01',
    password_error: '02',
    register_had_error: '03',
    register_unclear_error: '04',
  },
  PasswordService: {
    code: '1002',
    update_user_error: '01',
  },
  OrganizationService: {
    code: '1003',
    password_invalid: '01',
  },
  loginCheck: {
    code: '2001',
    invalid_skey: '01',
    out_of_date_skey: '02',
  },
  NewsaoService: {
    code: '1003',
    login_newsao_request_page_unknow_error: '00',
    login_newsao_password_error: '01',
    login_newsao_param_error: '02',
    login_newsao_unknow_error: '03',
    syncUserStuInfoFromNewsao_request_unknow_error: '04',
    syncUserStuInfoFromNewsao_param_error: '05',
    syncUserStuInfoFromNewsao_Unknow_error: '06',
  },
}

module.exports = errCode

