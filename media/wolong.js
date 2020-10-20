var body = $response.body;
if (url.indexOf(vip) != -1) {
    let obj = JSON.parse(body);
    obj.data.vip.isVip = 1;
	body = JSON.stringify(obj);
 }
 $done({body})