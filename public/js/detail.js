/*
id: user => 到个人页面的<a>
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

function getUrlParms(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)
        return unescape(r[2]);
    return null;
}

if (getUrlParms('id') === null){
    alert("参数错误");
    window.location.href = '/error';
    throw new Error("参数错误");
}



authinfo = {
    user : cookie_helper.getCookie(user_cookie_name),
    password : cookie_helper.getCookie(pwd_cookie_name)
};

socket.emit('user:login', authinfo);

