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
let copyright = false;
let sqlid = null;

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
        socket.emit('user:buy_resource', {user: authinfo.user, id: sqlid});
    }
};

$$('btn4').onclick = () => {
    socket.emit('user:check_purchase', {user: authinfo.user, id: sqlid});
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
        cookie_helper.delCookie(user_cookie_name);
        cookie_helper.delCookie(pwd_cookie_name);
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
    $$('filesize').innerHTML = (res.filesize / 1024 ).toFixed(2) + 'kb';
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

socket.on('user:check_purchase', (res) => {
    if (res){
        window.location.href = '/download?id=' + sqlid;
    }
    else
    {
        alert("请先购买资源");
    }
});

socket.on('func:get_5_day_purchase', (res) => {
    //console.log(res);
    let c = $$('canvas1');
    let cvs = c.getContext('2d');
    cvs.beginPath();
    cvs.moveTo(75, 300);
    cvs.lineTo(525, 300);
    cvs.lineWidth = 4 ;
    cvs.strokeStyle = "#aaaaaa";
    cvs.moveTo(75,300);
    cvs.lineTo(75, 50);
    cvs.stroke();
    cvs.closePath();
    let max = 0;
    for (let i = 0; i < 5 ; i++){
        if (max < res[i].count)
            max = res[i].count;
    }
    let unit = 180.0 / max ;
    if (max === 0)
        unit = 0 ;
    console.log(unit);
    let last_x , last_y;
    //画点和线
    for (let i = 0; i< 5 ; i ++){
        let y = 250 - res[i].count * unit;
        let x = 125 + 80 * i ;
        cvs.beginPath();
        cvs.lineWidth = 1 ;
        cvs.strokeStyle = "#ff0000";
        cvs.fillStyle = '#ff0000';
        cvs.moveTo(x-4,y-4);
        cvs.lineTo(x+4,y-4);
        cvs.lineTo(x+4,y+4);
        cvs.lineTo(x-4,y+4);
        cvs.lineTo(x-4,y-4);
        cvs.fill();
        cvs.stroke();
        cvs.closePath();
        cvs.beginPath();
        cvs.font = '20px Arial';
        cvs.fillStyle = '#000000';
        cvs.fillText(res[i].count.toString(),x-5,y-15);
        cvs.closePath();
        if (i !== 0){
            cvs.beginPath();
            cvs.moveTo(last_x,last_y);
            cvs.lineTo(x,y);
            cvs.strokeStyle = '#ff0000';
            cvs.stroke();
            cvs.closePath();
        }
        last_x = x ;
        last_y = y ;
    }

    //标注日期
    for (let i = 0 ; i < 5 ; ++i){
        cvs.beginPath();
        cvs.fillText(res[i].date.toString() + '日',125 + 80 * i - 15,320);
        cvs.closePath();
    }

    cvs.beginPath();
    cvs.fillText("日期", 530, 300);
    cvs.fillText("购买次数", 35, 40);
    cvs.closePath();
});



if (getUrlParms('id') === null || getUrlParms('id') === ""){
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

//socket.emit('func:detail', getUrlParms('id'));
//socket.emit('func:get_5_day_purchase', getUrlParms('id'));
if (authinfo !== null)
    socket.emit('user:get_points', authinfo);

function detail_load(result) {
    if (result.title !== undefined) $$('resource_name').innerHTML = result.title;
        else $$('resource_name').innerHTML = "暂无";
    if(result.authors !== undefined) {
        var  count=Math.min(result.authors.length,3);
        for(var i=0;i<count;i++)
        {
            var author=document.createElement('span');
            author.className = "author";
            if (result.authors[i].id !== null && result.authors[i].id !== undefined)
            {
                let a = document.createElement('a');
                a.href = 'introduction.html?id=' + result.authors[i].id;
                a.innerHTML = result.authors[i].name.toString() + ";";
                author.appendChild(a);
            }
            else
                author.innerHTML = result.authors[i].name.toString() + ";";
            $$('authors').appendChild(author);
        }
        if(count > 3)
        {
            $$('authors').innerHTML += "等";
        }
    }
    else
        $$('authors').innerHTML = "暂无";
    if (result.abstract !== undefined) $$('describe').innerHTML = result.abstract;
        else $$('describe').innerHTML = "暂无";
    if (result.keywords !== undefined) {
        var keywords = "";
        var count = Math.min(result.keywords.length,10);
        for (var i = 0; i < count; i++) {
            keywords = keywords + result.keywords[i].toString() + "; ";
        }
        $$('keywords').innerHTML = keywords;
    }
    else $$('keywords').innerHTML = "暂无";
    $$('time').innerHTML = result.year || "暂无";
}
function refer_load(results){
    //<p><span class="ref-order">[1]</span><span class="ref-title">SPOC混合学习模式设计研究[J].陈然,杨成.中国远程教育.2015(05)</span></p>
    for (let i = 0 ; i < results.length ; ++i){
        var p = document.createElement('p');
        p.innerHTML = "<span class=\"ref-order\">[" + (i+1) + "]</span><span class=\"ref-title\"><a href='detail.html?id="+results[i]._id+"'>" + results[i].title + '.' +
            (results[i].authors === undefined ? "" : results[i].authors[0].name ) + '.' + (results[i].year || "") + "</a></span>";
        $$('refer').appendChild(p);
    }
}
//detail_load(result);
socket.on('func:detail_new', (res) => {
    if (res === null){
        alert("文件不存在");
        window.location.href = '/error';
        throw new Error("参数错误");
    }
    detail_load(res);
    if (res.copyright !== undefined){
        copyright = true;
        need_points = res.point;
        $$('need_points').innerHTML = need_points;
        $$('purchase_times').innerHTML = res.pur_times;
        $$('filesize').innerHTML = (res.size / 1024 ).toFixed(2) + 'kb';
        sqlid = res.sqlid;
    }
    else {
        $$('need_points').innerHTML = "本站不提供购买与下载";
        $$('purchase_times').innerHTML = 0;
        $$('filesize').innerHTML = 0;
        $$('btn2').onclick = () => {
            alert("该资源本站不提供购买与下载，将为您重定向到具有版权的网站");
            if (res.url === undefined){
                alert("未收录该论文的网站");
                return;
            }
            else
            {
                window.open(res.url[0]);
            }
        };
        $$('btn4').onclick = () => {
            alert("该资源本站不提供购买与下载，将为您重定向到具有版权的网站");
            if (res.url === undefined){
                alert("未收录该论文的网站");
                return;
            }
            else
            {
                window.open(res.url[0]);
            }
        };
    }
});
socket.on("func:get_refer", (res) => {
    refer_load(res);
});
socket.emit('func:detail_new',getUrlParms('id'));
socket.emit('func:get_refer', getUrlParms('id'));