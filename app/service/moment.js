// app/service/moment.js
const Service = require('egg').Service

class MomentService extends Service {
    async sendMoment(user_id, identity, content, image_url, avatar, nickname) {
        const { app, ctx } = this
        try {
            await ctx.model.Stu.WechatEssay.create({
                user_id: user_id,
                identity: identity,
                content: content,
                image_url: image_url,
                review_num: 0,
                avatar: avatar,
                nickname: nickname,
                bookmarked_num: 0,
                thumbsup_num: 0,
            })
        } catch (err) {
            throw this.ctx.helper.createError(err, app.errCode.MomentService.sendMoment_unclear_error)
        }
    }
    async comment(essay_id, user_id, identity, content, avatar, nickname) {
        const { app, ctx } = this
        try {
            await ctx.model.Stu.WechatEssayComment.create({
                attached_essay_id: essay_id,
                user_id: user_id,
                identity: identity,
                content: content,
                avatar: avatar,
                nickname: nickname,
            })
        } catch (err) {
            throw this.ctx.helper.createError(err, app.errCode.MomentService.comment_unclear_error)
        }
    }
}
module.exports = MomentService
