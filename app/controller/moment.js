// app/controller/moment.js
const Controller = require('egg').Controller

class MomentController extends Controller {
    async sendMoment() {
        const { ctx } = this
        const options = {
            user_id: 'string',
            content: 'string',
            image_url: 'string',
            avatar: 'string',
            nickname: 'string'
        }
        ctx.validate(options, ctx.query)
        const { user_id, content, image_url, avatar, nickname } = ctx.query
        await ctx.service.moment.sendMoment(user_id, content, image_url, avatar, nickname)
        ctx.body = 'OK'
    }
    async search() {
        const { ctx } = this
        await ctx.service.search.searchPatternCheck(ctx.request.body)
        const { begin_date, end_date, ncs_keyword, opt_keyword, excld_keyword } = ctx.request.body
        let search_result
        search_result = await ctx.service.search.searchMoment(begin_date, end_date, ncs_keyword, opt_keyword, excld_keyword)
        ctx.body = search_result
    }
}

module.exports = MomentController
