'use strict'

module.exports = options => {
  return async function loginCheck(ctx, next) {
    ctx.validate({
      skey: 'string',
    }, ctx.header)
    const skey = ctx.header.skey
    const app = ctx.app
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
    await next()
  }
}
