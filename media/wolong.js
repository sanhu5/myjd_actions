var body = $response.body;
let obj = JSON.parse(body);
obj.data.vip.isVip = 1;
obj.data.vip.vipStart = "2020-01-01";
obj.data.vip.vipEnd = "2022-01-31";
body = JSON.stringify(obj);
$done({body})
