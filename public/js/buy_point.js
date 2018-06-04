const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let authinfo;
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';

socket.on('user:login', (res) => {
    if (!res){
        alert("请先登录");
        authinfo = null ;
        cookie_helper.delCookie(user_cookie_name);
        cookie_helper.delCookie(pwd_cookie_name);
        window.location.href = '/Login.html';
    }
});

socket.on('user:buy_points', (res) => {
    if (res){
        alert("购买成功");
    }
    else{
        alert("购买失败");
    }
});

$$('buy_10').onclick = () => {
    socket.emit('user:buy_points', {user:authinfo.user, points:10});
};

$$('buy_50').onclick = () => {
    socket.emit('user:buy_points', {user:authinfo.user, points:50});
};

$$('buy_100').onclick = () => {
    socket.emit('user:buy_points', {user:authinfo.user, points:100});
};

let username = cookie_helper.getCookie(user_cookie_name);
let password = cookie_helper.getCookie(pwd_cookie_name);
if (username !== null && password !== null)
{
    authinfo = {
        user : username,
        password : password
    };
    socket.emit('user:login', authinfo);
}
else {
    alert("请先登录");
    window.location.href = '/Login.html';
}