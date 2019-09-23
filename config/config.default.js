/* eslint valid-jsdoc: "off" */

'use strict'

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {}

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1569219065050_2621'

  // add your middleware config here
  config.middleware = []

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    pwKey: 'Candy666Candy666Candy666Candy666',
    pwIv: 'Candy666666Candy',
    // 用户信息加密密钥
    userInfoKey: '小糖666a',
  }
  // 关闭csrf防范
  config.security = { csrf: { enable: false } }

  // skey有效期
  config.skeyTTL = 3 * 24 * 60 * 60 * 1000 // 3天
  return {
    ...config,
    ...userConfig,
  }
}
