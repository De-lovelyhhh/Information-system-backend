
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
            ctx.body = await ctx.service.newsao.syncUserStuInfoFromNewsao(ctx.query.user_id)
        } else {
            ctx.body = await ctx.service.organization.organizationInfoFromDb(ctx.query.user_id)
        }
    }
    async getOthersInfo() {
        const { ctx } = this
        if (ctx.header.identity === 'student') {
            ctx.body = await ctx.service.user.getOthersInfo(ctx.query.user_id)
        } else {
            ctx.body = await ctx.service.organization.organizationInfoFromDb(ctx.query.user_id)
        }
    }
    async refreshSkey() {
        const { ctx } = this
        ctx.body = await ctx.service.user.refreshSkey(ctx.user_id)
    }

    async stuRegister() {
        const { ctx } = this
        const { organization_name, organization_psw, organization_info, avatar_url } = ctx.query
        ctx.body = await ctx.service.organization.stuRegister(organization_name, organization_psw, organization_info, avatar_url)
    }

    async getUserMoments() {
        const { ctx } = this
        ctx.body = await ctx.service.user.getUserMoments(ctx.user_id)
    }

    async getUserComments() {
        const { ctx } = this
        ctx.body = await ctx.service.user.getUserComments(ctx.user_id)
    }
}

module.exports = UserController
