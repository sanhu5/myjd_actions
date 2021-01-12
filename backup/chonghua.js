/*
┎━━┰┒┎┰━━┰━━┰━━┰┒┎┰┒┎┰━━┒
│┎━┦┕┚│┎┒│┎┒│┎┰┦┕┚││││┎┒│
│┕━┦┎┒│┕┚││││┕┚│┎┒│┕┚│┎┒│
┕━━┹┚┕┹━━┹┚┕┹━━┹┚┕┹━━┹┚┕┚
============================================
成功的话请打开App-我的，帮我填下邀请码347770助力
============================================
2021/01/06 修复分享视频判定问题,box增加uid(邀请码),实现今日金币模块，账号异常提醒
2021/01/08 更新boxjs,可以控制日志和通知的开启

============================================
## 1.重写引用：
;到配置文件找到[rewrite_remote]贴代码：

;视频body获取
https://raw.githubusercontent.com/CenBoMin/GithubSync/main/CONGHUA/GetBody.conf, tag=Getbody_CONGHUA, update-interval=86400, opt-parser=false, enabled=true

## 2.定时任务：
到配置文件找到[task_local]贴代码：
cron设置30min循环

30 * * * * https://raw.githubusercontent.com/CenBoMin/GithubSync/main/CONGHUA/chonghua.js, tag=葱花视频, enabled=true

## 3.食用方法：

1.到[重写]-[引用],启动Getbody_CONGHUA

【任务中心请求body】:首页-右下角-点击现金红包-弹出任务中心
【视频请求body】:看视频到获取金币奖励,通知提示body1
【时段奖励请求body】:每天领金币任务,倒计时结束之后,点击"领取"
【分享请求body】:首页任一个视频,点击视频右下角微信分享,跳转微信等待下,通知提示
!备注：没有跳转,换别的视频试试...警告必须只获取3个即可,超出根据提示重新获取）
【分享奖励请求body】:分享过后,回到app跳出红包,点击分享任务-领取

4.手动执行一次定时脚本-”葱花视频”,是不是运行正常

5.提现问题可以直接加QQ官方群822736041,周一到周五群发自己的邀请码找管理员打钱

目前观察脚本没有问题,封号大多是好友不活跃，或者刷视频时间过短,脚本目前刷视频默认1分钟,后续添加随机等待时间

6.后续添加：每日金币，自动提现功能...等

7.【好友助力观看】任务可自己每天手动,分享到自己朋友圈,自己立即观看即可加500金币,一天一次。


*/

const jsname = '葱花视频'
const $ = Env(jsname)
const logs = 1; //0为关闭日志，1为开启,默认为0
const notifyInterval = 0; //0为关闭通知，1为所有通知,默认为0

let task = '';
let tz = '';
let uid = '347494'//--修改成自己的id
let headerVal = {
  'User-Agent': `cong hua shi pin/1.4.6 (iPhone; iOS 14.3; Scale/2.00)`,
  'Accept': `*/*`,
  'Accept-Encoding': `gzip, deflate, br`,
  'Connection': `keep-alive`,
  'Content-Type': `application/x-www-form-urlencoded`,
  'Host': `app.kxp.com`,
  'Accept-Language': `zh-Hans-CN;q=1, en-CN;q=0.9`
};


const taskcenterbodyArr = [];
let taskcenterbodyVal = "";
let TASKCENTERBODY = [];

const sharebodyArr = [];
let sharebodyVal = "";
let SHAREBODY = [];

const sharerewardbodyArr = [];
let sharerewardbodyVal = "";
let SHAREREWARDBODY = [];

const timeredbodyArr = [];
let timeredbodyVal = "";
let TIMEREDBODY = [];

const readbodyArr = [];
let readbodyVal = "";
let READBODY = [];


let readscore = 0;
let sharescore = 0;

let bodys = $.getdata("chgetbody_video");
let bodys2 = $.getdata("chgetbody_share");
let indexLast = $.getdata('chgetbody_video_index');

