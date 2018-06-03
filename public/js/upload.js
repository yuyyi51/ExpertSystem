/*
id: sourcename => 资源名
id: description => 描述
id: category => 分类
id: keyword => 关键词
id: points => 积分
id: uploadfile => 要上传的文件
 */
const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let authinfo;
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';

function load(path, fn){
    let reader = new FileReader();
    reader.onload = (evt) => {
        fn(evt.srcElement.result);
    };
    reader.readAsDataURL(path);
}
socket.on('user:login', (res) => {
    if (res){
        $$('hello').innerHTML = authinfo.user ;
    }
    else {
        authinfo = null ;
        cookie_helper.delCookie(user_cookie_name);
        cookie_helper.delCookie(pwd_cookie_name);
    }
});
$$('upload_form').onsubmit = (event) => {
    
    return false;
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