const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let authinfo;
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';

socket.on('connect',() => {
    console.log('已连接');
});
socket.on('user:login', (res) => {
    if (res === true){
        alert("登录成功");
        //TODO: 回到主页？
        cookie_helper.setCookie('expert_system_username', authinfo.user);
        cookie_helper.setCookie('expert_system_password', authinfo.password);
        window.location.href = 'index.html';
    }
    else if (res === false){
        alert("登陆失败");
        authinfo = null;
    }
});

$$('loginform').onsubmit = (event) => {
    authinfo = {
        user: $$('uname').value,
        password: SparkMD5.hash($$('psw').value)
    };
    socket.emit('user:login', authinfo);
    return false;
};