$.begin = indexLast ? parseInt(indexLast, 10) : 1;

  //--添加自己的cookie
  bodys='app_name=onion_video&app_version=1.4.6&carrier=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A&channel=80000000&device_brand=Apple&device_id=46779&device_model=iPhone%20XR&device_type=iOS&fp=D2qeYlHbw8gsQ0wdf3jMSEhmak4qTkFhm5t6UZzFTN47wX41&language=zh-CN&memory=3G&network_type=WIFI&openudid=887A0ADC-2FD9-4876-D7B9-2E297F9210A7&os_api=14.3&os_version=14.3&resolution=828%2A1792&sign=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJmcCI6IkQycWVZbEhidzhnc1Ewd2RmM2pNU0VobWFrNHFUa0ZobTV0NlVaekZUTjQ3d1g0MSIsInZlcnNpb25fY29kZSI6IjEuNC42IiwibGFuZ3VhZ2UiOiJ6aC1DTiIsInRva2VuX2lkIjoiNmVkOTUwZjNiNTQ3MjdlYjk0Y2U3NTM3ZWRkNmRlOTUiLCJzdG9yYWdlIjoiNjBHIiwiYXBwX25hbWUiOiJvbmlvbl92aWRlbyIsImFwcF92ZXJzaW9uIjoiMS40LjYiLCJuZXR3b3JrX3R5cGUiOiJXSUZJIiwidmlkZW9faWQiOiI5NzY5NTQiLCJjaGFubmVsIjoiODAwMDAwMDAiLCJkZXZpY2VfaWQiOiI0Njc3OSIsInJlc29sdXRpb24iOiI4MjglMkExNzkyIiwib3BlbnVkaWQiOiI4ODdBMEFEQy0yRkQ5LTQ4NzYtRDdCOS0yRTI5N0Y5MjEwQTciLCJ0b2tlbiI6Ik1EQXdNREF3TURBd01MeTZvOXlCb0tlc2dwLUJiMzZnakttS2RuOXZ4NFhScmJLcXg1YXhob1dieHVDamw0R2JmWnFOZklhZm1YbWlyWXFHZjJfSGhkR3JzdENwM2E5Mm01aXlxbjJXZ1dWamJ3IiwidWlkIjoiMzQ3NDk0Iiwib3NfYXBpIjoiMTQuMyIsImNhcnJpZXIiOiIlRTQlQjglQUQlRTUlOUIlQkQlRTglODElOTQlRTklODAlOUEiLCJvc192ZXJzaW9uIjoiMTQuMyIsImRldmljZV9tb2RlbCI6ImlQaG9uZStYUiIsImRldmljZV90eXBlIjoiaU9TIiwiZGV2aWNlX2JyYW5kIjoiQXBwbGUiLCJtZW1vcnkiOiIzRyJ9.Zy9TZOWiQMuQijAVnjUaB8zO_yu_YXaTNs61_cY8VdL9bT3zPLwcEGww1SdQ88LERuRuZcFQedRBb7cuvFrPpg&storage=60G&token=MDAwMDAwMDAwMLy6o9yBoKesgp-Bb36gjKmKdn9vx4XRrbKqx5axhoWbxuCjl4GbfZqNfIafmXmirYqGf2_HhdGrstCp3a92m5iyqn2WgWVjbw&token_id=6ed950f3b54727eb94ce7537edd6de95&uid=347494&version_code=1.4.6&video_id=976954#app_name=onion_video&app_version=1.4.6&carrier=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A&channel=80000000&device_brand=Apple&device_id=46779&device_model=iPhone%20XR&device_type=iOS&fp=D2qeYlHbw8gsQ0wdf3jMSEhmak4qTkFhm5t6UZzFTN47wX41&language=zh-CN&memory=3G&network_type=WIFI&openudid=887A0ADC-2FD9-4876-D7B9-2E297F9210A7&os_api=14.3&os_version=14.3&resolution=828%2A1792&sign=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJmcCI6IkQycWVZbEhidzhnc1Ewd2RmM2pNU0VobWFrNHFUa0ZobTV0NlVaekZUTjQ3d1g0MSIsInZlcnNpb25fY29kZSI6IjEuNC42IiwibGFuZ3VhZ2UiOiJ6aC1DTiIsInRva2VuX2lkIjoiNmVkOTUwZjNiNTQ3MjdlYjk0Y2U3NTM3ZWRkNmRlOTUiLCJzdG9yYWdlIjoiNjBHIiwiYXBwX25hbWUiOiJvbmlvbl92aWRlbyIsImFwcF92ZXJzaW9uIjoiMS40LjYiLCJuZXR3b3JrX3R5cGUiOiJXSUZJIiwidmlkZW9faWQiOiI5NzU4MTQiLCJjaGFubmVsIjoiODAwMDAwMDAiLCJkZXZpY2VfaWQiOiI0Njc3OSIsInJlc29sdXRpb24iOiI4MjglMkExNzkyIiwib3BlbnVkaWQiOiI4ODdBMEFEQy0yRkQ5LTQ4NzYtRDdCOS0yRTI5N0Y5MjEwQTciLCJ0b2tlbiI6Ik1EQXdNREF3TURBd01MeTZvOXlCb0tlc2dwLUJiMzZnakttS2RuOXZ4NFhScmJLcXg1YXhob1dieHVDamw0R2JmWnFOZklhZm1YbWlyWXFHZjJfSGhkR3JzdENwM2E5Mm01aXlxbjJXZ1dWamJ3IiwidWlkIjoiMzQ3NDk0Iiwib3NfYXBpIjoiMTQuMyIsImNhcnJpZXIiOiIlRTQlQjglQUQlRTUlOUIlQkQlRTglODElOTQlRTklODAlOUEiLCJvc192ZXJzaW9uIjoiMTQuMyIsImRldmljZV9tb2RlbCI6ImlQaG9uZStYUiIsImRldmljZV90eXBlIjoiaU9TIiwiZGV2aWNlX2JyYW5kIjoiQXBwbGUiLCJtZW1vcnkiOiIzRyJ9.IzItRkr-nKU7kGpeZ7DHyNB5lcyeoRfwgMfEx5ioAnFsYQyz0xA8jGmA6YtiXUueqxrNWvRRBV3L0Nfv3JKraA&storage=60G&token=MDAwMDAwMDAwMLy6o9yBoKesgp-Bb36gjKmKdn9vx4XRrbKqx5axhoWbxuCjl4GbfZqNfIafmXmirYqGf2_HhdGrstCp3a92m5iyqn2WgWVjbw&token_id=6ed950f3b54727eb94ce7537edd6de95&uid=347494&version_code=1.4.6&video_id=975814#app_name=onion_video&app_version=1.4.6&carrier=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A&channel=80000000&device_brand=Apple&device_id=46779&device_model=iPhone%20XR&device_type=iOS&fp=D2qeYlHbw8gsQ0wdf3jMSEhmak4qTkFhm5t6UZzFTN47wX41&language=zh-CN&memory=3G&network_type=WIFI&openudid=887A0ADC-2FD9-4876-D7B9-2E297F9210A7&os_api=14.3&os_version=14.3&resolution=828%2A1792&sign=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJmcCI6IkQycWVZbEhidzhnc1Ewd2RmM2pNU0VobWFrNHFUa0ZobTV0NlVaekZUTjQ3d1g0MSIsInZlcnNpb25fY29kZSI6IjEuNC42IiwibGFuZ3VhZ2UiOiJ6aC1DTiIsInRva2VuX2lkIjoiNmVkOTUwZjNiNTQ3MjdlYjk0Y2U3NTM3ZWRkNmRlOTUiLCJzdG9yYWdlIjoiNjBHIiwiYXBwX25hbWUiOiJvbmlvbl92aWRlbyIsImFwcF92ZXJzaW9uIjoiMS40LjYiLCJuZXR3b3JrX3R5cGUiOiJXSUZJIiwidmlkZW9faWQiOiI5NzQ4MDEiLCJjaGFubmVsIjoiODAwMDAwMDAiLCJkZXZpY2VfaWQiOiI0Njc3OSIsInJlc29sdXRpb24iOiI4MjglMkExNzkyIiwib3BlbnVkaWQiOiI4ODdBMEFEQy0yRkQ5LTQ4NzYtRDdCOS0yRTI5N0Y5MjEwQTciLCJ0b2tlbiI6Ik1EQXdNREF3TURBd01MeTZvOXlCb0tlc2dwLUJiMzZnakttS2RuOXZ4NFhScmJLcXg1YXhob1dieHVDamw0R2JmWnFOZklhZm1YbWlyWXFHZjJfSGhkR3JzdENwM2E5Mm01aXlxbjJXZ1dWamJ3IiwidWlkIjoiMzQ3NDk0Iiwib3NfYXBpIjoiMTQuMyIsImNhcnJpZXIiOiIlRTQlQjglQUQlRTUlOUIlQkQlRTglODElOTQlRTklODAlOUEiLCJvc192ZXJzaW9uIjoiMTQuMyIsImRldmljZV9tb2RlbCI6ImlQaG9uZStYUiIsImRldmljZV90eXBlIjoiaU9TIiwiZGV2aWNlX2JyYW5kIjoiQXBwbGUiLCJtZW1vcnkiOiIzRyJ9.29Htxv-vAczQilxPqfBgFYF9XSkzxAuHorAjMUkB7S57qE3ksEwcnfRXgOahQEThLbmHOcQC9Kdf_sewzlgwVw&storage=60G&token=MDAwMDAwMDAwMLy6o9yBoKesgp-Bb36gjKmKdn9vx4XRrbKqx5axhoWbxuCjl4GbfZqNfIafmXmirYqGf2_HhdGrstCp3a92m5iyqn2WgWVjbw&token_id=6ed950f3b54727eb94ce7537edd6de95&uid=347494&version_code=1.4.6&video_id=974801#app_name=onion_video&app_version=1.4.6&carrier=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A&channel=80000000&device_brand=Apple&device_id=46779&device_model=iPhone%20XR&device_type=iOS&fp=D2qeYlHbw8gsQ0wdf3jMSEhmak4qTkFhm5t6UZzFTN47wX41&language=zh-CN&memory=3G&network_type=WIFI&openudid=887A0ADC-2FD9-4876-D7B9-2E297F9210A7&os_api=14.3&os_version=14.3&resolution=828%2A1792&sign=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJmcCI6IkQycWVZbEhidzhnc1Ewd2RmM2pNU0VobWFrNHFUa0ZobTV0NlVaekZUTjQ3d1g0MSIsInZlcnNpb25fY29kZSI6IjEuNC42IiwibGFuZ3VhZ2UiOiJ6aC1DTiIsInRva2VuX2lkIjoiNmVkOTUwZjNiNTQ3MjdlYjk0Y2U3NTM3ZWRkNmRlOTUiLCJzdG9yYWdlIjoiNjBHIiwiYXBwX25hbWUiOiJvbmlvbl92aWRlbyIsImFwcF92ZXJzaW9uIjoiMS40LjYiLCJuZXR3b3JrX3R5cGUiOiJXSUZJIiwidmlkZW9faWQiOiI5NzYyNzYiLCJjaGFubmVsIjoiODAwMDAwMDAiLCJkZXZpY2VfaWQiOiI0Njc3OSIsInJlc29sdXRpb24iOiI4MjglMkExNzkyIiwib3BlbnVkaWQiOiI4ODdBMEFEQy0yRkQ5LTQ4NzYtRDdCOS0yRTI5N0Y5MjEwQTciLCJ0b2tlbiI6Ik1EQXdNREF3TURBd01MeTZvOXlCb0tlc2dwLUJiMzZnakttS2RuOXZ4NFhScmJLcXg1YXhob1dieHVDamw0R2JmWnFOZklhZm1YbWlyWXFHZjJfSGhkR3JzdENwM2E5Mm01aXlxbjJXZ1dWamJ3IiwidWlkIjoiMzQ3NDk0Iiwib3NfYXBpIjoiMTQuMyIsImNhcnJpZXIiOiIlRTQlQjglQUQlRTUlOUIlQkQlRTglODElOTQlRTklODAlOUEiLCJvc192ZXJzaW9uIjoiMTQuMyIsImRldmljZV9tb2RlbCI6ImlQaG9uZStYUiIsImRldmljZV90eXBlIjoiaU9TIiwiZGV2aWNlX2JyYW5kIjoiQXBwbGUiLCJtZW1vcnkiOiIzRyJ9.6casgpHISHjecYja9XYsQvtEsjRGFBK0V50G6j2OgFm5jqihpFEVbiYIPmoX0hF5188DFVA2pSpaBlUbJnYmCg&storage=60G&token=MDAwMDAwMDAwMLy6o9yBoKesgp-Bb36gjKmKdn9vx4XRrbKqx5axhoWbxuCjl4GbfZqNfIafmXmirYqGf2_HhdGrstCp3a92m5iyqn2WgWVjbw&token_id=6ed950f3b54727eb94ce7537edd6de95&uid=347494&version_code=1.4.6&video_id=976276#app_name=onion_video&app_version=1.4.6&carrier=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A&channel=80000000&device_brand=Apple&device_id=46779&device_model=iPhone%20XR&device_type=iOS&fp=D2qeYlHbw8gsQ0wdf3jMSEhmak4qTkFhm5t6UZzFTN47wX41&language=zh-CN&memory=3G&network_type=WIFI&openudid=887A0ADC-2FD9-4876-D7B9-2E297F9210A7&os_api=14.3&os_version=14.3&resolution=828%2A1792&sign=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJmcCI6IkQycWVZbEhidzhnc1Ewd2RmM2pNU0VobWFrNHFUa0ZobTV0NlVaekZUTjQ3d1g0MSIsInZlcnNpb25fY29kZSI6IjEuNC42IiwibGFuZ3VhZ2UiOiJ6aC1DTiIsInRva2VuX2lkIjoiNmVkOTUwZjNiNTQ3MjdlYjk0Y2U3NTM3ZWRkNmRlOTUiLCJzdG9yYWdlIjoiNjBHIiwiYXBwX25hbWUiOiJvbmlvbl92aWRlbyIsImFwcF92ZXJzaW9uIjoiMS40LjYiLCJuZXR3b3JrX3R5cGUiOiJXSUZJIiwidmlkZW9faWQiOiI5NzY5NTQiLCJjaGFubmVsIjoiODAwMDAwMDAiLCJkZXZpY2VfaWQiOiI0Njc3OSIsInJlc29sdXRpb24iOiI4MjglMkExNzkyIiwib3BlbnVkaWQiOiI4ODdBMEFEQy0yRkQ5LTQ4NzYtRDdCOS0yRTI5N0Y5MjEwQTciLCJ0b2tlbiI6Ik1EQXdNREF3TURBd01MeTZvOXlCb0tlc2dwLUJiMzZnakttS2RuOXZ4NFhScmJLcXg1YXhob1dieHVDamw0R2JmWnFOZklhZm1YbWlyWXFHZjJfSGhkR3JzdENwM2E5Mm01aXlxbjJXZ1dWamJ3IiwidWlkIjoiMzQ3NDk0Iiwib3NfYXBpIjoiMTQuMyIsImNhcnJpZXIiOiIlRTQlQjglQUQlRTUlOUIlQkQlRTglODElOTQlRTklODAlOUEiLCJvc192ZXJzaW9uIjoiMTQuMyIsImRldmljZV9tb2RlbCI6ImlQaG9uZStYUiIsImRldmljZV90eXBlIjoiaU9TIiwiZGV2aWNlX2JyYW5kIjoiQXBwbGUiLCJtZW1vcnkiOiIzRyJ9.Zy9TZOWiQMuQijAVnjUaB8zO_yu_YXaTNs61_cY8VdL9bT3zPLwcEGww1SdQ88LERuRuZcFQedRBb7cuvFrPpg&storage=60G&token=MDAwMDAwMDAwMLy6o9yBoKesgp-Bb36gjKmKdn9vx4XRrbKqx5axhoWbxuCjl4GbfZqNfIafmXmirYqGf2_HhdGrstCp3a92m5iyqn2WgWVjbw&token_id=6ed950f3b54727eb94ce7537edd6de95&uid=347494&version_code=1.4.6&video_id=976954#app_name=onion_video&app_version=1.4.6&carrier=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A&channel=80000000&device_brand=Apple&device_id=46779&device_model=iPhone%20XR&device_type=iOS&fp=D2qeYlHbw8gsQ0wdf3jMSEhmak4qTkFhm5t6UZzFTN47wX41&language=zh-CN&memory=3G&network_type=WIFI&openudid=887A0ADC-2FD9-4876-D7B9-2E297F9210A7&os_api=14.3&os_version=14.3&resolution=828%2A1792&sign=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJmcCI6IkQycWVZbEhidzhnc1Ewd2RmM2pNU0VobWFrNHFUa0ZobTV0NlVaekZUTjQ3d1g0MSIsInZlcnNpb25fY29kZSI6IjEuNC42IiwibGFuZ3VhZ2UiOiJ6aC1DTiIsInRva2VuX2lkIjoiNmVkOTUwZjNiNTQ3MjdlYjk0Y2U3NTM3ZWRkNmRlOTUiLCJzdG9yYWdlIjoiNjBHIiwiYXBwX25hbWUiOiJvbmlvbl92aWRlbyIsImFwcF92ZXJzaW9uIjoiMS40LjYiLCJuZXR3b3JrX3R5cGUiOiJXSUZJIiwidmlkZW9faWQiOiI5NzY5NTQiLCJjaGFubmVsIjoiODAwMDAwMDAiLCJkZXZpY2VfaWQiOiI0Njc3OSIsInJlc29sdXRpb24iOiI4MjglMkExNzkyIiwib3BlbnVkaWQiOiI4ODdBMEFEQy0yRkQ5LTQ4NzYtRDdCOS0yRTI5N0Y5MjEwQTciLCJ0b2tlbiI6Ik1EQXdNREF3TURBd01MeTZvOXlCb0tlc2dwLUJiMzZnakttS2RuOXZ4NFhScmJLcXg1YXhob1dieHVDamw0R2JmWnFOZklhZm1YbWlyWXFHZjJfSGhkR3JzdENwM2E5Mm01aXlxbjJXZ1dWamJ3IiwidWlkIjoiMzQ3NDk0Iiwib3NfYXBpIjoiMTQuMyIsImNhcnJpZXIiOiIlRTQlQjglQUQlRTUlOUIlQkQlRTglODElOTQlRTklODAlOUEiLCJvc192ZXJzaW9uIjoiMTQuMyIsImRldmljZV9tb2RlbCI6ImlQaG9uZStYUiIsImRldmljZV90eXBlIjoiaU9TIiwiZGV2aWNlX2JyYW5kIjoiQXBwbGUiLCJtZW1vcnkiOiIzRyJ9.Zy9TZOWiQMuQijAVnjUaB8zO_yu_YXaTNs61_cY8VdL9bT3zPLwcEGww1SdQ88LERuRuZcFQedRBb7cuvFrPpg&storage=60G&token=MDAwMDAwMDAwMLy6o9yBoKesgp-Bb36gjKmKdn9vx4XRrbKqx5axhoWbxuCjl4GbfZqNfIafmXmirYqGf2_HhdGrstCp3a92m5iyqn2WgWVjbw&token_id=6ed950f3b54727eb94ce7537edd6de95&uid=347494&version_code=1.4.6&video_id=976954';
  bodys2='app_name=onion_video&app_version=1.4.6&carrier=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A&channel=80000000&device_brand=Apple&device_id=46779&device_model=iPhone%20XR&device_type=iOS&fp=D2qeYlHbw8gsQ0wdf3jMSEhmak4qTkFhm5t6UZzFTN47wX41&language=zh-CN&memory=3G&network_type=WIFI&openudid=887A0ADC-2FD9-4876-D7B9-2E297F9210A7&os_api=14.3&os_version=14.3&resolution=828%2A1792&sign=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJmcCI6IkQycWVZbEhidzhnc1Ewd2RmM2pNU0VobWFrNHFUa0ZobTV0NlVaekZUTjQ3d1g0MSIsInZlcnNpb25fY29kZSI6IjEuNC42IiwibGFuZ3VhZ2UiOiJ6aC1DTiIsInRva2VuX2lkIjoiNmVkOTUwZjNiNTQ3MjdlYjk0Y2U3NTM3ZWRkNmRlOTUiLCJzdG9yYWdlIjoiNjBHIiwiYXBwX25hbWUiOiJvbmlvbl92aWRlbyIsImFwcF92ZXJzaW9uIjoiMS40LjYiLCJuZXR3b3JrX3R5cGUiOiJXSUZJIiwidmlkZW9faWQiOiI5NzU2NzAiLCJjaGFubmVsIjoiODAwMDAwMDAiLCJkZXZpY2VfaWQiOiI0Njc3OSIsInJlc29sdXRpb24iOiI4MjglMkExNzkyIiwidHlwZSI6Ind4Iiwib3BlbnVkaWQiOiI4ODdBMEFEQy0yRkQ5LTQ4NzYtRDdCOS0yRTI5N0Y5MjEwQTciLCJ0b2tlbiI6Ik1EQXdNREF3TURBd01MeTZvOXlCb0tlc2dwLUJiMzZnakttS2RuOXZ4NFhScmJLcXg1YXhob1dieHVDamw0R2JmWnFOZklhZm1YbWlyWXFHZjJfSGhkR3JzdENwM2E5Mm01aXlxbjJXZ1dWamJ3IiwidWlkIjoiMzQ3NDk0Iiwib3NfYXBpIjoiMTQuMyIsImNhcnJpZXIiOiIlRTQlQjglQUQlRTUlOUIlQkQlRTglODElOTQlRTklODAlOUEiLCJvc192ZXJzaW9uIjoiMTQuMyIsImRldmljZV9tb2RlbCI6ImlQaG9uZStYUiIsImRldmljZV90eXBlIjoiaU9TIiwiZGV2aWNlX2JyYW5kIjoiQXBwbGUiLCJtZW1vcnkiOiIzRyJ9.xNlYAbGUymj5CeOC4UqeuZxEBJBiuHve2X8LpkkKFbYqBncGQpNiMgPGrMfHllm0MAkwtcrwpgxAuKoi0dpMcw&storage=60G&token=MDAwMDAwMDAwMLy6o9yBoKesgp-Bb36gjKmKdn9vx4XRrbKqx5axhoWbxuCjl4GbfZqNfIafmXmirYqGf2_HhdGrstCp3a92m5iyqn2WgWVjbw&token_id=6ed950f3b54727eb94ce7537edd6de95&type=wx&uid=347494&version_code=1.4.6&video_id=975670#app_name=onion_video&app_version=1.4.6&carrier=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A&channel=80000000&device_brand=Apple&device_id=46779&device_model=iPhone%20XR&device_type=iOS&fp=D2qeYlHbw8gsQ0wdf3jMSEhmak4qTkFhm5t6UZzFTN47wX41&language=zh-CN&memory=3G&network_type=WIFI&openudid=887A0ADC-2FD9-4876-D7B9-2E297F9210A7&os_api=14.3&os_version=14.3&resolution=828%2A1792&sign=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJmcCI6IkQycWVZbEhidzhnc1Ewd2RmM2pNU0VobWFrNHFUa0ZobTV0NlVaekZUTjQ3d1g0MSIsInZlcnNpb25fY29kZSI6IjEuNC42IiwibGFuZ3VhZ2UiOiJ6aC1DTiIsInRva2VuX2lkIjoiNmVkOTUwZjNiNTQ3MjdlYjk0Y2U3NTM3ZWRkNmRlOTUiLCJzdG9yYWdlIjoiNjBHIiwiYXBwX25hbWUiOiJvbmlvbl92aWRlbyIsImFwcF92ZXJzaW9uIjoiMS40LjYiLCJuZXR3b3JrX3R5cGUiOiJXSUZJIiwidmlkZW9faWQiOiI5ODQ0MjgiLCJjaGFubmVsIjoiODAwMDAwMDAiLCJkZXZpY2VfaWQiOiI0Njc3OSIsInJlc29sdXRpb24iOiI4MjglMkExNzkyIiwidHlwZSI6Ind4Iiwib3BlbnVkaWQiOiI4ODdBMEFEQy0yRkQ5LTQ4NzYtRDdCOS0yRTI5N0Y5MjEwQTciLCJ0b2tlbiI6Ik1EQXdNREF3TURBd01MeTZvOXlCb0tlc2dwLUJiMzZnakttS2RuOXZ4NFhScmJLcXg1YXhob1dieHVDamw0R2JmWnFOZklhZm1YbWlyWXFHZjJfSGhkR3JzdENwM2E5Mm01aXlxbjJXZ1dWamJ3IiwidWlkIjoiMzQ3NDk0Iiwib3NfYXBpIjoiMTQuMyIsImNhcnJpZXIiOiIlRTQlQjglQUQlRTUlOUIlQkQlRTglODElOTQlRTklODAlOUEiLCJvc192ZXJzaW9uIjoiMTQuMyIsImRldmljZV9tb2RlbCI6ImlQaG9uZStYUiIsImRldmljZV90eXBlIjoiaU9TIiwiZGV2aWNlX2JyYW5kIjoiQXBwbGUiLCJtZW1vcnkiOiIzRyJ9.jfEQ3PB4ZPEXrW5QG0PYYnmkhz5OyNK6Y3q6JTvVwRU3QFZ4HZaU09lQpeTJrvpzBE-rZOEznklBfcsFUtoMPQ&storage=60G&token=MDAwMDAwMDAwMLy6o9yBoKesgp-Bb36gjKmKdn9vx4XRrbKqx5axhoWbxuCjl4GbfZqNfIafmXmirYqGf2_HhdGrstCp3a92m5iyqn2WgWVjbw&token_id=6ed950f3b54727eb94ce7537edd6de95&type=wx&uid=347494&version_code=1.4.6&video_id=984428#app_name=onion_video&app_version=1.4.6&carrier=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A&channel=80000000&device_brand=Apple&device_id=46779&device_model=iPhone%20XR&device_type=iOS&fp=D2qeYlHbw8gsQ0wdf3jMSEhmak4qTkFhm5t6UZzFTN47wX41&language=zh-CN&memory=3G&network_type=WIFI&openudid=887A0ADC-2FD9-4876-D7B9-2E297F9210A7&os_api=14.3&os_version=14.3&resolution=828%2A1792&sign=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJmcCI6IkQycWVZbEhidzhnc1Ewd2RmM2pNU0VobWFrNHFUa0ZobTV0NlVaekZUTjQ3d1g0MSIsInZlcnNpb25fY29kZSI6IjEuNC42IiwibGFuZ3VhZ2UiOiJ6aC1DTiIsInRva2VuX2lkIjoiNmVkOTUwZjNiNTQ3MjdlYjk0Y2U3NTM3ZWRkNmRlOTUiLCJzdG9yYWdlIjoiNjBHIiwiYXBwX25hbWUiOiJvbmlvbl92aWRlbyIsImFwcF92ZXJzaW9uIjoiMS40LjYiLCJuZXR3b3JrX3R5cGUiOiJXSUZJIiwidmlkZW9faWQiOiI5NzQ4MDEiLCJjaGFubmVsIjoiODAwMDAwMDAiLCJkZXZpY2VfaWQiOiI0Njc3OSIsInJlc29sdXRpb24iOiI4MjglMkExNzkyIiwidHlwZSI6Ind4Iiwib3BlbnVkaWQiOiI4ODdBMEFEQy0yRkQ5LTQ4NzYtRDdCOS0yRTI5N0Y5MjEwQTciLCJ0b2tlbiI6Ik1EQXdNREF3TURBd01MeTZvOXlCb0tlc2dwLUJiMzZnakttS2RuOXZ4NFhScmJLcXg1YXhob1dieHVDamw0R2JmWnFOZklhZm1YbWlyWXFHZjJfSGhkR3JzdENwM2E5Mm01aXlxbjJXZ1dWamJ3IiwidWlkIjoiMzQ3NDk0Iiwib3NfYXBpIjoiMTQuMyIsImNhcnJpZXIiOiIlRTQlQjglQUQlRTUlOUIlQkQlRTglODElOTQlRTklODAlOUEiLCJvc192ZXJzaW9uIjoiMTQuMyIsImRldmljZV9tb2RlbCI6ImlQaG9uZStYUiIsImRldmljZV90eXBlIjoiaU9TIiwiZGV2aWNlX2JyYW5kIjoiQXBwbGUiLCJtZW1vcnkiOiIzRyJ9.I7lUsK3WFYP8iXrevZJAr9S9vZnFH5xnh_iA1owWfFosXHVuMG_9taFhhFd_slnyjwdNloZk3PMpKO3NwqkEEg&storage=60G&token=MDAwMDAwMDAwMLy6o9yBoKesgp-Bb36gjKmKdn9vx4XRrbKqx5axhoWbxuCjl4GbfZqNfIafmXmirYqGf2_HhdGrstCp3a92m5iyqn2WgWVjbw&token_id=6ed950f3b54727eb94ce7537edd6de95&type=wx&uid=347494&version_code=1.4.6&video_id=974801';
  taskcenterbodyArr.push('app_name=onion_video&app_version=1.4.6&carrier=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A&channel=80000000&device_brand=Apple&device_id=46779&device_model=iPhone%20XR&device_type=iOS&fp=D2qeYlHbw8gsQ0wdf3jMSEhmak4qTkFhm5t6UZzFTN47wX41&language=zh-CN&memory=3G&network_type=WIFI&openudid=887A0ADC-2FD9-4876-D7B9-2E297F9210A7&os_api=14.3&os_version=14.3&resolution=828%2A1792&sign=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJmcCI6IkQycWVZbEhidzhnc1Ewd2RmM2pNU0VobWFrNHFUa0ZobTV0NlVaekZUTjQ3d1g0MSIsInZlcnNpb25fY29kZSI6IjEuNC42IiwibGFuZ3VhZ2UiOiJ6aC1DTiIsInRva2VuX2lkIjoiNmVkOTUwZjNiNTQ3MjdlYjk0Y2U3NTM3ZWRkNmRlOTUiLCJzdG9yYWdlIjoiNjBHIiwiYXBwX25hbWUiOiJvbmlvbl92aWRlbyIsImFwcF92ZXJzaW9uIjoiMS40LjYiLCJuZXR3b3JrX3R5cGUiOiJXSUZJIiwiZGV2aWNlX2lkIjoiNDY3NzkiLCJjaGFubmVsIjoiODAwMDAwMDAiLCJyZXNvbHV0aW9uIjoiODI4JTJBMTc5MiIsIm9wZW51ZGlkIjoiODg3QTBBREMtMkZEOS00ODc2LUQ3QjktMkUyOTdGOTIxMEE3IiwidG9rZW4iOiJNREF3TURBd01EQXdNTHk2bzl5Qm9LZXNncC1CYjM2Z2pLbUtkbjl2eDRYUnJiS3F4NWF4aG9XYnh1Q2psNEdiZlpxTmZJYWZtWG1pcllxR2YyX0hoZEdyc3RDcDNhOTJtNWl5cW4yV2dXVmpidyIsInVpZCI6IjM0NzQ5NCIsIm9zX2FwaSI6IjE0LjMiLCJjYXJyaWVyIjoiJUU0JUI4JUFEJUU1JTlCJUJEJUU4JTgxJTk0JUU5JTgwJTlBIiwib3NfdmVyc2lvbiI6IjE0LjMiLCJkZXZpY2VfbW9kZWwiOiJpUGhvbmUrWFIiLCJkZXZpY2VfdHlwZSI6ImlPUyIsImRldmljZV9icmFuZCI6IkFwcGxlIiwibWVtb3J5IjoiM0cifQ.x6Dmty6HvxOImi8n_hZEVNIPVbLBJCKpgaP8azBFuiBWY782Jrt4wKeuK5afdAp_-QMqkR2jpWskNcxuOI6yfA&storage=60G&token=MDAwMDAwMDAwMLy6o9yBoKesgp-Bb36gjKmKdn9vx4XRrbKqx5axhoWbxuCjl4GbfZqNfIafmXmirYqGf2_HhdGrstCp3a92m5iyqn2WgWVjbw&token_id=6ed950f3b54727eb94ce7537edd6de95&uid=347494&version_code=1.4.6');
  sharerewardbodyArr.push('app_name=onion_video&app_version=1.4.6&carrier=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A&channel=80000000&device_brand=Apple&device_id=46779&device_model=iPhone%20XR&device_type=iOS&fp=D2qeYlHbw8gsQ0wdf3jMSEhmak4qTkFhm5t6UZzFTN47wX41&language=zh-CN&memory=3G&network_type=WIFI&openudid=887A0ADC-2FD9-4876-D7B9-2E297F9210A7&os_api=14.3&os_version=14.3&resolution=828%2A1792&sign=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJmcCI6IkQycWVZbEhidzhnc1Ewd2RmM2pNU0VobWFrNHFUa0ZobTV0NlVaekZUTjQ3d1g0MSIsInZlcnNpb25fY29kZSI6IjEuNC42IiwibGFuZ3VhZ2UiOiJ6aC1DTiIsInRva2VuX2lkIjoiNmVkOTUwZjNiNTQ3MjdlYjk0Y2U3NTM3ZWRkNmRlOTUiLCJzdG9yYWdlIjoiNjBHIiwiYXBwX25hbWUiOiJvbmlvbl92aWRlbyIsImFwcF92ZXJzaW9uIjoiMS40LjYiLCJuZXR3b3JrX3R5cGUiOiJXSUZJIiwiZGV2aWNlX2lkIjoiNDY3NzkiLCJjaGFubmVsIjoiODAwMDAwMDAiLCJyZXNvbHV0aW9uIjoiODI4JTJBMTc5MiIsIm9wZW51ZGlkIjoiODg3QTBBREMtMkZEOS00ODc2LUQ3QjktMkUyOTdGOTIxMEE3IiwidG9rZW4iOiJNREF3TURBd01EQXdNTHk2bzl5Qm9LZXNncC1CYjM2Z2pLbUtkbjl2eDRYUnJiS3F4NWF4aG9XYnh1Q2psNEdiZlpxTmZJYWZtWG1pcllxR2YyX0hoZEdyc3RDcDNhOTJtNWl5cW4yV2dXVmpidyIsInVpZCI6IjM0NzQ5NCIsIm9zX2FwaSI6IjE0LjMiLCJjYXJyaWVyIjoiJUU0JUI4JUFEJUU1JTlCJUJEJUU4JTgxJTk0JUU5JTgwJTlBIiwib3NfdmVyc2lvbiI6IjE0LjMiLCJkZXZpY2VfbW9kZWwiOiJpUGhvbmUrWFIiLCJkZXZpY2VfdHlwZSI6ImlPUyIsImRldmljZV9icmFuZCI6IkFwcGxlIiwibWVtb3J5IjoiM0cifQ.x6Dmty6HvxOImi8n_hZEVNIPVbLBJCKpgaP8azBFuiBWY782Jrt4wKeuK5afdAp_-QMqkR2jpWskNcxuOI6yfA&storage=60G&token=MDAwMDAwMDAwMLy6o9yBoKesgp-Bb36gjKmKdn9vx4XRrbKqx5axhoWbxuCjl4GbfZqNfIafmXmirYqGf2_HhdGrstCp3a92m5iyqn2WgWVjbw&token_id=6ed950f3b54727eb94ce7537edd6de95&uid=347494&version_code=1.4.6');
  timeredbodyArr.push('app_name=onion_video&app_version=1.4.6&carrier=%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A&channel=80000000&device_brand=Apple&device_id=46779&device_model=iPhone%20XR&device_type=iOS&fp=D2qeYlHbw8gsQ0wdf3jMSEhmak4qTkFhm5t6UZzFTN47wX41&language=zh-CN&memory=3G&network_type=WIFI&openudid=887A0ADC-2FD9-4876-D7B9-2E297F9210A7&os_api=14.3&os_version=14.3&resolution=828%2A1792&sign=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJmcCI6IkQycWVZbEhidzhnc1Ewd2RmM2pNU0VobWFrNHFUa0ZobTV0NlVaekZUTjQ3d1g0MSIsInZlcnNpb25fY29kZSI6IjEuNC42IiwibGFuZ3VhZ2UiOiJ6aC1DTiIsInRva2VuX2lkIjoiNmVkOTUwZjNiNTQ3MjdlYjk0Y2U3NTM3ZWRkNmRlOTUiLCJzdG9yYWdlIjoiNjBHIiwiYXBwX25hbWUiOiJvbmlvbl92aWRlbyIsImFwcF92ZXJzaW9uIjoiMS40LjYiLCJuZXR3b3JrX3R5cGUiOiJXSUZJIiwiZGV2aWNlX2lkIjoiNDY3NzkiLCJjaGFubmVsIjoiODAwMDAwMDAiLCJyZXNvbHV0aW9uIjoiODI4JTJBMTc5MiIsIm9wZW51ZGlkIjoiODg3QTBBREMtMkZEOS00ODc2LUQ3QjktMkUyOTdGOTIxMEE3IiwidG9rZW4iOiJNREF3TURBd01EQXdNTHk2bzl5Qm9LZXNncC1CYjM2Z2pLbUtkbjl2eDRYUnJiS3F4NWF4aG9XYnh1Q2psNEdiZlpxTmZJYWZtWG1pcllxR2YyX0hoZEdyc3RDcDNhOTJtNWl5cW4yV2dXVmpidyIsInVpZCI6IjM0NzQ5NCIsIm9zX2FwaSI6IjE0LjMiLCJjYXJyaWVyIjoiJUU0JUI4JUFEJUU1JTlCJUJEJUU4JTgxJTk0JUU5JTgwJTlBIiwib3NfdmVyc2lvbiI6IjE0LjMiLCJkZXZpY2VfbW9kZWwiOiJpUGhvbmUrWFIiLCJkZXZpY2VfdHlwZSI6ImlPUyIsImRldmljZV9icmFuZCI6IkFwcGxlIiwibWVtb3J5IjoiM0cifQ.x6Dmty6HvxOImi8n_hZEVNIPVbLBJCKpgaP8azBFuiBWY782Jrt4wKeuK5afdAp_-QMqkR2jpWskNcxuOI6yfA&storage=60G&token=MDAwMDAwMDAwMLy6o9yBoKesgp-Bb36gjKmKdn9vx4XRrbKqx5axhoWbxuCjl4GbfZqNfIafmXmirYqGf2_HhdGrstCp3a92m5iyqn2WgWVjbw&token_id=6ed950f3b54727eb94ce7537edd6de95&uid=347494&version_code=1.4.6');

