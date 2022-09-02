//频道:https://t.me/sillyGirl_Plugin

//部分活动不同仓库监控变量不同，可能会有错漏，欢迎反馈

//本插件为接口整合版，接口来自Noaln、Windfgg与WALL，其中Windfgg与WALL接口需自行申请token
//WindfggToken申请tg https://t.me/windfgg_chart，获取后set otto WindfggToken 你的token
//WALL申请tg https://t.me/WALL_E_API,获取后set otto WALL 你的token

//使用方式：直接发口令或者jx+口令

// [rule:^jx\s[\s\S]+]
// [rule:[\s\S]*[(|)|#|@|$|%|¥|￥|!|！]([0-9a-zA-Z]{10,14})[(|)|#|@|$|%|¥|￥|!|！][\s\S]*]

/***************************配置项******************************/
//是否对非管理员的口令静默，静默1，不静默0，默认不静默
//使用命令set jd_cookie jxjm 1（或者0）进行设置
const Silent=bucketGet("jd_cookie","jxjm")


//如果对非管理员口令静默，将解析与监控结果发送给某人或者发送到某个群
const NotifyTo={
        imType:"tg",//发送到指定渠道,如qq,wx,必须
        userID:"1748961147",//用户id,可选
        groupCode:""//群id，可选
    }

//精简推送模式，精简模式将仅通知解析到的变量或者链接，设置为1时将仅推送精简消息,0为全量推送，默认推送完整信息
//使用命令set jd_cookie jxtjj 1（或者0）进行设置
const Lite=bucketGet("jd_cookie","jxjj")

//解析黑名单，对某账号消息一律不解析，一般无需填写，出现某人消息经常误触发解析时可将对方id填入黑名单	
const BlackList=["id1","id2"]
/****************************************************************/
//2022-8-11 v1.1 添加非管理员口令静默解析选项，以及解决部分口令解析通知失败的问题
//2022-8-12 v1.1.1添加部分变量
//2022-8-13 v1.2 添加解析黑名单机制,修复wall接口解析失败的通知问题
//2022-8-14 v1.3 添加简洁通知模式
//2022-8-14 v1.3.1 修复微信端解析可能存在的问题
//2022-8-15 v1.3.2 修复静默模式解析失败不静默的问题


main()


