/**
*@author onz3v
*@title 天气
*@platform qq wx tg web
*@rule ?天气
*/

const $ = sender
const city = $.param(1)
// dependence
const getVarType = function (o) {
    return (Object.prototype.toString.call(o).match(/\[object (.*?)\]/) || [])[1].toLowerCase();
};

start();
function start() {
    const result = request("http://api.tianapi.com/tianqi/index?key=48cdf94f7009180754be835f9b7da2c6&city=" + city);
    let body = JSON.parse(result.body)
    let data = body.newslist;
    let replyText = "----" + city + "7天天气----\n";
    for (let i = 0; i < data.length; i++) {
        replyText += `${i + 1}、日期：${data[i].date}\n🌡\t${data[i].lowest}-${data[i].highest}\n☁\t${data[i].weather}\n`;
    }
    $.reply(replyText)
    sleep(500)
    $.reply('可回复编号查看对应天天气，栓q退出');
    let times = 0
    $.listen(($$) => {
        console.log(`用户回复：${$$.getContent()}`)
        let input = $$.getContent();
        if(input.toLowerCase() == 'q') return $.reply('已退出操作');
        times++
        if (times > 7) return $.reply("行了行了，没数了，还看");
        if (Number(input) > 0 && Number(input) <= data.length) {
            let index = input - 1
            let newText = `⌚时间：${data[index]["date"]}\n\n⌛星期：${data[index]["week"]}\n\n🌞早晚天气变化：${data[index]["weather"]}\n\n🌡温度：${data[index]["real"]}\n\n⛱最低温:${data[index]["lowest"]}\n\n⛱最高温：${data[index]["highest"]}\n\n🌬风向：${data[index]["wind"]}\n\n🌬风速km/h：${data[index]["winddeg"]}\n\n🌬风力：${data[index]["windspeed"]}\n\n☂紫外线强度指数：${data[index]["vis"]}\n\n👁能见度/公里：${data[index]["humidity"]}\n\n🧥生活指数提示：${data[index]["tips"]}`
            $.reply(newText)
            sleep(500)
            return $$.holdOn("收到，如需继续查看请继续回复，栓q退出")
        } else return $.reply('非法操作')
    })

}
