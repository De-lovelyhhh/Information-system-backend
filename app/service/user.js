// app/service/oauth.js


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
    async refreshSkey(user_id) {
        const { ctx } = this
        let query_table
        let query_row
        switch (ctx.header.identity) {
            case 'student':
                query_table = 'user_login_state'
                query_row = 'id'
                break
            case 'organization':
                query_table = 'organization_login_state'
                query_row = 'organization_name'
        }
        const expire_at = new Date(Date.now() + ctx.app.config.skeyTTL)
        let skey = await ctx.app.model.query(`SELECT skey FROM ${query_table} WHERE ${query_row} = ? LIMIT 1`,
            { replacements: [user_id], type: ctx.app.Sequelize.SELECT })
        skey = skey[0][0].skey
        await ctx.app.model.query(`INSERT INTO ${query_table}(${query_row},skey,expire_at) VALUES(?,?,?) ON DUPLICATE KEY UPDATE expire_at=?`,
            { replacements: [user_id, skey, expire_at, expire_at], type: ctx.app.Sequelize.INSERT })
        return {
            user_id, skey, expire_at,
        }
    }

    /**
   * 查询他人基本信息
   * @param user_id
   * @return {Promise<{user_info}>}
   */
    async getOthersInfo(user_id) {
        const { ctx, config } = this
        const count = await ctx.app.model.query(`SELECT id,nickname,avatar,AES_DECRYPT(info, '${config.userInfoKey}') FROM user WHERE id = ? LIMIT 1`,
            { replacements: [user_id], type: ctx.app.Sequelize.SELECT })
        const user = count[0][0]
        let user_info = {}
        for (let key in user) {
            if (user.hasOwnProperty(key)) {
                if (key.indexOf('AES') === -1) {
                    user_info[key] = user[key]
                }
                else {
                    user_info.info = JSON.parse(Buffer.from(user[key]))
                }
            }
        }
        return {
            user_info: user_info
        }
    }

    /**
   * 查看用户发送的全部信息
   * @param user_id
   * @return {Promise<{moments_num: *, moments: *}>}
   */
    async getUserMoments(user_id) {
        const { ctx } = this
        const essayList = await ctx.app.model.query('SELECT * FROM wechat_essay WHERE user_id = ?',
            { replacements: [user_id], type: ctx.app.Sequelize.SELECT })
        return {
            moments_num: essayList[0].length,
            moments: essayList[0]
        }
    }

    async getUserComments(user_id) {
        const { app, ctx } = this
        const Sequelize = app.Sequelize
        const commentList = await ctx.model.Stu.WechatEssayComment.findAll({
            where: {
                user_id: user_id,
            },
            include: {
                model: ctx.model.WechatEssay,
                where: {
                    id: Sequelize.col('wechat_essay_comment.attached_essay_id')
                }
            }
        })
        return {
            comments_num: commentList[0].length,
            comments: commentList[0]
        }
    }
}

module.exports = UserService
