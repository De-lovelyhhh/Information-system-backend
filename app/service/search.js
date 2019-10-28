const Service = require('egg').Service


class SearchService extends Service {
    /**
     * 检查搜索输入的关键字格式
     * @param pattern
     * @return {Promise<void>}
     */
    async searchPatternCheck(pattern) {
        const { ctx } = this
        ctx.validate({
            'begin_date': 'date?',
            'end_date': 'date?',
            'ncs_keyword': 'string',
            'opt_keyword': 'string?',
            'excld_keyword': 'string?'
        }, pattern)
        return
    }

    /**
     * OA精确搜索
     * @param begin_date
     * @param end_date
     * @param ncs_keyword
     * @param opt_keyword
     * @param excld_keyword
     * @return {Promise<void>}
     */
    async searchOA(begin_date, end_date, ncs_keyword, opt_keyword, excld_keyword) {
        const { ctx, app } = this
        // 起始日期默认值
        const begin = begin_date || '1970-01-01'
        const end = end_date || '2099-01-01'
        // 为防止undefined调用trim与replace方法抛错，先将undefined变量赋予空字符串值
        let ncs = ncs_keyword || ''
        ncs = ncs.trim().replace(/\s+/g, ' +')
        if (ncs !== '') ncs = '+' + ncs
        let opt = opt_keyword || ''
        opt = opt.trim().replace(/\s+/g, ' ')
        let excld = excld_keyword || ''
        excld = excld.trim().replace(/\s+/g, ' -')
        if (excld !== '') excld = '-' + excld
        const search_pattern = ncs + ' ' + excld + ' ' + opt
        const search_result = await app.model.query('SELECT id,department,title,publish_date FROM oa WHERE match(department,title) against(? in boolean mode) and publish_date BETWEEN ? and ?',
            { replacements: [search_pattern, begin, end], type: ctx.app.Sequelize.SELECT })
        return search_result[0]
    }
    async searchMoment(begin_date, end_date, ncs_keyword, opt_keyword, excld_keyword) {
        const { ctx, app } = this
        // 起始日期默认值
        const begin = begin_date || '1970-01-01'
        const end = end_date || '2099-01-01'
        // 为防止undefined调用trim与replace方法抛错，先将undefined变量赋予空字符串值
        let ncs = ncs_keyword || ''
        ncs = ncs.trim().replace(/\s+/g, ' +')
        if (ncs !== '') ncs = '+' + ncs
        let opt = opt_keyword || ''
        opt = opt.trim().replace(/\s+/g, ' ')
        let excld = excld_keyword || ''
        excld = excld.trim().replace(/\s+/g, ' -')
        if (excld !== '') excld = '-' + excld
        const search_pattern = ncs + ' ' + excld + ' ' + opt
        const search_result_essay = await app.model.query('SELECT * FROM wechat_essay WHERE match(user_id,content) against(? in boolean mode) and created_at BETWEEN ? and ?',
            { replacements: [search_pattern, begin, end], type: ctx.app.Sequelize.SELECT })
        const search_result_comment = await app.model.query('SELECT * FROM wechat_essay_comment WHERE match(user_id,content) against(? in boolean mode) and created_at BETWEEN ? and ?',
            { replacements: [search_pattern, begin, end], type: ctx.app.Sequelize.SELECT })
        return { essay: search_result_essay[0], comment: search_result_comment[0] }
    }
}

module.exports = SearchService
