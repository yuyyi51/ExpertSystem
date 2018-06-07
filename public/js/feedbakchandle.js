const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let authinfo;
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';
let confirm = true ;

function createNewResult(data){
    let tr = document.createElement('tr');
    let td1 = document.createElement('td');
    let td2 = document.createElement('td');
    let td3 = document.createElement('td');
    let td4 = document.createElement('td');
    let td5 = document.createElement('td');
    let td6 = document.createElement('td');
    td1.style.width = '5%';
    td1.innerHTML = data.feedback_id;
    td2.style.width = '15%';
    td2.innerHTML = data.username ;
    td3.style.width = '15%';
    td3.innerHTML = data.feedback_type;
    td4.style.width = '15%';
    td4.innerHTML = data.feedback_topic;
    td5.style.width = '30%';
    td5.innerHTML = data.feedback_content;
    td6.style.width = '20%';
    let button = document.createElement('button');
    button.type = 'button';
    button.className = 'button1';
    button.innerHTML = '已处理';

    button.onclick = () => {
        socket.emit('admin:change_feedback_state', data.feedback_id);
        $$('result').removeChild(button.parentNode.parentNode);
    };

    td6.appendChild(button);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);
    tr.appendChild(td6);
    $$('result').appendChild(tr);
}

function logout(){
    authinfo = null ;
    cookie_helper.delCookie(user_cookie_name);
    cookie_helper.delCookie(pwd_cookie_name);
    window.location.href = '/';
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
        socket.emit('admin:get_feedback');
    }
    else {
        alert("只有管理员有权限进入该页面");
        window.location.href = '/';
    }
});

socket.on('admin:get_feedback',(res) => {
    if (res === null){
        alert("获取反馈信息失败，请稍后重试");
        return;
    }
    for (let i = 0; i < res.length; ++i){
        createNewResult(res[i]);
    }
});

socket.on('admin:change_feedback_state', (res) => {
    if (res === null){
        alert("系统错误，请稍后再试");
    }
    else if (!res){
        alert("该反馈已被处理，请勿重复操作");
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
