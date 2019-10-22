// app/service/oauth.js


const uuid = require('uuidv4')

const Service = require('egg').Service


class OrganizationService extends Service {
    async organLogin(account, password) {
        const { ctx } = this
        const count = await ctx.app.model.query('SELECT COUNT(*) as result FROM organization WHERE organization_name = ? AND organization_psw = ?',
            { replacements: [account, password], type: ctx.app.Sequelize.SELECT })
        if (count[0][0].result === 0) { throw ctx.helper.createError(new Error('password error'), ctx.app.errCode.OrganizationService.password_invalid) }
        const skey = await this.setOrganLoginState(account)
        return skey
    }
    async setOrganLoginState(organization_name) {
        const { app } = this
        const skey = uuid()
        const expire_at = new Date(Date.now() + app.config.skeyTTL)
        await app.model.query('INSERT INTO organization_login_state VALUES(?,?,?,NOW(),NOW())',
            { replacements: [organization_name, skey, expire_at], type: app.Sequelize.INSERT })
        return { organization_name, skey, expire_at }
    }
}

module.exports = OrganizationService