function main(){
	let uid=GetUserID(),chatid=GetChatID(),imtype=GetImType(),uname=GetUsername(),chatname=GetChatname()
	let tipid=""
	for(let i=0;i<BlackList.length;i++)
		if(BlackList[i]==uid)
			return
	if(isAdmin()||Silent==0)
		tipid=sendText("正在解析...")
	let msg=GetContent(),JDCODE=""
	let notify="",DPS="", spy=""
	
	if(msg.indexOf("jx")!=-1)
		JDCODE=msg.slice(3,msg.length-1)
	else
		JDCODE=msg
	
	let info=NolanDecode(JDCODE)
	if(info!=null)
		DPS="\n\n--本次解析服务由Nolan提供"
	else{
		info=WallDecode(JDCODE)
		if(info!=null)
			DPS="\n\n--本次解析服务由WALL提供"
		else{
			info=WindfggDecode(JDCODE)
			if(info!=null)
				DPS="\n\n--本次解析服务由Windfgg提供"
			else{
				if(isAdmin()||Silent==0){
					RecallMessage(tipid)
					sendText("解析失败")
					Continue()
					return					
				}
				else{
					NotifyTo["content"]="解析来自"+imtype+"私聊【"+uname+"】的口令\n\n"+JDCODE+"\n\n解析失败！"
					push(NotifyTo)
					return
				}
			}
			
		}
		
	}
	
	let img=info.img
	let title=info.title
	let sharefrom=info.userName
	let url=info.jumpUrl
	let activityId=GetActivityId(url)
	notify+="\n--------口令解析--------\n【"+title+"】\n解析链接:"+url+"\n分享者:"+sharefrom+"\n活动ID:"+activityId

	if(activityId!=null){
		if(url.indexOf("https://cjhydz-isv.isvjcloud.com/wxTeam/activity")!=-1)
			spy+="\n【CJ组队瓜分】\nexport jd_cjhy_activityId=\"" + activityId+"\""
		
		else if(url.indexOf("https://lzkjdz-isv.isvjcloud.com/wxTeam/activity")!=-1)
			spy+="\n【LZ组队瓜分】\nexport jd_zdjr_activityId=\"" + activityId+"\""
		
		else if(url.indexOf("https://jinggengjcq-isv.isvjcloud.com")!=-1)
			spy+="\n【大牌联合开卡】\nexport DPLHTY=\"" + activityId+"\""						
		else if(url.indexOf("https://cjhy-isv.isvjcloud.com/wxInviteActivity/openCard/invitee")!=-1)
			spy+="\n【CJ入会有礼】\nexport VENDER_ID=\"" + activityId+"\""
		
		else if(url.indexOf("https://cjhydz-isv.isvjcloud.com/microDz/invite/activity")!=-1)
			spy+="\n【CJ微定制】\nexport jd_wdz_activityId=\"" + activityId+"\""
		
		else if(url.indexOf("https://lzkjdz-isv.isvjcloud.com/wxShareActivity/activity")!=-1)
			spy+="\n【LZ分享有礼】\nexport jd_fxyl_activityId=\"" + activityId+"\""
		
		else if(url.indexOf("https://lzkjdz-isv.isvjcloud.com/wxCollectCard")!=-1){
			spy+="\n【LZ集卡抽奖】\nexport M_WX_COLLECT_CARD_URL=\"" + url+"\""//wall库
			spy+="\nexport jd_wxCollectCard_activityId=\""+ activityId+"\""//kr库
			
		}
				
		else if(url.indexOf("https://lzkj-isv.isvjd.com/wxCollectionActivity/activity2")!=-1){
			spy+="\n【LZ加购有礼】\nexport M_WX_ADD_CART_URL=\"" + url+"\""//wall库
			spy+="\nexport jd_lzaddCart_activityId=\""+ activityId+"\""//kr库
			spy+="\nexport jd_lzkj_wxCollectionActivityId=\""+ activityId+"\""//环境保护库
		}
		
		else if(url.indexOf("https://cjhy-isv.isvjcloud.com/wxCollectionActivity/activity")!=-1)
			spy+="\n【CJ加购有礼】\nexport jd_cjhy_wxCollectionActivityId=\"" + activityId+"\""//环境保护库
		
		
		else if(url.indexOf("https://lzkj-isv.isvjcloud.com/lzclient")!=-1){
			spy+="\n【LZ幸运抽奖】\nexport M_WX_LUCK_DRAW_URL=\"" + url+"\""//wall库
			spy+="\nexport LUCK_DRAW_URL=\""+ url+"\""//kr库
			spy+="\nexport jd_lzkj_wxDrawActivity_Id=\""+ activityId+"\""//环境保护库
		}
		else if(url.indexOf("https://lzkj-isv.isvjcloud.com/wxDrawActivity/activity")!=-1){
//			spy+="\n【LZ幸运抽奖】\nexport M_WX_LUCK_DRAW_URL=\"" + url+"\""//wall库
			spy+="\nexport LUCK_DRAW_URL=\""+ url+"\""//kr库
//			spy+="\nexport jd_lzkj_wxDrawActivity_Id=\""+ activityId+"\""//环境保护库
		}
		
		else if(url.indexOf("https://cjhy-isv.isvjcloud.com/wxDrawActivity/activity")!=-1){
			spy+="\n【CJ幸运抽奖】\nexport M_WX_LUCK_DRAW_URL=\"" + url+"\""//wall库
			spy+="\nexport LUCK_DRAW_URL=\""+ url+"\""//kr库
			spy+="\nexport jd_cjhy_wxDrawActivity_Id=\""+ activityId+"\""//环境保护库
		}
		
		else if(url.indexOf("https://lzkj-isv.isvjcloud.com/wxgame/activity")!=-1)
			spy+="\n【LZ店铺通用游戏】\nexport WXGAME_ACT_ID=\"" + activityId+"\""
		
		else if(url.indexOf("https://lzkjdz-isv.isvjcloud.com/wxSecond")!=-1)
			spy+="\n【LZ读秒拼手速】\nexport jd_wxSecond_activityId=\"" + activityId+"\""
		
		else if(url.indexOf("https://lzkjdz-isv.isvjcloud.com/wxCartKoi/cartkoi")!=-1)
			spy+="\n【LZ购物车锦鲤】\nexport jd_wxCartKoi_activityId=\"" + activityId+"\""	
			
		else if(url.indexOf("https://lzkj-isv.isvjd.com/drawCenter")!=-1||url.indexOf("https://lzkj-isv.isvjcloud.com/drawCenter")!=-1){
			spy+="\n【LZ刮刮乐&&老虎机抽奖】\nexport jd_drawCenter_activityId=\"" + activityId+"\""
			spy+="\n\nexport M_WX_CENTER_DRAW_URL=\"" + url+"\""			
		}
				
		else if(url.indexOf("https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity")!=-1)
			spy+="\n【LZ粉丝互动】\nexport jd_wxFansInterActionActivity_activityId=\"" + activityId+"\""
					
		else if(url.indexOf("https://prodev.m.jd.com/mall/active/dVF7gQUVKyUcuSsVhuya5d2XD4F")!=-1)
			spy+="\n【邀好友赢大礼】\nexport yhyauthorCode=\"" + activityId+"\""
			
		else if(url.indexOf("https://lzkj-isv.isvjcloud.com/wxShopFollowActivity")!=-1)
			spy+="\n【LZ店铺关注抽奖】\nexport jd_wxShopFollowActivity_activityId=\"" + activityId+"\""
	}
	
	
	if(tipid!="")
		RecallMessage(tipid)
	if(isAdmin()||Silent!=1){//管理员或者非静默
		if(Lite!=1){//全量推送
			if(spy!=""){
				if(sendText(image(img)+notify+"\n\n------变量解析监控------"+spy+DPS)=="")
					sendText(notify+"\n\n------变量解析监控------"+spy+DPS)		
				breakIn(spy)				
			}
			else{
				if(sendText(image(img)+notify+"\n未收录该活动\n可联系作者 https://t.me/sillyGirl_Plugin"+DPS)=="")
					sendText(notify+"\n未收录该活动\n可联系作者 https://t.me/sillyGirl_Plugin"+DPS)				
			}
		}
		else{//轻量推送
			if(spy!=""){
				sendText(spy)
				breakIn(spy)
			}
			else{
				sendText(url+"\n未收录该活动\n可联系作者 https://t.me/sillyGirl_Plugin")
			}
		}
	}
	else{//静默模式,非管理员口令
		let tip=""
		if(chatid==0)
			tip="解析来自"+imtype+"私聊【"+uname+"】的口令\n\n"+JDCODE
		else
			tip="解析来自"+imtype+"群聊【"+chatname+":"+uname+"】的口令\n\n"+JDCODE
		if(Lite!=1){//全量推送
			if(spy!="")
				NotifyTo["content"]=tip+"\n"+notify+"\n\n------变量解析监控------"+spy+DPS
			else
				NotifyTo["content"]=tip+"\n"+notify+"\n未收录该活动\n可联系作者 https://t.me/sillyGirl_Plugin"+DPS		
		}
		else{//轻量推送
			if(spy!="")
				NotifyTo["content"]=tip+spy
			else
				NotifyTo["content"]=tip+url+"\n未收录该活动\n可联系作者 https://t.me/sillyGirl_Plugin"			
		}	
		if(spy!=""){
			push(NotifyTo)
			NotifyTo["content"]=sillyGirl.session(spy)().message
			push(NotifyTo)
		}
		else{
			push(NotifyTo)
		}		
	}
	return
}




