const Controller = require('egg').Controller

class OaController extends Controller {
    async getOAList() {
        const { ctx } = this
        // 验证参数
        const options = {
            row_start: 'string',
            row_end: 'string',
            subcompany_id: 'string?'
        }
        ctx.validate(options, ctx.query)
        const { row_start, row_end, subcompany_id } = ctx.query
        ctx.body = await ctx.service.oa.getOAList(row_start, row_end, subcompany_id)
    }
    async getOADetails() {
        const { ctx } = this
        // 验证参数
        const options = {
            id: 'string',
        }
        ctx.validate(options, ctx.query)
        const { id } = ctx.query
        ctx.body = await ctx.service.oa.getOADetails(id)
    }
    async search() {
        const { ctx } = this
        // 验证参数
        await ctx.service.search.searchPatternCheck(ctx.request.body)
        const { begin_date, end_date, ncs_keyword, opt_keyword, excld_keyword } = ctx.request.body
        let search_result
        search_result = await ctx.service.search.searchOA(begin_date, end_date, ncs_keyword, opt_keyword, excld_keyword)
        ctx.body = search_result
    }
    async delete() {
        const { ctx } = this
        // 验证参数
        const options = {
            id: 'string',
        }
        ctx.validate(options, ctx.query)
        const { id } = ctx.query
        await ctx.service.oa.delete(id)
        ctx.body = {}
    }
}

module.exports = OaController
