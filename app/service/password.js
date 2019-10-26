// app/service/oauth.js


const Service = require('egg').Service


class PasswordService extends Service {
    /**
   * 更新账号密码
   * @param account
   * @param password
   */
    async updateUserPassword(account, password) {
        const { ctx, app, config } = this
        try {
            const t = app.Sequelize.transaction
            await ctx.model.Stu.User.findOrCreate({
                where: { id: account },
                defaults: { id: account },
                transaction: t,
            })
            await ctx.model.Stu.Password.upsert({
                id: account,
                password: ctx.helper.aesEncrypt({
                    data: password,
                    key: config.pwKey,
                    iv: config.pwIv,
                }),
            }, { transaction: t })
        } catch (err) {
            throw this.ctx.helper.createError(err, app.errCode.PasswordService.update_user_error)
        }
    }

    async getUserPassword(user_id) {
        const { ctx, config } = this
        const user = await ctx.model.Stu.Password.findOne({
            where: { id: user_id },
        })
        return {
            id: user.id,
            password: ctx.helper.aesDecrypt({
                data: user.password,
                key: config.pwKey,
                iv: config.pwIv,
            }),
        }
    }
}

module.exports = PasswordService