//WALL接口解析
function WallDecode(code){
	let data = request({
             url: "http://ailoveu.eu.org:19840/jCommand",
             headers: {
				"User-Agent": "Mozilla/5.0 (Linux; U; Android 11; zh-cn; KB2000 Build/RP1A.201005.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 HeyTapBrowser/40.7.19.3 uuid/cddaa248eaf1933ddbe92e9bf4d72cb3",
				"Content-Type": "application/json;charset=utf-8",
				"token": get("WALL")
			},
            method: "post",
            dataType: "json",
            body: {"code": code}
    })
	try{
//		sendText(data)
		if(data.code==200&&data.data!="无法解析该口令")
			return data.data
		else
			return 	null	
	}
	catch(err){
		return null
	}
	return null
}




//Windfgg接口解析
function WindfggDecode(code){
	let data = request({
			url: "http://api.windfgg.cf/jd/code",
			headers: {
				"User-Agent":
			"Mozilla/5.0 (Linux; U; Android 11; zh-cn; KB2000 Build/RP1A.201005.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 HeyTapBrowser/40.7.19.3 uuid/cddaa248eaf1933ddbe92e9bf4d72cb3",
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": "Bearer " + get("WindfggToken")
			},
			method: "post",
			dataType: "json",
			body: { "code": code }
		})
	try{
//		sendText(data)
		if(data.code==200)
			return data.data
		else
			return 	null	
	}
	catch(err){
		return null
	}
	return null
}

//nolan接口解析
function NolanDecode(code){
	let resp=request({
			url:"https://api.nolanstore.top/JComExchange",
			method:"post",
			headers:{
				accept: "application/json",
				contentType:"application/json"
			},
			dataType:"json",
			body:{"code": code}
	})
	try{
//		sendText(resp)
		let data=JSON.parse(resp)
		if(data.code==0)
			return data.data
		else
			return 	null	
	}
	catch(err){
		return null
	}
	return null
}
//提取活动id
function GetActivityId(url){
	try{
		let params=url.split("?")[1]
		if(params.indexOf("activityId")!=-1)
			return params.match(/(?<=activityId=)[^&]+/g)
		else if(params.indexOf("actId")!=-1)
			return params.match(/(?<=actId=)[^&]+/g)
		else if(params.indexOf("venderId")!=-1)
			return params.match(/(?<=venderId=)[^&]+/g)
		else if(params.indexOf("code")!=-1)
			return params.match(/(?<=code=)[^&]+/g)	
	}
	catch(err){
		return null
	}
	return null
}

