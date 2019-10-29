// app/controller/moment.js
const Controller = require('egg').Controller

class MomentController extends Controller {
    async sendMoment() {
        const { ctx } = this
        const options = {
            content: 'string',
            image_url: 'string',
            avatar: 'string',
            nickname: 'string'
        }
        ctx.validate(options, ctx.query)
        const { content, image_url, avatar, nickname } = ctx.query
        await ctx.service.moment.sendMoment(ctx.user_id, ctx.header.identity, content, image_url, avatar, nickname)
        ctx.body = 'OK'
    }
    async comment() {
        const { ctx } = this
        const options = {
            essay_id: 'string',
            content: 'string',
            avatar: 'string',
            nickname: 'string'
        }
        ctx.validate(options, ctx.query)
        const { essay_id, content, avatar, nickname } = ctx.query
        await ctx.service.moment.comment(essay_id, ctx.user_id, ctx.header.identity, content, avatar, nickname)
        ctx.body = 'OK'
    }
}

module.exports = MomentController
