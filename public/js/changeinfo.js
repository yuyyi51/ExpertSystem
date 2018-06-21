const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let authinfo;
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';
let confirmed = false;
let this_id = "";
socket.on('user:login', (res) => {
    if (res){
        socket.emit('func:check_privilege', authinfo);
    }
    else {
        alert("请先登录");
        window.location.href = '/';
    }
});
socket.on('func:check_privilege', (res) => {
    if (res === 1 || res === 2){
        //专家或管理员
        confirmed = true ;
        socket.emit('expert:get_author_id', authinfo.user);
    }
    else{
        //没有权限
        alert("只有专家用户能够修改个人信息");
        window.location.href = '/';
    }
});
socket.on('expert:get_author_id', (res) => {
    if (res === null){
        alert("未找到用户信息");
        window.location.href = '/';
        return;
    }
    socket.emit('func:get_expert_intro', res);
});
socket.on('func:get_expert_intro', (res) => {
    $$("name").value = res.name;
    $$("email").value = res.email;
    $$("phone").value = res.phone;
    $$("foc").value = res.foc[0];
    $$("org").value = res.org[0];
    $$("intro").value = res.description;
    this_id = res._id;
});

authinfo = {
    user : cookie_helper.getCookie(user_cookie_name),
    password : cookie_helper.getCookie(pwd_cookie_name)
};

if (authinfo.user === null || authinfo.password === null)
{
    authinfo = null ;
    $$('user').parentNode.removeChild($$('user'));
    $$('logout').parentNode.removeChild($$('logout'));
    alert("请先登录");
    window.location.href = '/';
}
else
{
    socket.emit('user:login', authinfo);
}

$$('btn').onclick = (e) => {
    let info = {
        name: $$("name").value,
        email: $$("email").value,
        phone: $$("phone").value,
        foc: [$$("foc").value],
        org: [$$("org").value],
        description: $$("intro").value
    };
    socket.emit('expert:change_info', authinfo.user, info);
    return false;
};
socket.on('expert:change_info', (res) => {
    if (res) {
        alert("修改成功");
        window.location.href = "introduction.html?id=" + this_id;
        return;
    }
    alert("修改失败，请稍后再试");
    return;
});