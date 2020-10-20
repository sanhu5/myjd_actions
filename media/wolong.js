let body = $response.body
body=JSON.parse(body)
body['data']['vip']['isVip']=1
body=JSON.stringify(body)
$done({body})