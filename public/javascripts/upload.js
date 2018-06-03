const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';
let authinfo = null ;
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
/*
file = {
    filename, size, description, uploader, point, base64
}
 */
socket.on('func:check_privilege', (res) => {
    console.log(res);
    if (res === 1 || res === 2){
        //专家或管理员
        let files = $$('upload').files;
        let file = {} ;
        file.filename = files[0].name;
        file.size = files[0].size;
        file.description = $$('describe').value;
        file.uploader = authinfo.user ;
        file.point = $$('point').value;
        load(files[0], (res) => {
            file.base64 = res.replace(/^data:.*?;base64,/, "");
            console.log(file);
            socket.emit('expert:upload',file);
        });
    }
    else{
        //没有权限
        alert("您没有上传权限");
    }
});
socket.on('expert:upload', (res) => {
    if (res === true){
        alert("上传成功");
    }
    else
    {
        alert("上传失败");
    }
});

$$('upload_btn').onclick = () => {
    if (authinfo === null)
    {
        alert("请先登录");
        return ;
    }
    if ($$('upload').files.length === 0){
        alert("请选择文件");
        return ;
    }
    socket.emit('func:check_privilege', authinfo);
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