if (!(bodys && bodys != '')) {
  $.msg("", "", '请先-观看视频-获取请求体,建议5个即可...')
  $.done()
}

if (!(bodys2 && bodys2 != '')) {
  $.msg("", "", '请先-分享视频-获取请求体,只能3个！3个！3个！')
  $.done()
}

readbodyVal = bodys.split('#');
sharebodyVal = bodys2.split('#');

////////////////////////////////////////////////////////////////////////

Object.keys(readbodyVal).forEach((item) => {
  if (readbodyVal[item]) {
    readbodyArr.push(readbodyVal[item])
  }
})

Object.keys(sharebodyVal).forEach((item) => {
  if (sharebodyVal[item]) {
    sharebodyArr.push(sharebodyVal[item])
  }
})


if ($.isNode()) {

  Object.keys(taskcenterbodyVal).forEach((item) => {
    if (taskcenterbodyVal[item]) {
      taskcenterbodyArr.push(taskcenterbodyVal[item])
    }
  });

  Object.keys(sharerewardbodyVal).forEach((item) => {
    if (sharerewardbodyVal[item]) {
      sharerewardbodyArr.push(sharerewardbodyVal[item])
    }
  });

  Object.keys(timeredbodyVal).forEach((item) => {
    if (timeredbodyVal[item]) {
      timeredbodyArr.push(timeredbodyVal[item])
    }
  });
} else {
  //readbodyArr.push($.getdata('chgetbody_video'));
  //sharebodyArr.push($.getdata('chgetbody_share'));
  taskcenterbodyArr.push($.getdata('chgetbody_taskcenter'));
  sharerewardbodyArr.push($.getdata('chgetbody_sharereward'));
  timeredbodyArr.push($.getdata('chgetbody_timered'));
}


