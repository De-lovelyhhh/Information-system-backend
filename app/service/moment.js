// app/service/moment.js
const Service = require('egg').Service

class MomentService extends Service {
    async sendMoment(user_id, identity, content, image_url, avatar, nickname) {
        const { app, ctx } = this
        try {
            await ctx.model.Stu.WechatEssay.create({
                essay_user_id: user_id,
                essay_user_identity: identity,
                essay_user_image_url: image_url,
                essay_user_avatar: avatar,
                essay_user_nickname: nickname,
                essay_content: content,
                review_num: 0,
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
                comment_user_id: user_id,
                comment_user_identity: identity,
                comment_user_avatar: avatar,
                comment_user_nickname: nickname,
                comment_content: content,
            })
        } catch (err) {
            throw this.ctx.helper.createError(err, app.errCode.MomentService.comment_unclear_error)
        }
    }
}
module.exports = MomentService
