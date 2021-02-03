

//独立COOKIE文件     ck在``里面填写，多账号换行
let iboxpayheaderVal= `{"Content-Type":"application/json; charset=utf-8","X-User-Agent":"VeiShop, 1.4.4 (iOS, 14.4, zh_CN, Apple, iPhone, B985B673-41A3-4FAB-8BE3-C4B97C95C87B)","Accept":"*/*","version":"1.4.4","shopkeeperId":"1148855820752977920","source":"VEISHOP_APP_IOS","Host":"veishop.iboxpay.com","Accept-Language":"zh-Hans;q=1","token":"1ed988e7d545438e842b6f5f050e7797","Accept-Encoding":"gzip, deflate, br","traceid":"313485067022898872321612016037493a4b888dea4b8","User-Agent":"VeiShop, 1.4.4 (iOS, 14.4, zh_CN, Apple, iPhone, B985B673-41A3-4FAB-8BE3-C4B97C95C87B)","Connection":"keep-alive","mchtNo":"100529600058887"}&{"Content-Type":"application/json; charset=utf-8","X-User-Agent":"VeiShop, 1.4.4 (iOS, 14.4, zh_CN, Apple, iPhone, E5434103-037A-4F4F-BF92-E8EDEFF315FE)","Accept":"*/*","version":"1.4.4","shopkeeperId":"1148855820752977920","source":"VEISHOP_APP_IOS","Host":"veishop.iboxpay.com","Accept-Language":"zh-Hans-CN;q=1","token":"dd18de3bf9cf4617a18d681138be6e36","Accept-Encoding":"gzip, deflate, br","traceid":"3000000000000000000016120202985702bfa26fca4b8","User-Agent":"VeiShop, 1.4.4 (iOS, 14.4, zh_CN, Apple, iPhone, E5434103-037A-4F4F-BF92-E8EDEFF315FE)","Connection":"keep-alive","mchtNo":"100529600058887"}`
let refreshtokenVal= `0df32cde993b44bc99112ce8c987b7f8&37e2f26d024c4f38a3feaa55e8d54c08`


let iboxpaycookie = {
  iboxpayheaderVal: iboxpayheaderVal,  
  refreshtokenVal: refreshtokenVal,  
  
}

module.exports =  iboxpaycookie
  


