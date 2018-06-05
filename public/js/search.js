const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let authinfo;
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';

let need_points = null;
let now_points = null ;

function getUrlParms(key){
    // 获取参数
    var url = window.location.search;
    // 正则筛选地址栏
    var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
    // 匹配目标参数
    var result = url.substr(1).match(reg);
    //返回参数值
    return result ? decodeURIComponent(result[2]) : null;
}

function clearString(s){
    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）&;|{}【】‘；：”“'。，、？]")
    var rs = "";
    for (var i = 0; i < s.length; i++) {
        rs = rs+s.substr(i, 1).replace(pattern, ' ');
    }
    return rs;
}

function split_with_spaces(s){
    return s.split(/[ ]+/);
}

//console.log(split_with_spaces(clearString(getUrlParms('content'))));

function new_result(data){
    /*
    <ul class="content">
        <li class="name">
            <a href="detail.html">这里放题目名称</a>
        </li >
        <li class="author">
            作者在这
        </li>
        <li class="time">
            发表时间
        </li>
    </ul>
     */
    let u = document.createElement('ul');
    u.className = 'content';
    let l1 = document.createElement('li');
    l1.className = 'name';
    let a = document.createElement('a');
    a.href = "detail.html?id="+data.resource_id;
    a.target = '_Blank';
    a.innerHTML = data.title;
    l1.append(a);
    let l2 = document.createElement('li');
    l2.className = 'author';
    l2.innerHTML = data.username;
    let l3 = document.createElement('li');
    l3.className = 'time';
    l3.innerHTML = String( new Date(data.upload_time)).split(' GM')[0];
    u.append(l1);
    u.append(l2);
    u.append(l3);
    return u;
}

socket.on('func:search', (res) => {
    //TODO: 获取搜索结果后
    console.log(res);
    for (let i = 0; i < res.length; ++i){
        $$('result').append(new_result(res[i]));
    }
});

if (getUrlParms('content') === null) {
    window.location.href = '/';
    throw new Error();
}

let search_request = {};
search_request.keywords = split_with_spaces(clearString(getUrlParms('content')));
getUrlParms('page') === null ? search_request.page = 1 : search_request.page = getUrlParms('page');

console.log(search_request);
socket.emit('func:search', search_request);

authinfo = {
    user : cookie_helper.getCookie(user_cookie_name),
    password : cookie_helper.getCookie(pwd_cookie_name)
};

if (authinfo.user === null || authinfo.password === null)
{
    authinfo = null ;
    cookie_helper.delCookie(user_cookie_name);
    cookie_helper.delCookie(pwd_cookie_name);
}
else
{
    socket.emit('user:login', authinfo);
}