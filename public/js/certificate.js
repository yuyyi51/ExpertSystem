const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let authinfo;
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';
let confirmed = false;
function logout(){
    authinfo = null ;
    cookie_helper.delCookie(user_cookie_name);
    cookie_helper.delCookie(pwd_cookie_name);
    window.location.href = '/';
}

function createNewResult(data){
    let tr = document.createElement('tr');
    let td1 = document.createElement('td');
    let td2 = document.createElement('td');
    let td3 = document.createElement('td');
    let td4 = document.createElement('td');
    let td5 = document.createElement('td');
    let td6 = document.createElement('td');
    td1.style.width = '5%';
    td1.innerHTML = data.request_id;
    td2.style.width = '15%';
    td2.innerHTML = data.username ;
    td3.style.width = '15%';
    td3.innerHTML = data.name;
    td4.style.width = '15%';
    td4.innerHTML = data.id_number;
    td5.style.width = '30%';
    td5.innerHTML = data.description;
    td6.style.width = '20%';
    let button1 = document.createElement('button');
    button1.type = 'button';
    button1.className = 'button1';
    button1.innerHTML = '附加资料';
    button1.onclick = () => {
        window.location.href = '/download_cert?id=' + data.request_id;
    };
    let button2 = document.createElement('button');
    button2.type = 'button';
    button2.className = 'button1';
    button2.innerHTML = '通过';
    button2.onclick = () => {
        socket.emit('admin:accept_request', data.request_id);
        $$('result').removeChild(button2.parentNode.parentNode);
    };
    let button3 = document.createElement('button');
    button3.type = 'button';
    button3.className = 'button2';
    button3.innerHTML = '拒绝';
    button3.onclick = () => {
        socket.emit('admin:reject_request', data.request_id);
        $$('result').removeChild(button3.parentNode.parentNode);
    };

    td6.appendChild(button1);
    td6.appendChild(button2);
    td6.appendChild(button3);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);
    tr.appendChild(td6);
    $$('result').appendChild(tr);
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
        alert("获取认证申请信息失败，请稍后重试");
        return;
    }
    for (let i = 0; i < res.length; ++i){
        createNewResult(res[i]);
    }
});

socket.on('admin:accept_request', (res) => {
    if (res === null){
        alert("系统错误，请稍后再试");
    }
    else if (!res){
        alert("该申请已被处理");
    }
});

socket.on('admin:reject_request', (res) => {
    if (res === null){
        alert("系统错误，请稍后再试");
    }
    else if (!res){
        alert("该申请已被处理");
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