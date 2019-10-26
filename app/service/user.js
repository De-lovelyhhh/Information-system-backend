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
  async refreshSkey(id) {
    const { ctx } = this
    this.ctx.validate({
      identity: [ 'student', 'organization' ],
    }, ctx.header)
    const identity = ctx.header.identity
    const expire_at = new Date(Date.now() + ctx.app.config.skeyTTL)
    let skey
    switch (identity) {
      case 'student':
        skey = await ctx.app.model.query('SELECT skey FROM user_login_state WHERE id = ? LIMIT 1',
          { replacements: [ id ], type: ctx.app.Sequelize.SELECT })
        skey = skey[ 0 ][ 0 ].skey
        await ctx.app.model.query('INSERT INTO user_login_state(id,skey,expire_at) VALUES(?,?,?) ON DUPLICATE KEY UPDATE expire_at=?',
          { replacements: [ id, skey, expire_at, expire_at ], type: ctx.app.Sequelize.INSERT })
        break
      case 'organization':
        skey = await ctx.app.model.query('SELECT skey FROM organization_login_state WHERE organization_name = ? LIMIT 1',
          { replacements: [ id ], type: ctx.app.Sequelize.SELECT })
        skey = skey[ 0 ][ 0 ].skey
        await ctx.app.model.query('INSERT INTO organization_login_state(organization_name,skey,expire_at) VALUES(?,?,?) ON DUPLICATE KEY UPDATE expire_at=?',
          { replacements: [ id, skey, expire_at, expire_at ], type: ctx.app.Sequelize.INSERT })
        break
      default:
        return
    }
    return {
      id, skey, expire_at,
    }
  }

  async stuRegister(organizationName, organizationPsw, organizationInfo, avatarUrl) {
    const { ctx, app } = this
    let Status
    try {
      Status = await ctx.model.Organization.findOne({
        where: { organization_name: organizationName },
      })
    } catch (err) {
      throw this.ctx.helper.createError(err, app.errCode.UserService.register_unclear_error)
    }
    if (Status !== null) { throw ctx.helper.createError(new Error('register error'), app.errCode.UserService.register_had_error) } else {
      try {
        await ctx.model.Organization.create({
          organization_name: organizationName,
          organization_psw: organizationPsw,
          organization_info: organizationInfo,
          avatar_url: avatarUrl,
        })
      } catch (err) {
        throw this.ctx.helper.createError(err, app.errCode.UserService.register_unclear_error)
      }
      return 'OK'
    }
  }

  async lookOthers(another_id, from) {
    const { ctx, config } = this
    let another_id_info = await ctx.app.model.query('SELECT * FROM organization WHERE organization_name = ? LIMIT 1',
      { replacements: [ another_id ], type: ctx.app.Sequelize.SELECT })
    if (another_id_info[0].length) {
      another_id_info = {
        organizationId: another_id_info[0][0].organization_name,
        organizationInfo: another_id_info[0][0].organization_info,
      }
    } else {
      switch (from) {
        // 表示请求是从资讯页面发出
        case '1':
          // 对organization表和oa官方组织表先后进行查找
          break
        // 表示请求是从信息圈页面发出
        case '2':
          // 对organization表和user表先后进行查找
          another_id_info = await ctx.app.model.query('SELECT AES_DECRYPT(info, ?) FROM user WHERE id = ? LIMIT 1',
            { replacements: [ config.userInfoKey, another_id ], type: ctx.app.Sequelize.SELECT })
          another_id_info = another_id_info[0][0]
          break
        default:
          return
      }
    }
    return another_id_info
  }
}

module.exports = UserService
