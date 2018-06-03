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

$$('regisform').onsubmit = (event) => {
    let authinfo = {
        user: $$('uname').value,
        password: SparkMD5.hash($$('psw').value),
        email: $$('email').value
    };
    socket.emit('user:register', authinfo);
    return false;
};