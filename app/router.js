
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

    // OA接口
    // 获取oa列表
    router.get('/oauth/oa/list', controller.oa.getOAList)
    // 获取oa详情
    router.get('/oauth/oa/details', controller.oa.getOADetails)
    // oa全文搜索
    router.get('/oauth/oa/search', controller.oa.search)
    // 删除oa接口
    router.get('/oauth/oa/delete', controller.oa.delete)
}
