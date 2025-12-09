// ignore
//@name:[禁] 姐姐视频
//@version:2
//@webSite:https://wap.jiejiesp19.xyz
//@remark:
//@type:100
//@instance:jiejie20240831
//@isAV:1
//@order: E
import { } from '../../core/uzVideo.js'
import { } from '../../core/uzHome.js'
import { } from '../../core/uz3lib.js'
import { } from '../../core/uzUtils.js'
// ignore

class JiejieClass extends WebApiBase {
    constructor() {
        super()
        this.webSite = 'https://wap.jiejiesp19.xyz' 
        this.headers = {
            'User-Agent': 'Mozilla/5.0',
            'Accept-language': 'zh-CN,zh;q=0.9',
        }
        this.cookie = ''
    }

    // 分类列表
    async getClassList(args) {
        let backData = new RepVideoClassList()
        try {
            const pro = await req(this.webSite, { headers: this.headers })
            backData.error = pro.error
            this.cookie = pro.headers['set-cookie']
            const $ = cheerio.load(pro.data)
            let list = []
            $('.stui-header__menu li a').each((_, e) => {
                let name = $(e).text().trim()
                let url = $(e).attr('href')
                if (url && name) {
                    let videoClass = new VideoClass()
                    videoClass.type_id = url.startsWith('http') ? url : this.webSite + url
                    videoClass.type_name = name
                    list.push(videoClass)
                }
            })
            backData.data = list
        } catch (e) {
            backData.error = e.message
        }
        return JSON.stringify(backData)
    }

    // 视频列表
    async getVideoList(args) {
        let backData = new RepVideoList()
        try {
            let headers = this.headers
            headers.cookie = this.cookie
            const pro = await req(args.url, { headers })
            backData.error = pro.error
            const $ = cheerio.load(pro.data)
            let videos = []
            $('.stui-vodlist__box').each((_, e) => {
                let videoDet = new VideoDetail()
                videoDet.vod_id = $(e).find('h4 a').attr('href')
                videoDet.vod_name = $(e).find('h4 a').text().trim()
                videoDet.vod_pic = $(e).find('a.stui-vodlist__thumb').attr('data-original')
                videoDet.vod_remarks = $(e).find('.pic-text').text().trim()
                videos.push(videoDet)
            })
            backData.data = videos
        } catch (error) {
            backData.error = '获取视频列表失败～ ' + error
        }
        return JSON.stringify(backData)
    }

    // 视频详情与播放地址
    async getVideoDetail(args) {
        let backData = new RepVideoDetail()
        try {
            const pro = await req(args.url, { headers: this.headers })
            backData.error = pro.error
            const html = pro.data
            const $ = cheerio.load(html)

            let vod = new VideoDetail()
            vod.vod_id = args.url
            vod.vod_name = $('h1.title').text().trim()
            vod.vod_pic = $('.stui-player__video img').attr('src') || ''
            vod.vod_content = $('.data-more').text().trim()

            let playList = []
            $('.stui-play__list li a').each((_, e) => {
                let name = $(e).text().trim()
                let href = $(e).attr('href')
                if (href) {
                    playList.push(name + '$' + (href.startsWith('http') ? href : this.webSite + href))
                }
            })

            if (playList.length === 0) {
                let m3u8 = (html.match(/https?:\/\/[^"']+\.m3u8/) || [])[0]
                if (m3u8) {
                    playList.push('在线播放$' + m3u8)
                }
            }

            vod.vod_play_from = '播放'
            vod.vod_play_url = playList.join('#')
            backData.data = vod
        } catch (error) {
            backData.error = '获取详情失败～ ' + error
        }
        return JSON.stringify(backData)
    }

    // 搜索
    async getSearchList(args) {
        let backData = new RepVideoList()
        backData.data = []
        try {
            let wd = encodeURIComponent(args.wd)
            let url = `${this.webSite}/index.php/vod/search.html?wd=${wd}`
            const pro = await req(url, { headers: this.headers })
            backData.error = pro.error
            const $ = cheerio.load(pro.data)
            let videos = []
            $('.stui-vodlist__box').each((_, e) => {
                let videoDet = new VideoDetail()
                videoDet.vod_id = $(e).find('h4 a').attr('href')
                videoDet.vod_name = $(e).find('h4 a').text().trim()
                videoDet.vod_pic = $(e).find('a.stui-vodlist__thumb').attr('data-original')
                videoDet.vod_remarks = $(e).find('.pic-text').text().trim()
                videos.push(videoDet)
            })
            backData.data = videos
        } catch (error) {
            backData.error = '搜索失败～ ' + error
        }
        return JSON.stringify(backData)
    }
}