////////////////////////////////////////////////////////////////////////


!(async () => {
     await Jsname()
  O = (`🥦${jsname}任务执行通知🔔`);
  taskcenterbodyVal = taskcenterbodyArr[0];
  timeredbodyVal = timeredbodyArr[0];
  console.log(`\n✅ 查询账户明细\n`)
  if (uid >= 1) {
    await todaycoin(); //box填入uid
  } else {
    $.msg(
      jsname,
      "💖请到BoxJs填写自己的邀请码,保存设置\n",
      "点击跳转,复制链接,订阅我的BoxJs", {
        "open-url": "https://raw.githubusercontent.com/CenBoMin/GithubSync/main/cenbomin.box.json"
      }
    );
  }


   //==============自定义循环==========================
   if ($.isNode()) {
       while (true) {

  console.log(`\n✅ 打印任务状态清单`)
  await taskcenter(); //任务中心

  console.log(`\n✅ 执行时段奖励任务`)
  await timered(task); //时段奖励

  if (!sharebodyArr[0]) {
    console.log($.name, '【提示】请把分享视频的请求体填入Github 的 Secrets 中，请以#隔开')
    return;
  }
  $.index = 0;
  for (let i = 0; i < sharebodyArr.length; i++) {
    if (sharebodyArr[i]) {
      sharebody = sharebodyArr[i];
      sharerewardbodyVal = sharerewardbodyArr[0];
      $.index = $.index + 1;
      console.log(`\n✅ 执行分享视频任务【${$.index}】`)
    }
    await share(task); //分享
    await $.wait(3000);
    await sharereward(task); //分享奖励
  }

  if (!readbodyArr[0]) {
    console.log($.name, '【提示】请把阅读视频的请求体填入Github 的 Secrets 中，请以#隔开')
    return;
  }
  $.log('\n✅ 查询刷视频任务\n', `视频总数${readbodyArr.length}个,上次执行到第${$.begin}个,预计执行${((readbodyArr.length - $.begin) / 120).toFixed(2)}小时`)
  $.index = 0;
  for (let i = indexLast ? indexLast : 0; i < readbodyArr.length; i++) {
    if (readbodyArr[i]) {
      readbody = readbodyArr[i];
      $.index = $.index + 1;
      console.log(`\n✅ 执行自动刷视频任务【${$.index}】`)

    }
    await AutoRead();
  }
  $.log('', '', `🥦 本次共完成${$.index}次阅读，获得${readscore}个金币，阅读请求结束`);
  tz += `【自动阅读】：${readscore}个金币\n`;
  await showmsg();

           console.log(`========================本次任务执行完毕，休息30分钟==============================\n`);
           await $.wait(1800000)

       }
   } else {


  console.log(`\n✅ 打印任务状态清单`)
  await taskcenter(); //任务中心

  console.log(`\n✅ 执行时段奖励任务`)
  await timered(task); //时段奖励

  if (!sharebodyArr[0]) {
    console.log($.name, '【提示】请把分享视频的请求体填入Github 的 Secrets 中，请以#隔开')
    return;
  }
  $.index = 0;
  for (let i = 0; i < sharebodyArr.length; i++) {
    if (sharebodyArr[i]) {
      sharebody = sharebodyArr[i];
      sharerewardbodyVal = sharerewardbodyArr[0];
      $.index = $.index + 1;
      console.log(`\n✅ 执行分享视频任务【${$.index}】`)
    }
    await share(task); //分享
    await $.wait(3000);
    await sharereward(task); //分享奖励
  }

  if (!readbodyArr[0]) {
    console.log($.name, '【提示】请把阅读视频的请求体填入Github 的 Secrets 中，请以#隔开')
    return;
  }
  $.log('\n✅ 查询刷视频任务\n', `视频总数${readbodyArr.length}个,上次执行到第${$.begin}个,预计执行${((readbodyArr.length - $.begin) / 120).toFixed(2)}小时`)
  $.index = 0;
  for (let i = indexLast ? indexLast : 0; i < readbodyArr.length; i++) {
    if (readbodyArr[i]) {
      readbody = readbodyArr[i];
      $.index = $.index + 1;
      console.log(`\n✅ 执行自动刷视频任务【${$.index}】`)

    }
    await AutoRead();
  }
  $.log('', '', `🥦 本次共完成${$.index}次阅读，获得${readscore}个金币，阅读请求结束`);
  tz += `【自动阅读】：${readscore}个金币\n`;
  await showmsg();

   }
   //==============自定义循环==========================


})()
.catch((e) => $.logErr(e))
  .finally(() => $.done())

