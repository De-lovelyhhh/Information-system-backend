// app/service/oauth.js
'use strict'

const uuid = require('uuidv4')

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
      throw ctx.helper.createError(new Error('network errors'), app.errCode.UserService.network_error)
    }
    if (result.status === 302) {
      throw ctx.helper.createError(new Error('password error'), app.errCode.UserService.password_error)
    }

    // 插入数据库
    await ctx.service.password.updateUserPassword(user_id, password)
    return user_id
  }

  /**
   * 设置用户登录态
   * @param user_id
   * @return {Promise<{user_id: *, skey: *, expireAt: Date}>}
   */
  async setStuLoginState(user_id) {
    const { app } = this
    const skey = uuid()
    const expire_at = new Date(Date.now() + app.config.skeyTTL)
    const { UserLoginState } = app.model.Stu
    await UserLoginState.create({
      id: user_id,
      skey,
      expire_at,
    })
    return { user_id, skey, expire_at }
  }
  async refreshSkey(user_id) {
    const { ctx } = this
    const expire_at = new Date(Date.now() + ctx.app.config.skeyTTL)
    let skey = await ctx.app.model.query('SELECT skey FROM user_login_state WHERE id = ? LIMIT 1',
      { replacements: [ user_id ], type: ctx.app.Sequelize.SELECT })
    skey = skey[ 0 ][ 0 ].skey
    await ctx.app.model.query('INSERT INTO user_login_state(id,skey,expire_at) VALUES(?,?,?) ON DUPLICATE KEY UPDATE expire_at=?',
      { replacements: [ user_id, skey, expire_at, expire_at ], type: ctx.app.Sequelize.INSERT })
    return {
      user_id, skey, expire_at,
    }
  }

  async stuRegister(organizationName, organizationPsw, organizationInfo, avatarUrl) {
    const { ctx, app } = this
    try {
      const Status = await ctx.model.Organization.findOne({
        where: { organization_name: organizationName },
      })
      if (Status !== null) { throw ctx.helper.createError(new Error('register error'), app.errCode.UserService.register_had_error) } else {
        await ctx.model.Organization.create({
          organization_name: organizationName,
          organization_psw: organizationPsw,
          organization_info: organizationInfo,
          avatar_url: avatarUrl,
        })
      }
      return 'OK'
    } catch (err) {
      throw this.ctx.helper.createError(err, app.errCode.UserService.register_unclear_error)
    }
  }
}

module.exports = UserService
