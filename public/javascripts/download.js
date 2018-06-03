const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';
let authinfo = null ;

socket.on('user:login', (res) => {
    if (res){

    }
    else {
        authinfo = null ;
        cookie_helper.delCookie(user_cookie_name);
        cookie_helper.delCookie(pwd_cookie_name);
    }
});

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