const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let authinfo;
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';

let need_points = null;
let now_points = null ;

function logout(){
    cookie_helper.delCookie(user_cookie_name);
    cookie_helper.delCookie(pwd_cookie_name);
    location.reload();
}

socket.on('user:login', (res) => {
    if (res){
        $("#user_info").empty();
        let a1 = document.createElement("a");
        a1.onclick = logout;
        a1.innerHTML = "登出";
        a1.href = "#";
        $$("user_info").append(a1);
        socket.emit('func:check_privilege', authinfo);
    }
    else {
        cookie_helper.delCookie(user_cookie_name);
        cookie_helper.delCookie(pwd_cookie_name);
        $("#user_func").empty();
    }
});
socket.on('expert:get_author_id', (res) => {
    window.location.href = "introduction.html?id="+res;
});
function user_info(){
    socket.emit('expert:get_author_id', authinfo.user);
}
socket.on('func:check_privilege', (res) => {
    if (res === 1){
        //专家
        console.log(res);
        $("#user_func").empty();
        let l1 = document.createElement("li");
        let a1 = document.createElement("a");
        a1.href = "upload.html";
        a1.innerHTML = "上传资源";
        l1.append(a1);
        let l2 = document.createElement("li");
        let a2 = document.createElement("a");
        a2.href = "#";
        a2.onclick = user_info;
        a2.innerHTML = "个人页面";
        l2.append(a2);
        $$("user_func").append(l1);
        $$("user_func").append(l2);
    }
    else if (res === 2){
        //管理员
        $("#user_func").empty();
        let l1 = document.createElement("li");
        let a1 = document.createElement("a");
        a1.href = "feedbackhandle.html";
        a1.innerHTML = "处理反馈";
        l1.append(a1);
        let l2 = document.createElement("li");
        let a2 = document.createElement("a");
        a2.href = "certificate.html";
        a2.innerHTML = "处理认证";
        l2.append(a2);
        $$("user_func").append(l1);
        $$("user_func").append(l2);
    }
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
    $("#user_func").empty();
}
else
{
    socket.emit('user:login', authinfo);
}
