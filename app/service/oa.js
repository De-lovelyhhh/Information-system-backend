// app/service/oauth.js

const request_promise = require('request-promise')
const Service = require('egg').Service
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const FORMAT_DATA = Symbol('FORMAT_DATA') // 格式化以及组装搜索回来的数据
const FORMAT_ARTICLE = Symbol('FORMAT_ARTICLE') // 处理oa文章格式
const GET_VALID_TITLE = Symbol('GET_VALID_TITLE') // 获取易班的有效标题
const UNIFORM_ARTICLE_FORMAT = Symbol('UNIFORM_ARTICLE FORMAT') // 统一oa文章格式（跟我喊，易班辣鸡，易班辣鸡，易班辣鸡）
const GET_ATTACHMENT = Symbol('GET_ATTACHMENT') // 获取附件内容
// const OAListURL = 'https://yiban.stu.edu.cn/api/api/oalist' // 易班oa列表接口
const OADetailURL = 'https://yiban.stu.edu.cn/api/api/oadetail'
const WeChatOAURL = 'http://wechat.stu.edu.cn/webservice_oa/oa_stu_/GetDoc'

class OaService extends Service {
    // oa获取列表
    async getOAList(row_start, row_end, subcompany_id = '0') {
        const { ctx, app } = this
        let result
        const options = {
            url: WeChatOAURL,
            qs: {
                token: 'stu', // 该参数不为空即可
                subcompany_id: subcompany_id,
                keyword: '',
                row_start,
                row_end
            }
        }
        try {
            result = await request_promise(options)
        } catch (err) {
            ctx.logger.warn(err)
            throw ctx.helper.createError('[OA-获取OA列表]未知错误', app.errCode.OaService.getOAList_unknow_error)
        }
        // 格式化以及组装返回的数据
        const data = this[FORMAT_DATA](result)
        return data
    }
    // oa获取详情
    async getOADetails(id) {
        const { ctx, app } = this
        let result
        const options = {
            url: OADetailURL,
            qs: {
                id: id,
                onlyText: false // 默认返回html代码
            }
        }
        try {
            result = await request_promise(options)
        } catch (err) {
            ctx.logger.warn(err)
            throw ctx.helper.createError('[OA-获取OA详情]未知错误', app.errCode.OaService.getOADetails_unknow_error)
        }
        return !(result === '\r\n\t\t\t\t\t\t\t\t\t') ? this[FORMAT_ARTICLE](result) : { title: null, content: null }
    }
    // 处理oa文章格式
    // TODO:oa处理的函数写的不是很好，有待优化。少年，以后是你们的天下了。
    async [FORMAT_ARTICLE](article) {
    // 获取统一格式的oa html页面
        const html = await this[UNIFORM_ARTICLE_FORMAT](article)
        const dom = new JSDOM(html)
        const document = dom.window.document
        // 获取有效标题
        const title = await this[GET_VALID_TITLE](document)
        // 获取文章内容
        let content = document.body.innerHTML
        // 获取附件内容
        let attachment = await this[GET_ATTACHMENT](content)
        content = content.replace(/<p class="mt-5">.+>/, '')
        // 把content中的双引号换成单引号，从而避免content返回的时候，由于双引号内部有双引号从而程序自动为内部双引号加上\影响展示。
        content = content.replace(/"/g, '\'')
        return {
            title,
            content,
            attachment
        }
    }

    // 统一oa文章格式-解决易班oa返回的文章格式各种各样，需要统一成都是用<p>标签作为换行的格式，并且p标签是body的子节点。
    async [UNIFORM_ARTICLE_FORMAT](article) {
    // replace把&#160替换成&nbsp，删去<o:p></o:p> <span></span> <font></font> \t
        let temp = article.replace(/&#160/g, '&nbsp')
        temp = temp.replace(/<o:p.*?>/g, '').replace(/<\/o:p>/g, '')
        temp = temp.replace(/<span.*?>/g, '').replace(/<\/span>/g, '')
        temp = temp.replace(/<font.*?>/g, '').replace(/<\/font>/g, '')
        temp = temp.replace(/\t/g, '')
        // 分类文章，把某些特殊文章转成我们要的格式
        let arr = temp.match(/div/g) || []
        // 处理用div标签把正文部分包起来的文章，方法是把div标签去掉
        if (arr.length === 2) {
            temp = temp.replace(/<div.*?>|<\/div>/g, '')
            return temp
        }
        // 处理用div标签分行布局的文章，方法是把div标签换成p标签
        else if (arr.length > 2) {
            temp = temp.replace(/<div.*?>/g, '<p>').replace(/<\/div>/g, '')
            return temp
        }
        // 处理标题是用h标签包含的文航，方法是把h标签换成p标签h
        arr = temp.match(/<h/g) || []
        if (arr.length === 1) {
            temp = temp.replace(/<h.*?>/g, '<p>').replace(/<\/h.*?>/g, '</p>')
            return temp
        }
        // 待定，因为可以以后会有其他不同格式的文章。TODO:易班辣鸡 易班辣鸡 易班辣鸡
        return temp
    }
    // 获取oa文章的有效标题
    // 下面代码解决了①标题分在多个p标签但是它的p标签的align为center的情况②标题p标签没有align属性下获取标题③标题不在第一行的情况。
    // TODO:需要优化，建议以后不要用易班，另找方案。
    async [GET_VALID_TITLE](document) {
    // 解决②标题p标签没有align属性下获取标题③标题不在第一行的情况。
        const p = document.getElementsByTagName('p')
        let title = ''
        title = title + p[0].textContent
        document.body.removeChild(p[0])
        while (title === '') {
            title = p[0].textContent
            document.body.removeChild(p[0])
        }
        // 解决①标题分在多个p标签但是它的p标签的align为center的情况
        let NeedDeleteNode = [] // 需要删除的结点下标
        for (let ele in p) {
            if (p[ele].align === 'center') {
                title = title + p[ele].textContent
                NeedDeleteNode.push(ele)
            } else {
                break
            }
        }
        // 删除标题部分p标签
        NeedDeleteNode.forEach(err => {
            document.body.removeChild(p[0])// 之所以为p[0]是因为当删除了0下标，前面的1下标会变成0下标
        })
        return title
    }
    // 获取附件内容
    async [GET_ATTACHMENT](content) {
        let attachment = []
        let str = content.match(/<p class="mt-5">(.+)</) || ''// 获取附件部分的字符串，目的：防止后面获取a标签内容把邮箱也获取了。
        if (str === '') {
            return []
        }
        let result = str[0].match(/href="(.+?)>(.+?)<\/a>/g) || []
        result.forEach(err => {
            const temp = err.match(/href="(.+?)">(.+?)<\//)
            attachment.push({
                name: temp[2],
                url: temp[1]
            })
        })
        return attachment
    }

    async [FORMAT_DATA](result) {
        let data = []
        const temp = JSON.parse(result)
        temp.forEach(ele => {
            // 公众号接口问题，有一些通知时间为null，if语句用于过滤掉时间为null的通知
            if (ele.DOCVALIDDATE !== null) {
                data.push({
                    title: ele.DOCSUBJECT,
                    publishDate: ele.DOCVALIDDATE + ' ' + ele.DOCVALIDTIME,
                    department: ele.SUBCOMPANYNAME,
                    id: ele.ID
                })
            }
        })
        return data
    }
    // 删除某条oa
    async delete(id) {
        const { app, ctx } = this
        // 检查该id的oa是否真的为空（防止误删或者恶意删）s
        const result = await this.getOADetails(id)
        if (result.content) {
            throw ctx.helper.createError('[OA-删除功能]该oa文章存在，不能删除', app.errCode.OaService.delete_article_exist)
        }
        const OA = ctx.model.Stu.OA
        try {
            OA.destroy({
                where: { id: id }
            })
        } catch (err) {
            ctx.logger.warn(err)
            throw ctx.helper.createError('[OA-删除功能]未知错误', app.errCode.OaService.delete_DB_unknow_error)
        }
    }

}

module.exports = OaService
