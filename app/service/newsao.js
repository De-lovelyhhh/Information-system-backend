'use strict'

const jsdom = require('jsdom')
const request_promise = require('request-promise')
const { JSDOM } = jsdom
const Service = require('egg').Service

const newsaoLoginUrl = 'https://sso.stu.edu.cn/login?service=http://newsao.stu.edu.cn/default.aspx/' // newsao登录url
const LOGIN_NEWSAO = Symbol('login_newsao') // 登录newsao系统
const PARSE_USER_INFO = Symbol('parse_user_info') // 解析用户信息
const UPDATE_USER_INFO = Symbol('update_user_info') // 更新用户信息


class NewsaoService extends Service {

  /**
   * 登录学生事务平台，返回cookieJar
   * @param user_id
   * @param password
   * @return {Promise<void>}
   */
  async [LOGIN_NEWSAO](user_id, password) {
    const { ctx, app } = this

    // 创建cookieJar
    const j = request_promise.jar()

    const request = request_promise.defaults({ jar: j })

    const myStuLoginPage = await request({
      method: 'GET',
      url: newsaoLoginUrl,
    })
    const dom = new JSDOM(myStuLoginPage)
    const window = dom.window
    const lt = window.document.querySelector('#fm1 > input[type="hidden"]:nth-child(7)').value
    const form_url = window.document.querySelector('#fm1').action

    const options = {
      method: 'POST',
      url: `http://139.199.224.230:8004${form_url}`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      form: {
        username: user_id,
        password,
        lt,
        execution: 'e1s1',
        _eventId: 'submit',
      },
      followAllRedirects: true,
    }

    let newsaoPage
    try {
      ctx.logger.debug('[登录学生事务平台] 开始请求')
      newsaoPage = await request(options)
      ctx.logger.info('[登录学生事务平台] 请求完成')
    } catch (e) {
      throw ctx.helper.createError('[登录学生事务平台] 请求页面，未知错误', app.errCode.NewsaoService.login_newsao_request_page_unknow_error)
    }
    // 页面错误处理
    switch (true) {
      case newsaoPage.includes('login_error'):
        throw ctx.helper.createError('[登录学生事务平台] 密码错误', app.errCode.NewsaoService.login_newsao_password_error)
      case newsaoPage.includes('STU Single Sign On System'):
        throw ctx.helper.createError('[登录学生事务平台] 登录参数不正确', app.errCode.NewsaoService.login_newsao_param_error)
      case newsaoPage.includes('学生事务平台'):
        ctx.logger.info('[登录学生事务平台] 登录成功')
        return j
      default:
        throw ctx.helper.createError('[登录学生事务平台] 未登录成功，未知错误', app.errCode.NewsaoService.login_newsao_unknow_error)
    }
  }

  /**
   * 从newsao系统中同步用户数据
   * @param user_id
   * @return {Promise<*>}
   */
  async syncUserStuInfoFromNewsao(user_id) {
    const { ctx, app } = this

    const user = await ctx.service.password.getUserPassword(user_id)
    const cookieJar = await this[LOGIN_NEWSAO](user.id, user.password)

    // 爬取用户信息页面
    const request = request_promise.defaults({ jar: cookieJar })

    const options = {
      method: 'GET',
      url: 'http://139.199.224.230:8003/XXGL/MY_ZHXX.aspx',
      qs: { menu_id: '2020430' },
    }

    let res
    try {
      ctx.logger.debug('[学生事务平台-个人信息] 开始请求')
      res = await request(options)
      ctx.logger.info('[学生事务平台-个人信息] 请求完成')
    } catch (e) {
      throw ctx.helper.createError('[学生事务平台-个人信息] 请求页面，未知错误', app.errCode.NewsaoService.syncUserStuInfoFromNewsao_request_unknow_error)
    }
    // 错误处理
    switch (true) {
      case res.includes('STU Single Sign On System'):
        throw ctx.helper.createError('[学生事务平台-个人信息] 请求参数不正确，可能为Cookie过期', app.errCode.NewsaoService.syncUserStuInfoFromNewsao_param_error)
      case res.includes('我的综合信息'):
        ctx.logger.info('[学生事务平台-个人信息] 获取成功')
        break
      default:
        throw ctx.helper.createError('[学生事务平台-个人信息] 未登录成功，未知错误', app.errCode.NewsaoService.syncUserStuInfoFromNewsao_Unknow_error)
    }

    const user_info = this[PARSE_USER_INFO](res)

    // 异步存储数据库，TODO 通过事件解耦
    this[UPDATE_USER_INFO](user_id, user_info)
    return user_info
  }

  /**
   * 解析个人信息页面
   * @param user_info_page
   * @return {{college: string, dorm_num: string, sex: string, name: string, dorm: string, education_level: string, education_year: string, from: string, state: string, education_type: string, enrollment: string}}
   */
  [PARSE_USER_INFO](user_info_page) {

    const dom = new JSDOM(user_info_page)
    const document = dom.window.document

    return {
      name: document.getElementById('lb_Xs_name').innerHTML.trim(),
      student_num: document.getElementById('lb_Xh').innerHTML.trim(), // 学号
      sex: document.getElementById('lb_Xb').innerHTML.trim(), // 性别
      education_level: document.getElementById('lb_Pycc').innerHTML.trim(), // 培养层次，如本科
      education_year: document.getElementById('lb_Xznx').innerHTML.trim(), // 学制年限
      enrollment: document.getElementById('lb_Rxnd').innerHTML.trim(), // 入学年份
      education_type: document.getElementById('lb_Bylb').innerHTML.trim(), // 文理科
      college: document.getElementById('lb_Zyxy').innerHTML.trim(), // 学院
      dorm: document.getElementById('lb_Zsxy').innerHTML.trim(), // 宿舍
      dorm_num: document.getElementById('lbl_housing_no').innerHTML.trim(), // 宿舍号
      state: document.getElementById('lb_Zt_name').innerHTML.trim(), // 当前状态，如当前在校生
      from: document.getElementById('lb_Jg').innerHTML.trim(), // 籍贯
    }
  }

  /**
   * 更新用户信息到数据库
   * @param user_id
   * @param user_info
   * @return {Promise<void>}
   */
  async [UPDATE_USER_INFO](user_id, user_info) {
    const { app, config } = this
    const { User } = app.model.Stu
    const Sequelize = app.Sequelize
    await User.upsert({
      id: user_id,
      // 加密用户信息
      info: Sequelize.fn([ 'aes_encrypt' ], JSON.stringify(user_info), config.userInfoKey),
    })
  }

}

module.exports = NewsaoService
