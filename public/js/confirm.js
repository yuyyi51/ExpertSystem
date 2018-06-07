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

function load_next(files, pos, result ,fn){
    if (pos >= files.length){
        //读完了
        fn(result);
        return;
    }
    let path = files[pos];
    load(path, (res) => {
        result.push({
            base: res,
            filename: path.name
        });
        load_next(files, ++pos, result, fn);
    });
}

socket.on('user:login', (res) => {
    if (res){
        //登录成功
    }
    else {
        cookie_helper.delCookie(user_cookie_name);
        cookie_helper.delCookie(pwd_cookie_name);
        alert("请先登录");
        window.location.href = '/';
    }
});

$$('auth_form').onsubmit = (e) => {
    let confirm = {};
    confirm.name = $$('p_name').value;
    confirm.id_number = $$('p_id').value;
    if (confirm.id_number.length !== 18){
        alert("身份证号应为18位");
        return false;
    }
    confirm.description = $$('description').value;
    confirm.user = authinfo.user;
    let files = $$('files').files;
    load_next(files,0,[],(res) => {
        confirm.files = res ;
        socket.emit('user:certify', confirm);
        alert("申请发送成功，请等待管理员审核");
        window.location.href = '/';
    });
    return false;
};

authinfo = {
    user : cookie_helper.getCookie(user_cookie_name),
    password : cookie_helper.getCookie(pwd_cookie_name)
};

if (authinfo.user === null || authinfo.password === null)
{
    authinfo = null ;
    cookie_helper.delCookie(user_cookie_name);
    cookie_helper.delCookie(pwd_cookie_name);
    alert("请先登录");
    window.location.href = '/';
}
else
{
    socket.emit('user:login', authinfo);
}