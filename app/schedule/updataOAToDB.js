const request_promise = require('request-promise')
const NumsOneTime = 100 // 每个周期爬取oa条数
let IS_FIRST = true // 判断是否第一次启动程序

module.exports = {
    schedule: {
        interval: '1m', // 5 分钟间隔
        type: 'worker', // 随机一个worker执行该定时任务
    },
    async task(ctx) {

        const fetchOaList = async num => {
            let data = []
            try {
                data = await request_promise({
                    url: 'https://yiban.stu.edu.cn/api/api/oalist',
                    qs: {
                        pageindex: 1,
                        pagesize: num,
                        department: -1
                    }
                })
            } catch (err) {
                ctx.logger.warn(err)
                throw ctx.helper.createError('[爬取oa存数据库定时任务] 爬取易班oa列表接口 未知错误')
            }
            return data
        }

        const fetchAllOaList = async () => {
            let num = 0
            try {
                // 获取oa文章总数
                num = await request_promise({
                    url: 'http://wechat.stu.edu.cn/webservice_oa/oa_stu_/GetDocNum',
                    qs: {
                        token: 'stu',
                        subcompany_id: 0,
                        keyword: ''
                    }
                })
            } catch (err) {
                ctx.logger.warn(err)
                throw ctx.helper.createError('[爬取oa存数据库定时任务] 爬取易班oa数量 未知错误')
            }
            return fetchOaList(num)
        }

        const formatData = data => {
            let result = []
            data.forEach(err => {
                result.push({
                    id: err.id,
                    title: err.title,
                    department: err.department,
                    publishDate: err.publishDate
                })
            })
            return result
        }


        if (IS_FIRST) {
            // 先删除所有，再插入（可能有删除的情况）
            const result = await fetchAllOaList()
            const data = JSON.parse(result)
            const oaAllData = formatData(data)
            try {
                await ctx.model.Stu.OA.destroy({
                    where: {},
                    truncate: true
                })
                await ctx.model.Stu.OA.bulkCreate(oaAllData)
            } catch (err) {
                ctx.logger.warn(err)
                throw ctx.helper.createError('[爬取oa存数据库定时任务] 删除全部旧oa数据和插入全部新oa数据 未知错误')
            }
            IS_FIRST = false
        } else {
            const result = await fetchOaList(NumsOneTime)
            const data = JSON.parse(result)
            const oaData = formatData(data)
            // 保存or更新
            try {
                // 存在则更新，不存在则保存
                await ctx.model.Stu.OA.bulkCreate(oaData, {
                    updateOnDuplicate: ['title', 'department', 'publishDate']
                })
            } catch (err) {
                ctx.logger.warn(err)
                throw ctx.helper.createError('[爬取oa存数据库定时任务] 插入保存oa数据 未知错误')
            }
        }
    },
}
