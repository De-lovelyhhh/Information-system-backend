// app/service/oauth.js
'use strict'

const Service = require('egg').Service


class UserService extends Service {
  /**
   * 校园网账号登录
   * @param user_id
   * @param password
   * @return {Promise<void>}
   */
  async stuLogin(user_id, password) {
    const { ctx, app } = this
    const login_url = 'http://wechat.stu.edu.cn/wechat/login/login_verify'
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      dataType: 'text',
      data: {
        ldap_account: user_id,
        ldap_password: password,
        btn_ok: '登录',
        source_type: 'dorm_information',
        openid: user_id,
      },
    }
    // 发送请求验证账号密码
    let result
    try {
      result = await ctx.curl(login_url, options)
    } catch (err) {
      throw ctx.helper.createError(new Error('network errors'), app.errCode.OauthService.network_error)
    }
    if (result.status === 302) {
      throw ctx.helper.createError(new Error('password error'), app.errCode.OauthService.password_error)
    }

    // 插入数据库
    await ctx.service.password.updateUserPassword(user_id, password)
    return user_id
  }

  /**
   * 设置用户登录态
   * @param user_id
   * @returns {Promise<{user_id: *, cookie: *, expireAt: Date}>}
   */
  async setLoginState(user_id) {
    const { ctx, app } = this
    const cookie = ctx.creat_uuid()
    const expireAt = new Date(Date.now() + app.config.cookieTTL)
    const { UserLoginState } = app.model
    await UserLoginState.create({
      id: user_id,
      cookie,
      expireAt,
    })
    return { user_id, cookie, expireAt }
  }

  /**
   * 由cookie获取用户账号
   * @param cookie
   * @returns {Promise<*>}
   */
  async getLoginState(cookie) {
    const { app } = this
    const { UserLoginState } = app.model
    const user = await UserLoginState.findOne({
      where: { cookie },
    })
    return user
  }
}

module.exports = UserService
