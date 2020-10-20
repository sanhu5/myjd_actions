var body = $response.body;
let obj = JSON.parse(body);
console.log(obj);
obj.data.vip.isVip = 1;
body = JSON.stringify(obj);
$done({body})
