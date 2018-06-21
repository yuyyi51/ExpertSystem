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

function logout() {
    cookie_helper.delCookie(user_cookie_name);
    cookie_helper.delCookie(pwd_cookie_name);
    location.reload();
}

function split_with_spaces(s){
    return s.split(/[ ]+/);
}

function timeFormatter(value) {

    var da = new Date(value.replace("/Date(", "").replace(")/" , "").split( "+")[0]);
    return da.getFullYear() + "-" + ((da.getMonth() + 1) < 10 ? "0" + (da.getMonth() + 1):(da.getMonth() + 1))+ "-" + (da.getDate() < 10 ? "0" + da.getDate():da.getDate()) + " " + (da.getHours()<10?"0"+da.getHours():da.getHours()) + ":" + (da.getMinutes()<10?"0"+da.getMinutes():da.getMinutes()) + ":" + (da.getSeconds()<10?"0"+da.getSeconds():da.getSeconds());
}

//console.log(split_with_spaces(clearString(getUrlParms('content'))));

function new_result(data){
    /*
    <div class="result-term">
            <div>
                <h2>人工智能原理</h2>
                <p>
                    <span class="author">石纯</span>---<span class="date">1993</span>---<span class="quote">被引量：</span><span class="quote_num">793</span>
                </p>
                <p class="summary">
                    首先对第4届"智能系统在电力系统中的应用"国际会议发表的全部论文做了介绍,之后概述了近几年来较受关注的分布式人工智能技术、粗糙集理论
                </p>
            </div>
            <div class="filed">
                <div class="filed-term">人工智能</div>
            </div>
        </div>
     */
    let div1 = document.createElement("div");
    div1.className = "result-term";
    let div2 = document.createElement("div");
    let h2 = document.createElement("h2");
    let a = document.createElement('a');
    a.href = "detail.html?id=" + data._id;
    a.innerHTML = data.title;
    h2.appendChild(a);
    div2.appendChild(h2);
    let p1 = document.createElement("p");
    let span1 = document.createElement("span");
    span1.className = "author";
    let authors = "" ;
    for (let i = 0 ; i < data.authors.length && i < 5 ; ++i){
        authors += data.authors[i].name;
        if (i+1 < data.authors.length)
            authors += ", ";
    }
    span1.innerHTML = authors;
    p1.appendChild(span1);
    p1.innerHTML += "---";
    let span2 = document.createElement("span");
    span2.className = "date";
    span2.innerHTML = data.year;
    p1.appendChild(span2);
    p1.innerHTML += "---";
    p1.innerHTML += "<span class=\"quote\">被引量：</span>";
    p1.innerHTML += "</span><span class=\"quote_num\">" + (data.refered || 0) + "</span>";
    let p2 = document.createElement("p");
    p2.className = "summary";
    if (data.abstract !== undefined)
        p2.innerHTML = data.abstract.substring(0,250) + "...";
    else
        p2.innerHTML = "暂无";
    div2.appendChild(p1);
    div2.appendChild(p2);
    let div3 = document.createElement("div");
    div3.className = "filed";
    if (data.keywords !== undefined)
        for (let i = 0 ; i < data.keywords.length && i < 5 ; ++i) {
            let div4 = document.createElement("div");
            div4.innerHTML = data.keywords[i];
            div4.className = "filed-term";
            div3.appendChild(div4);
        }
    div1.appendChild(div2);
    div1.appendChild(div3);
    return div1;
}

socket.on('user:login', (res) => {
    if (res){
        //登录成功
        $$('login').style.visibility = 'hidden';
        $$('signup').style.visibility = 'hidden';
        $$('username').innerHTML = authinfo.user ;
    }
    else {
        //失败
        cookie_helper.delCookie(user_cookie_name);
        cookie_helper.delCookie(pwd_cookie_name);
        $$('user').parentNode.removeChild($$('user'));
        $$('logout').parentNode.removeChild($$('logout'));
    }
});

socket.on('func:search', (res) => {
    //TODO: 获取搜索结果后
    console.log(res);
    for (let i = 0; i < res.length; ++i){
        $$('result').append(new_result(res[i]));
    }
});

socket.on('func:search_new', (res) => {
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
search_request.keywords = clearString(getUrlParms('content'));
getUrlParms('page') === null ? search_request.page = 1 : search_request.page = getUrlParms('page');

console.log(search_request);
socket.emit('func:search_new', {
    keywords: search_request.keywords,
    page: search_request.page
});

authinfo = {
    user : cookie_helper.getCookie(user_cookie_name),
    password : cookie_helper.getCookie(pwd_cookie_name)
};

if (authinfo.user === null || authinfo.password === null)
{
    authinfo = null ;
    cookie_helper.delCookie(user_cookie_name);
    cookie_helper.delCookie(pwd_cookie_name);
    $$('user').parentNode.removeChild($$('user'));
    $$('logout').parentNode.removeChild($$('logout'));
}
else
{
    socket.emit('user:login', authinfo);
}