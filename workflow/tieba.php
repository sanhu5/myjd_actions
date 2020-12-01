<html>
<head>
<meta charset="UTF-8">
<title>百度贴吧一键签到 by sunny</title>
</head>
<body>
<?php
    date_default_timezone_set('PRC');
    set_time_limit(0);


    /*定义自定义函数*/
    function xCurl($url,$cookie=null,$postdata=null,$header=array()){
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL,$url);
        if (!is_null($postdata)) curl_setopt($ch, CURLOPT_POSTFIELDS,$postdata);
        if (!is_null($cookie)) curl_setopt($ch, CURLOPT_COOKIE,$cookie);
        if (!empty($header)) curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_TIMEOUT, 50);
        $re = curl_exec($ch);
        curl_close($ch);
        return $re;
    };

    /*定义变量*/
    $tieba_header = array(
        'Content-Type: application/x-www-form-urlencoded',
        'Charset: UTF-8',
        'net: 3',
        'User-Agent: bdtb for Android 8.4.0.1',
        'Connection: Keep-Alive',
        'Accept-Encoding: gzip',
        'Host: c.tieba.baidu.com',
        );
    $firefox_header = array(
        'Host: tieba.baidu.com',
        'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:50.0) Gecko/20100101 Firefox/50.0',
        'Accept: */*',
        'Accept-Language: zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
        'Content-Type: application/x-www-form-urlencoded; charset=UTF-8',
        'Referer: http://tieba.baidu.com/',
        'Connection: keep-alive',
    );

    $bduss='xxxxx';

    $re=json_decode(xCurl('http://tieba.baidu.com/dc/common/tbs','BDUSS=' . $bduss,null,$firefox_header),true);
    if (! $re['is_login']) {
        echo '<a>登录失败，点此</a><a href="'.substr($_SERVER['PHP_SELF'],strrpos($_SERVER['PHP_SELF'],'/')+1).'">返回</a>';
        goto msign_end;
    };
    $tbs = $re['tbs'];



    /*程序开始*/
    $postdata = array ('BDUSS='.$bduss,'tbs=' . $tbs);
    $postdata = implode('&', $postdata).'&sign='.md5(implode('', $postdata).'tiebaclient!!!');
    $re = json_decode(gzdecode(xCurl('http://c.tieba.baidu.com/c/c/forum/msign','ca=open',$postdata,$tieba_header)),true);
    if ($re['error_code'] == '0')
        echo '<a>默认签成功，执行第二次签到。</a><p />';
    else
        echo '<a>默认签到出错，使用超级签到。</a><p />';
    $re = json_decode(xCurl('http://tieba.baidu.com/tbmall/onekeySignin1','BDUSS='.$bduss,'ie=utf-8&tbs='.$tbs,$firefox_header),true);
    if (@$re['data']['unsignedForumAmount'] == '0'){
        echo '<a>签到完成！已签' . @$re['data']['signedForumAmount'] . '个吧，' . @$re['data']['unsignedForumAmount'] . '个吧未签。</a>';
        goto msign_end;
    }
    for ($pageno = 1; 1 ; $pageno ++){
        $postdata='BDUSS='.urlencode($bduss).'&_client_version=8.1.0.4'.'&page_no=' . $pageno.'&page_size=100'.'&sign='.md5('BDUSS='.$bduss.'_client_version=8.1.0.4'.'page_no='.$pageno.'page_size=100'.'tiebaclient!!!');
        $re = json_decode(gzdecode(xCurl('http://c.tieba.baidu.com/c/f/forum/like','ca=open',$postdata,$tieba_header)),true);
        foreach ($re['forum_list']['non-gconforum'] as $list) {
            echo '<a>尝试签到“' . $list['name'].'吧”:';
            $re_o = json_decode(gzdecode(xCurl('http://c.tieba.baidu.com/c/c/forum/sign','ca=open','BDUSS='.urlencode($bduss).'&fid='.$list['id'].'&kw='.urlencode($list['name']).'&sign='.md5('BDUSS='.$bduss.'fid='.$list['id'].'kw='.$list['name'].'tbs='.$tbs.'tiebaclient!!!').'&tbs='.$tbs,$tieba_header)),true);
            if ($re_o['error_code'] == '0')
                echo '签到完成，经验值加' . $re_o['user_info']['sign_bonus_point'] . '，你是今天第' . $re_o['user_info']['user_sign_rank'] . '个签到的。</a><br />';
            else
                echo '<a>'.$re_o['error_msg'] . '。</a><br />';
        };
        if ($re['has_more'] == '0')
            break;
    };
    $re = json_decode(xCurl('http://tieba.baidu.com/tbmall/onekeySignin1','BDUSS='.$bduss,'ie=utf-8&tbs='.$tbs,$firefox_header),true);
    echo '<a>签到完成！已签' . @$re['data']['signedForumAmount'] . '个吧，' . @$re['data']['unsignedForumAmount'] . '个吧未签。</a>';
    msign_end:
    echo '<br /><a>'.date('Y年m月d日 H:i:s').'</a><br />';
?>
</body>
</html>