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
}

module.exports = MomentController
