const socket = io.connect();
function $$(id) { return document.getElementById(id); }

socket.on('connect',() => {
    console.log('已连接');
});
socket.on('user:register', (res) => {
    if (res === true){
        alert("注册成功");
        window.location.href = 'Login.html';
    }
    else if (res === false)
    {
        alert("注册失败");
    }
});

$$('uname').onfocus=()=>{
    $$('uname_note').style.visibility="visible";
};
$$('uname').onblur=()=>{
    $$('uname_note').style.visibility="hidden";
};

$$('psw').onfocus=()=>{
    $$('pword_note').style.visibility="visible";
};
$$('psw').onblur=()=>{
    $$('pword_note').style.visibility="hidden";
};

$$('email').onfocus=()=>{
    $$('email_note').style.visibility="visible";
};
$$('email').onblur=()=>{
    $$('email_note').style.visibility="hidden";
};

$$('regisform').onsubmit = (event) => {
    let authinfo = {
        user: $$('uname').value,
        password: SparkMD5.hash($$('psw').value),
        email: $$('email').value
    };
    if(authinfo.user.toString().length>12||authinfo.user.toString().length<4)
    {
        alert("用户名不合规范，请重新输入");
        return false;
    }
    if($$('psw').value.length>14||$$('psw').value.length<6)
    {
        alert("密码不合规范，请重新输入");
        return false;
    }
    socket.emit('user:register', authinfo);
    return false;
};