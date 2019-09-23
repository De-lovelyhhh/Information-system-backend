'use strict'

const Controller = require('egg').Controller

class UserController extends Controller {
  async stuLogin() {
    const ctx = this.ctx

    this.ctx.validate({
      account: 'string',
      password: 'string',
    })
    const account = ctx.request.body.account
    const password = ctx.request.body.password
    await ctx.service.user.stuLogin(account, password)
    ctx.body = await ctx.service.user.setLoginState(account)
  }
}

module.exports = UserController