function showmsg() {
  if (notifyInterval != 1) {
    console.log(O + '' + tz);
  }

  if (notifyInterval == 1) {
    $.msg(O, '', tz);
  }
}

////////////////////////////////////////////////////////////////////////

//任务中心
function taskcenter() {
  return new Promise((resolve, reject) => {
    let taskurl = {
      url: `https://app.kxp.com/task/v1/task_center/data`,
      body: taskcenterbodyVal,
      headers: headerVal,
    }
    $.post(taskurl, async (error, resp, data) => {
      //$.log("tasklog:" + data+"\n")
      task = JSON.parse(data)
      //$.log(`【金币换算】:${(task.data.score/10000).toFixed(2)}\n`);
      $.log(`【${task.data.task_list[0].title}】:${task.data.task_list[0].button}`);
      $.log(`【${task.data.task_list[1].title}】:${task.data.task_list[1].button}`);
      $.log(`【${task.data.task_list[2].title}】:${task.data.task_list[2].button}`);
      $.log(`【${task.data.task_list[3].title}】:${task.data.task_list[3].button}`);
      $.log(`【${task.data.task_list[4].title}】:${task.data.task_list[4].button}`);

      //$.log(`【任务状态】:${task.data.task_list[6].status}\n`);

      tz += `【现金余额】：¥${task.data.activity_money.money}元\n`

      resolve()
    })
  })
}


