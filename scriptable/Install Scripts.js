// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: download;
/**
 * Author: GideonSenku
 * Github: https://github.com/GideonSenku
 */
const scripts = [
 {
    moduleName: "Env",
    url:"https://raw.githubusercontent.com/1217079729/myloon/master/scriptable/Env.js",
  },
  {
    moduleName: "Install Scripts",
    url:"https://raw.githubusercontent.com/1217079729/myloon/master/scriptable/Install%20Scripts.js",
   },
   {
     moduleName: "DmYY",
     url:"https://raw.githubusercontent.com/dompling/Scriptable/master/Scripts/DmYY.js",
   },
   {
    moduleName: "京豆图",
    url:"https://raw.githubusercontent.com/1217079729/myloon/master/scriptable/JDDouK.js",
   },
   {
    moduleName: "京豆收支",
    url:"https://raw.githubusercontent.com/1217079729/myloon/master/scriptable/JDDou.js",
   },
//   {
//    moduleName: "京豆物流",
//    url:"https://raw.githubusercontent.com/dompling/Scriptable/master/Scripts/JDWuLiu.js",
//   },
//   {
//    moduleName: "微博热搜",
//    url:"https://raw.githubusercontent.com/Juniorchen2012/scriptable/master/weibo.js",
//   },
];
// Install Scripts.js
const $ = importModule("Env");
function update() {
  log("🔔更新脚本开始!");
  scripts.forEach((script) => {
    $.getFile(script);
  });
  log("🔔更新脚本结束!");
}
update();