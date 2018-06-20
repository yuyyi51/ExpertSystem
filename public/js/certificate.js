const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let authinfo;
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';
let confirmed = false;
let sqlid = null;
let name = null;
function logout(){
    authinfo = null ;
    cookie_helper.delCookie(user_cookie_name);
    cookie_helper.delCookie(pwd_cookie_name);
    window.location.href = '/';
}

function createNewResult(data){
    $$('p_name').value = data.name;
    $$('p_id').value = data.id_number;
    $$('foc').value = data.foc[0];
    $$('org').value = data.org[0];
    $$('des').value = data.description;
}

function downloadFile(fileName, content){
    let aLink = document.createElement('a');
    let evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", false, false);
    aLink.download = fileName;
    aLink.href = content;
    console.log(aLink);
    aLink.dispatchEvent(evt);
    window.open(content);
}

$$('btn1').onclick = () => {
    socket.emit('admin:accept_request', sqlid, name);
};

$$('btn2').onclick = () => {
    socket.emit('admin:reject_request', sqlid, name);
};

$$('btn3').onclick = () => {
    window.location.href = "/download_cert?id=" + sqlid;
};

socket.on('user:login', (res) => {
    if (res){
        socket.emit('func:check_privilege', authinfo);
    }
    else
    {
        authinfo = null ;
        cookie_helper.delCookie(user_cookie_name);
        cookie_helper.delCookie(pwd_cookie_name);
        alert("只有管理员有权限进入该页面");
        window.location.href = '/';
    }
});

socket.on('func:check_privilege', (res) => {
    if (res === 2){
        //管理员
        confirm = true;
        socket.emit('admin:get_auth_request');
    }
    else {
        alert("只有管理员有权限进入该页面");
        window.location.href = '/';
    }
});

socket.on('admin:get_auth_request', (res) => {
    if (res === null){
        alert("目前没有新的认证申请");
        window.location.href = '/';
        return;
    }
    sqlid = res.request_id;
    console.log(res);
    socket.emit('admin:get_mongo_ar', res.request_id);
});

socket.on('admin:get_mongo_ar', (res) => {
    if (res === null){
        alert("获取认证申请信息失败，请稍后重试");
        return;
    }
    console.log(res);
    name = res.user;
    createNewResult(res);
});

socket.on('admin:accept_request', (res) => {
    if (res === null){
        alert("系统错误，请稍后再试");
    }
    else if (!res){
        alert("该申请已被处理");
        window.location.reload();
    }
});

socket.on('admin:reject_request', (res) => {
    if (res === null){
        alert("系统错误，请稍后再试");
    }
    else if (!res){
        alert("该申请已被处理");
        window.location.reload();
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
    alert("只有管理员有权限进入该页面");
    window.location.href = '/';
}
else
{
    socket.emit('user:login', authinfo);
}