//今日金币
function todaycoin() {

  return new Promise((resolve, reject) => {
    let todaycoinurl = {
      url: `https://app.kxp.com/web/income/detail?uid=${uid}`,
      headers: headerVal,
    }
    $.post(todaycoinurl, async (error, resp, data) => {
      let todaycoin = JSON.parse(data);
      $.log(`【今日金币】：${todaycoin.data.today_score}个金币🏅`);
      $.log(`【账户金币】：${todaycoin.data.score}个金币🏅,折算${todaycoin.data.money}`);
      $.log(`【获取金币总计】：${todaycoin.data.total_score}个金币🏅`);
      tz += `【今日金币】：${todaycoin.data.today_score}个金币\n`;
      resolve()
    })
  })

}

//分享视频赚钱
function share(task) {
  if (task.data.task_list[0].title_en === "share_video" || task.data.task_list[2].title_en === "share_video" || task.data.task_list[3].title_en === "share_video") {
    return new Promise((resolve, reject) => {
      let shareurl = {
        url: `https://app.kxp.com/video/v1/video/share`,
        body: sharebody,
        headers: headerVal,
      }
      $.post(shareurl, async (error, resp, data) => {
        let share = JSON.parse(data);
        //$.log(`\n本次阅读获得${share.data.score}个金币🏅\n`);
        //sharescore += share.data.score;
        if(logs==1) $.log(data)
        $.log(`分享任务奖励请求：成功🎉`);
        resolve()
      })
    })
  };
}


