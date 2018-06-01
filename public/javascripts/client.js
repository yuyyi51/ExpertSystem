const socket = io.connect();
function $$(id) { return document.getElementById(id); }

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
    else
    {
        alert("???");
    }
});

$$('b1').onclick = () => {
    let authinfo = {
        user: $$('input1').value,
        password: $$('input2').value
    };
    socket.emit('user:register', authinfo);
};