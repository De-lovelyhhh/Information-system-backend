'use strict'

module.exports = () => {
  return async function loginCheck(ctx, next) {
    ctx.validate({
      skey: 'string',
      identity: [ 'student', 'organization' ],
    }, ctx.header)
    const skey = ctx.header.skey
    const identity = ctx.header.identity
    const app = ctx.app
    if (identity === 'student') {
      const user = await app.model.query('SELECT * FROM user_login_state WHERE skey = ? LIMIT 1',
        { replacements: [ skey ], type: ctx.app.Sequelize.SELECT })
      if (!user[0].length) { throw ctx.helper.createError(new Error('skey无效$'), app.errCode.loginCheck.invalid_skey) }
      if (user[0][0].expire_at < new Date(Date.now())) {
        app.model.query('DELETE FROM user_login_state WHERE skey =?',
          { replacements: [ user[0][0].skey ], type: app.Sequelize.SELECT })
        throw ctx.helper.createError(new Error('skey过期'), app.errCode.loginCheck.out_of_date_skey)
      }
      // skey有效
      ctx.user_id = user[0][0].id
    } else if (identity === 'organization') {
      const organization = await app.model.query('SELECT * FROM organization_login_state WHERE skey = ? LIMIT 1',
        { replacements: [ skey ], type: ctx.app.Sequelize.SELECT })
      if (!organization[0].length) { throw ctx.helper.createError(new Error('skey无效$'), app.errCode.loginCheck.invalid_skey) }
      if (organization[0][0].expire_at < new Date(Date.now())) {
        app.model.query('DELETE FROM organization_login_state WHERE skey =?',
          { replacements: [ organization[0][0].skey ], type: app.Sequelize.SELECT })
        throw ctx.helper.createError(new Error('skey过期'), app.errCode.loginCheck.out_of_date_skey)
      }
      // skey有效
      ctx.user_id = organization[0][0].organization_name
    }
    await next()
  }
}