function sharereward(task) {
  if (task.data.task_list[0].title_en === "share_video") {
    return new Promise((resolve, reject) => {
      let sharerewardurl = {
        url: `https://app.kxp.com/task/v1/task_center/share_video_reward`,
        body: sharerewardbodyVal,
        headers: headerVal,
      }
      $.post(sharerewardurl, async (error, resp, data) => {
        let sharereward = JSON.parse(data);
        if (sharereward.code === 1007) {
          if(logs==1) $.log(data)
          $.log(`【分享奖励】：账号异常❌\n请评论,点赞,上传视频...并禁用脚本观察`)
          tz += `【分享奖励】：账号异常❌\n`;
        } else {
          if(logs==1) $.log(data)
          $.log(`本次任务获得${sharereward.data.score}个金币🏅`);
          tz += `【分享任务】：${sharescore}个金币\n`;
          sharescore += sharereward.data.score;
        }
        resolve()
      })
    })
  } else {
    $.log(`【分享视频】：已完成🎉`);
    tz += `【分享视频】：已完成🎉\n`;
  }
}

//每天领金币（30min一次）
function timered(task) {
  if (task.data.task_list[0].status === 2) {
    return new Promise((resolve, reject) => {
      const timeredurl = {
        url: `https://app.kxp.com/task/v1/task_center/red`,
        body: timeredbodyVal,
        headers: headerVal,
      };
      $.post(timeredurl, async (error, response, data) => {
        let timered = JSON.parse(data)
        if (timered.code === 1007) {
          if(logs==1) $.log(data)
          $.log(`【时段奖励】：账号异常❌\n请评论,点赞,上传视频...并禁用脚本观察`)
          tz += `【时段奖励】：账号异常❌\n`;
        } else {
          if(logs==1) $.log(data)
          $.log(`【时段奖励】：获取${timered.data.score}金币`);
          $.log(`【下个时段】：获取${timered.data.remain_time}金币`);
          tz += `【时段奖励】：${timered.data.score}金币\n`;
        }

        resolve()
      })
    })
  } else {
    $.log(`【时段奖励】：时间未到`);
    tz += `【时段奖励】：时间未到\n`;
  }
}

//执行阅读函数

function AutoRead() {
  return new Promise((resolve, reject) => {
    let url = {
      url: `https://app.kxp.com/video/v1/video/complete`,
      headers: headerVal,
      body: readbody
    };
    $.post(url, async (error, response, data) => {
      $.begin = $.begin + 1;
      let res = $.begin % readbodyArr.length
      $.setdata(res + "", 'chgetbody_body_index');
      let readres = JSON.parse(data);
      if (readres.code == '100006') {
        if(logs==1) $.log(data)
        $.log(`⛔️第${$.index}次-获取金币已达上限🥺,明日在来！`)
      } else if (readres.code == '1007') {
        if(logs==1) $.log(data)
        $.log(`【本次阅读${$.index}】：账号异常❌\n请评论,点赞,上传视频...并禁用脚本观察`)
        tz += `【本次阅读${$.index}】：账号异常❌\n`;
      } else if (typeof readres.data.score === 'number') {
        if(logs==1) $.log(data)
        await $.wait(60000);
        $.log(`【本次阅读】：${readres.data.score}个金币🏅`);
        readscore += readres.data.score;

      }
      resolve()
    })
  })
}

