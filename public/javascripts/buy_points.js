const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';
let authinfo = null ;

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

socket.on('user:buy_points', (res) => {
    if (res){
        alert("购买成功");
    }
    else{
        alert("购买失败");
    }
});

$$('buy').onclick = () => {
    let point = $('input[name = points]:checked').val() ;
    socket.emit('user:buy_points', {user:authinfo.user, points:point});
};