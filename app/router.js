
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const loginCheck = app.middleware.loginCheck()
    const { router, controller } = app
    router.get('/', controller.home.index)

    // 用户接口
    // 社团用户注册接口
    router.get('/user/register', controller.user.stuRegister)
    // 用户登录
    router.post('/user/login', controller.user.stuLogin)
    // 用户获取个人信息接口
    router.get('/user/get_user_info', loginCheck, controller.user.getInfo)
    // 用户查询他人信息
    router.get('/user/get_others_info', controller.user.getOthersInfo)
    // 更新refresh_key
    router.get('/user/refresh_skey', loginCheck, controller.user.refreshSkey)
    // 用户查看自己发表的消息
    router.get('/user/get_user_moments', loginCheck, controller.user.getUserMoments)

    // OA接口
    // 获取oa列表
    router.get('/oauth/oa/list', controller.oa.getOAList)
    // 获取oa详情
    router.get('/oauth/oa/details', controller.oa.getOADetails)
    // oa全文搜索
    router.get('/oauth/oa/search', controller.oa.search)
    // 删除oa接口
    router.get('/oauth/oa/delete', controller.oa.delete)

    // 消息圈接口
    // 发布消息
    router.get('/moment/send', controller.moment.sendMoment)
}
