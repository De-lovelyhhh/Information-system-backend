'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const loginCheck = app.middleware.loginCheck()
  const { router, controller } = app
  router.get('/', controller.home.index)
  router.post('/user/login', controller.user.stuLogin)
  router.get('/user/get_user_info', loginCheck, controller.user.getInfo)
  router.get('/user/refresh_skey', loginCheck, controller.user.refreshSkey)
  router.get('/user/register', controller.user.stuRegister)
}
