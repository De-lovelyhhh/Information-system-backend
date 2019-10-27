// app/service/organization.js


const uuid = require('uuidv4')

const Service = require('egg').Service


class OrganizationService extends Service {
    /**
   * 社团用户注册
   * @param organizationName
   * @param organizationPsw
   * @param organizationInfo
   * @param avatarUrl
   * @return {Promise<string>}
   */
    async stuRegister(organizationName, organizationPsw, organizationInfo, avatarUrl) {
        const { ctx, app } = this
        let Status
        try {
            Status = await ctx.model.Organization.findOne({
                where: { organization_name: organizationName },
            })
        } catch (err) {
            throw this.ctx.helper.createError(err, app.errCode.UserService.register_unclear_error)
        }
        if (Status !== null) { throw ctx.helper.createError(new Error('register error'), app.errCode.UserService.register_had_error) } else {
            try {
                await ctx.model.Organization.create({
                    organization_name: organizationName,
                    organization_psw: organizationPsw,
                    organization_info: organizationInfo,
                    avatar_url: avatarUrl,
                })
            } catch (err) {
                throw this.ctx.helper.createError(err, app.errCode.UserService.register_unclear_error)
            }
            return 'OK'
        }
    }
    /**
   *
   * @param account
   * @param password
   * @return {Promise<{organization_name: *, skey: *, expire_at: Date}>}
   */
    async organLogin(account, password) {
        const { ctx } = this
        const count = await ctx.app.model.query('SELECT COUNT(*) as result FROM organization WHERE organization_name = ? AND organization_psw = ?',
            { replacements: [account, password], type: ctx.app.Sequelize.SELECT })
        if (count[0][0].result === 0) {
            throw ctx.helper.createError(new Error('password error'), ctx.app.errCode.OrganizationService.password_invalid)
        }
        const skey = await this.setOrganLoginState(account)
        return skey
    }

    /**
   *
   * @param organization_name
   * @return {Promise<{organization_name: *, skey: *, expire_at: Date}>}
   */
    async setOrganLoginState(organization_name) {
        const { app } = this
        const skey = uuid()
        const expire_at = new Date(Date.now() + app.config.skeyTTL)
        await app.model.query('INSERT INTO organization_login_state VALUES(?,?,?,NOW(),NOW())',
            { replacements: [organization_name, skey, expire_at], type: app.Sequelize.INSERT })
        return { organization_name, skey, expire_at }
    }

    async organizationInfoFromDb(organization_id) {
        const { ctx } = this
        const count = await ctx.app.model.query('SELECT * FROM organization WHERE organization_name = ? LIMIT 1',
            { replacements: [organization_id], type: ctx.app.Sequelize.SELECT })
        if (!count[0].length) {
            throw ctx.helper.createError(new Error('数据库没有存指定团体信息'), ctx.app.errCode.OrganizationService.no_information_reserved)
        }
        const organization = count[0][0]
        return {
            organizationId: organization.organization_name,
            organizationInfo: organization.organization_info,
            organizationAvatar: organization.avatar_url,
        }
    }
}

module.exports = OrganizationService
