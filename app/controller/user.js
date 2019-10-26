
const Controller = require('egg').Controller

class UserController extends Controller {
    async stuLogin() {
        const ctx = this.ctx

        this.ctx.validate({
            account: 'string',
            password: 'string',
            identity: ['student', 'organization'],
        }, ctx.request.body)
        const { account, password, identity } = ctx.request.body
        switch (identity) {
            case 'student':
                await ctx.service.user.stuLogin(account, password)
                ctx.body = await ctx.service.user.setStuLoginState(account)
                break
            case 'organization':
                ctx.body = await ctx.service.organization.organLogin(account, password)
                break
            default: {
                return
            }
        }

    }
    async getInfo() {
        const { ctx } = this
        if (ctx.header.identity === 'student') {
            ctx.body = await ctx.service.newsao.syncUserStuInfoFromNewsao(ctx.user_id)
        } else {
            ctx.body = await ctx.service.organization.organizationInfoFromDb(ctx.user_id)
        }
    }
    async refreshSkey() {
        const { ctx } = this
        ctx.body = await ctx.service.user.refreshSkey(ctx.user_id)
    }

    async stuRegister() {
        const { ctx } = this
        const { organization_name, organization_psw, organization_info, avatar_url } = ctx.query
        ctx.body = await ctx.service.user.stuRegister(organization_name, organization_psw, organization_info, avatar_url)
    }

  async lookOthers() {
    const { ctx } = this
    this.ctx.validate({
      another_id: 'string',
      from: [ '1', '2' ],
    }, ctx.query)
    const { another_id, from } = ctx.query
    ctx.body = await ctx.service.user.lookOthers(another_id, from)
  }
}

module.exports = UserController
