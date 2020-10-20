var body = $response.body;
let obj = JSON.parse(body);
obj.data.vip.isVip = 1;
body = JSON.stringify(obj);
$done({body})