// prettier-ignore
function Jsname(){

$.log(`┎━━┰┒┎┰━━┰━━┰━━┰┒┎┰┒┎┰━━┒`)
$.log(`│┎━┦┕┚│┎┒│┎┒│┎┰┦┕┚││││┎┒│`)
$.log(`│┕━┦┎┒│┕┚││││┕┚│┎┒│┕┚│┎┒│`)
$.log(`┕━━┹┚┕┹━━┹┚┕┹━━┹┚┕┹━━┹┚┕┚`)

}

function Env(t, e) {
  class s {
    constructor(t) {
      this.env = t
    }
    send(t, e = "GET") {
      t = "string" == typeof t ? {
        url: t
      } : t;
      let s = this.get;
      return "POST" === e && (s = this.post), new Promise((e, i) => {
        s.call(this, t, (t, s, r) => {
          t ? i(t) : e(s)
        })
      })
    }
    get(t) {
      return this.send.call(this.env, t)
    }
    post(t) {
      return this.send.call(this.env, t, "POST")
    }
  }
  return new class {
    constructor(t, e) {
      this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`)
    }
    isNode() {
      return "undefined" != typeof module && !!module.exports
    }
    isQuanX() {
      return "undefined" != typeof $task
    }
    isSurge() {
      return "undefined" != typeof $httpClient && "undefined" == typeof $loon
    }
    isLoon() {
      return "undefined" != typeof $loon
    }
    toObj(t, e = null) {
      try {
        return JSON.parse(t)
      } catch {
        return e
      }
    }
    toStr(t, e = null) {
      try {
        return JSON.stringify(t)
      } catch {
        return e
      }
    }
    getjson(t, e) {
      let s = e;
      const i = this.getdata(t);
      if (i) try {
        s = JSON.parse(this.getdata(t))
      } catch {}
      return s
    }
    setjson(t, e) {
      try {
        return this.setdata(JSON.stringify(t), e)
      } catch {
        return !1
      }
    }
    getScript(t) {
      return new Promise(e => {
        this.get({
          url: t
        }, (t, s, i) => e(i))
      })
    }
    runScript(t, e) {
      return new Promise(s => {
        let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
        i = i ? i.replace(/\n/g, "").trim() : i;
        let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
        r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
        const [o, h] = i.split("@"), a = {
          url: `http://${h}/v1/scripting/evaluate`,
          body: {
            script_text: t,
            mock_type: "cron",
            timeout: r
          },
          headers: {
            "X-Key": o,
            Accept: "*/*"
          }
        };
        this.post(a, (t, e, i) => s(i))
      }).catch(t => this.logErr(t))
    }
    loaddata() {
      if (!this.isNode()) return {}; {
        this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
        const t = this.path.resolve(this.dataFile),
          e = this.path.resolve(process.cwd(), this.dataFile),
          s = this.fs.existsSync(t),
          i = !s && this.fs.existsSync(e);
        if (!s && !i) return {}; {
          const i = s ? t : e;
          try {
            return JSON.parse(this.fs.readFileSync(i))
          } catch (t) {
            return {}
          }
        }
      }
    }
    writedata() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
        const t = this.path.resolve(this.dataFile),
          e = this.path.resolve(process.cwd(), this.dataFile),
          s = this.fs.existsSync(t),
          i = !s && this.fs.existsSync(e),
          r = JSON.stringify(this.data);
        s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
      }
    }
    lodash_get(t, e, s) {
      const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
      let r = t;
      for (const t of i)
        if (r = Object(r)[t], void 0 === r) return s;
      return r
    }
    lodash_set(t, e, s) {
      return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
    }
    getdata(t) {
      let e = this.getval(t);
      if (/^@/.test(t)) {
        const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
        if (r) try {
          const t = JSON.parse(r);
          e = t ? this.lodash_get(t, i, "") : e
        } catch (t) {
          e = ""
        }
      }
      return e
    }
    setdata(t, e) {
      let s = !1;
      if (/^@/.test(e)) {
        const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}";
        try {
          const e = JSON.parse(h);
          this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
        } catch (e) {
          const o = {};
          this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
        }
      } else s = this.setval(t, e);
      return s
    }
    getval(t) {
      return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
    }
    setval(t, e) {
      return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
    }
    initGotEnv(t) {
      this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
    }
    get(t, e = (() => {})) {
      t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
        "X-Surge-Skip-Scripting": !1
      })), $httpClient.get(t, (t, s, i) => {
        !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
      })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
        hints: !1
      })), $task.fetch(t).then(t => {
        const {
          statusCode: s,
          statusCode: i,
          headers: r,
          body: o
        } = t;
        e(null, {
          status: s,
          statusCode: i,
          headers: r,
          body: o
        }, o)
      }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
        try {
          if (t.headers["set-cookie"]) {
            const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
            this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
          }
        } catch (t) {
          this.logErr(t)
        }
      }).then(t => {
        const {
          statusCode: s,
          statusCode: i,
          headers: r,
          body: o
        } = t;
        e(null, {
          status: s,
          statusCode: i,
          headers: r,
          body: o
        }, o)
      }, t => {
        const {
          message: s,
          response: i
        } = t;
        e(s, i, i && i.body)
      }))
    }
    post(t, e = (() => {})) {
      if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
        "X-Surge-Skip-Scripting": !1
      })), $httpClient.post(t, (t, s, i) => {
        !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
      });
      else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
        hints: !1
      })), $task.fetch(t).then(t => {
        const {
          statusCode: s,
          statusCode: i,
          headers: r,
          body: o
        } = t;
        e(null, {
          status: s,
          statusCode: i,
          headers: r,
          body: o
        }, o)
      }, t => e(t));
      else if (this.isNode()) {
        this.initGotEnv(t);
        const {
          url: s,
          ...i
        } = t;
        this.got.post(s, i).then(t => {
          const {
            statusCode: s,
            statusCode: i,
            headers: r,
            body: o
          } = t;
          e(null, {
            status: s,
            statusCode: i,
            headers: r,
            body: o
          }, o)
        }, t => {
          const {
            message: s,
            response: i
          } = t;
          e(s, i, i && i.body)
        })
      }
    }
    time(t) {
      let e = {
        "M+": (new Date).getMonth() + 1,
        "d+": (new Date).getDate(),
        "H+": (new Date).getHours(),
        "m+": (new Date).getMinutes(),
        "s+": (new Date).getSeconds(),
        "q+": Math.floor(((new Date).getMonth() + 3) / 3),
        S: (new Date).getMilliseconds()
      };
      /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length)));
      for (let s in e) new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length)));
      return t
    }
    msg(e = t, s = "", i = "", r) {
      const o = t => {
        if (!t) return t;
        if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {
          "open-url": t
        } : this.isSurge() ? {
          url: t
        } : void 0;
        if ("object" == typeof t) {
          if (this.isLoon()) {
            let e = t.openUrl || t.url || t["open-url"],
              s = t.mediaUrl || t["media-url"];
            return {
              openUrl: e,
              mediaUrl: s
            }
          }
          if (this.isQuanX()) {
            let e = t["open-url"] || t.url || t.openUrl,
              s = t["media-url"] || t.mediaUrl;
            return {
              "open-url": e,
              "media-url": s
            }
          }
          if (this.isSurge()) {
            let e = t.url || t.openUrl || t["open-url"];
            return {
              url: e
            }
          }
        }
      };
      this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r)));
      let h = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];
      h.push(e), s && h.push(s), i && h.push(i), console.log(h.join("\n")), this.logs = this.logs.concat(h)
    }
    log(...t) {
      t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
    }
    logErr(t, e) {
      const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
      s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t)
    }
    wait(t) {
      return new Promise(e => setTimeout(e, t))
    }
    done(t = {}) {
      const e = (new Date).getTime(),
        s = (e - this.startTime) / 1e3;
      this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
    }
  }(t, e)
}
