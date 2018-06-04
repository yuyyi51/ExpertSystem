const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';
let authinfo = null ;

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
socket.on('user:feedback',(res) => {
    if (res==1){
        alert("反馈成功，请等待管理员处理");
    }
    else{
        if(res==2){
            alert("已提交过相同反馈，请耐心等待，不要重复提交")
        }
        else
            alert("反馈失败");
    }
});
$$('feedback').onsubmit= (event) => {
    let ftopic = $("input[name = fname]").val();
    let ftype = $$('selectz').value;
    let fdetails = $$('msgbox').value;
    feedback={
        topic:ftopic,
        type:ftype,
        details:fdetails,
        advicer:authinfo.user
    };
    socket.emit('user:feedback', feedback);
    return false;
};


