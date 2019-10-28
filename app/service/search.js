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
            'search_mode': ['exact', 'vague'],
            'begin_date': 'date?',
            'end_date': 'date?',
        }, pattern)
        switch (pattern.search_mode) {
            case 'exact':
                ctx.validate({
                    'ncs_keyword': 'string',
                    'opt_keyword': 'string?',
                    'excld_keyword': 'string?'
                }, pattern)
                break
            case 'vague':
                ctx.validate({
                    'keyword': 'string'
                }, pattern)
                break
        }
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
    async searchOA_exact(begin_date, end_date, ncs_keyword, opt_keyword, excld_keyword) {
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

    /**
     * OA模糊搜索
     * @param begin_date
     * @param end_date
     * @param keyword
     * @return {Promise<void>}
     */
    async searchOA_vague(begin_date, end_date, keyword) {

    }
}

module.exports = SearchService
