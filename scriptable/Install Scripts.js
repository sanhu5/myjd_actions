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
    url:
      "https://raw.githubusercontent.com/1217079729/myloon/master/scriptable//Env.js",
  },
  {
      moduleName: "Install Scripts",
      url:
        "https://raw.githubusercontent.com/1217079729/myloon/master/scriptable/Install%20Scripts.js",
    },
  {
    moduleName: "10010",
    url:
      "https://raw.githubusercontent.com/1217079729/myloon/master/scriptable/10010.js",
  },
  {
    moduleName: "10086",
    url:
      "https://raw.githubusercontent.com/1217079729/myloon/master/scriptable/10086.js",
  },
  {
    moduleName: "WeiboMonitor",
    url:
      "https://raw.githubusercontent.com/evilbutcher/Scriptables/master/WeiboMonitor.js",
  },
  {
    moduleName: "ZhihuMonitor",
    url:
      "https://raw.githubusercontent.com/evilbutcher/Scriptables/master/ZhihuMonitor.js",
  },
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