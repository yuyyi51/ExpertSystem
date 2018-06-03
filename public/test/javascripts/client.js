const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let authinfo;
let logined;
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';
function load(path, fn){
    let reader = new FileReader();
    reader.onload = (evt) => {
        fn(evt.srcElement.result);
    };
    reader.readAsDataURL(path);
}

socket.on('connect',() => {
    console.log('已连接');
});
socket.on('user:register', (res) => {
    if (res === true){
        alert("注册成功");
    }
    else if (res === false)
    {
        alert("注册失败");
    }
});
socket.on('user:login', (res) => {
    if (res === true){
        //alert("登录成功");
        change_state();
        cookie_helper.setCookie('expert_system_username', authinfo.user);
        cookie_helper.setCookie('expert_system_password', authinfo.password);
    }
    else if (res === false){
        //alert("登陆失败");
        authinfo = null;
        log_out();
    }
});

$$('b1').onclick = () => {
    let authinfo = {
        user: $$('input1').value,
        password: SparkMD5.hash($$('input2').value)
    };
    socket.emit('user:register', authinfo);
};

$$('b2').onclick = login ;
function login(){
    authinfo = {
        user: $$('input1').value,
        password: SparkMD5.hash($$('input2').value)
    };
    socket.emit('user:login', authinfo);
}

function change_state(){
    $$('hello').innerHTML = "用户 " + authinfo.user + " ,您好" ;
    logined = true ;
}

function log_out(){
    logined = false ;
    authinfo = null ;
    $$('hello').innerHTML = "未登录" ;
    cookie_helper.delCookie(user_cookie_name);
    cookie_helper.delCookie(pwd_cookie_name);
}

$$('b3').onclick = () => {
    if (logined !== true){
        alert("请先登录");
        return;
    }
    let files = $$('file_upload').files;
    if (files.length === 0){
        alert("请选择文件");
        return;
    }
    let file = {} ;
    file.filename = files[0].name;
    file.size = files[0].size;
    load(files[0], (res) => {
        file.base64 = res.replace(/^data:.*?;base64,/, "");
        console.log(file);
        socket.emit('expert:upload',file);
    });
};

$$('logout').onclick = () => {
    log_out();
};

console.log(cookie_helper.getCookie(user_cookie_name));
console.log(cookie_helper.getCookie(pwd_cookie_name));
authinfo = {
    user : cookie_helper.getCookie(user_cookie_name),
    password : cookie_helper.getCookie(pwd_cookie_name)
};

socket.emit('user:login', authinfo);