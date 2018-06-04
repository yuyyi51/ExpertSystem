/*
id: login => 登录
id: signup => 注册
id: user => 到个人页面的<a>
id: username => 用户名
id: logout => 退出按钮
id: search-data => 搜索框
id: search_btn => 搜索按钮
id: resource_name => 资源名
id: uploader_href => 上传者的链接
id: uploader => 上传者名
id: upload_time => 上传时间
id: filename => 文件名
id: describe => 描述
id: keywords => 关键词
id: catalog => 分类
id: btn2 => 购买资源
id: btn4 => 下载
id: need_points => 所需积分
id: confirm_need_points => 确认时的所需积分
id: purchase_times => 购买次数
id: filesize => 文件大小
id: confirm_buy => 确认购买窗口
id: confirmed_buy => 确认购买
id: not_enough_points => 积分不足窗口
 */

const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let authinfo;
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';

let need_points = null;
let now_points = null ;

function getUrlParms(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)
        return unescape(r[2]);
    return null;
}

$$('logout').onclick = () => {
    authinfo = null ;
    cookie_helper.delCookie(user_cookie_name);
    cookie_helper.delCookie(pwd_cookie_name);
    window.location.href = '/';
    return false;
};

$$('confirmed_buy_btn').onclick = () => {
    if(now_points < need_points){
        cancel();
        point_not_enough();
    }
    else {
        socket.emit('user:buy_resource', {user: authinfo.user, id: getUrlParms('id')});
    }
};

socket.on('user:login', (res) => {
    if (res){
        $$('login').style.visibility = 'hidden';
        $$('signup').style.visibility = 'hidden';
        $$('username').innerHTML = authinfo.user ;
    }
    else {
        $$('user').parentNode.removeChild($$('user'));
        $$('logout').parentNode.removeChild($$('logout'));
    }
});

socket.on('func:detail', (res) => {
    if (res === null){
        alert("文件不存在");
        window.location.href = '/error';
        throw new Error("参数错误");
    }
    $$('resource_name').innerHTML = res.title;
    $$('uploader').innerHTML = res.uploader;
    $$('upload_time').innerHTML = String( new Date(res.upload_time)).split(' GM')[0];
    $$('filename').innerHTML = res.filename;
    $$('describe').innerHTML = res.description;
    $$('keywords').innerHTML = res.keyword;
    $$('catalog').innerHTML = res.category;
    $$('need_points').innerHTML = res.required_points;
    $$('confirm_need_points').innerHTML = res.required_points;
    $$('purchase_times').innerHTML = res.pur_times;
    $$('filesize').innerHTML = (res.filesize / 1024 ).toFixed(3) + 'kb';
    need_points = res.required_points;
});

socket.on('user:get_points', (res) => {
    $$('confirm_remain_points').innerHTML = res ;
    now_points = res ;
});

socket.on('user:buy_resource', (res) => {
    if (res === -1){
        alert("您已经购买过该资源");
    }
    else if (res === 1){
        alert("购买成功");
    }
    else
    {
        alert("购买失败");
    }
    cancel();
});



if (getUrlParms('id') === null){
    alert("参数错误");
    window.location.href = '/error';
    throw new Error("参数错误");
}

authinfo = {
    user : cookie_helper.getCookie(user_cookie_name),
    password : cookie_helper.getCookie(pwd_cookie_name)
};

if (authinfo.user === null || authinfo.password === null)
{
    authinfo = null ;
    $$('user').parentNode.removeChild($$('user'));
    $$('logout').parentNode.removeChild($$('logout'));
}
else
{
    socket.emit('user:login', authinfo);
}

socket.emit('func:detail', getUrlParms('id'));
if (authinfo !== null)
    socket.emit('user:get_points', authinfo);



