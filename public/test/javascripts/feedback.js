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
    if (res){
        alert("反馈成功");
    }
    else{
        alert("反馈失败");
    }
});
$$('feedback').onclick = () => {
    let ftopic = $('input[name = fname]:checked').val();
    let ftype = $$('selectz').text();
    let fdetails = $$('msgbox').text();
    feedback={
        topic=ftopic;
        type=ftype;
        details=fdetails;
        advicer=authinfo.user;
    }
    socket.emit('user:feedback', feedback);
};
$$('testbu').onclick = () => {
    document.write('asdasdasd');
    const sql = require('./lib/mysqlhelper');
    const config = require('./lib/config');
    const db = new sql(config);
    let ftopic = $('input[name = fname]:checked').val();
    let ftype = $$('selectz').text();
    let fdetails = $$('msgbox').text();
    feedback={
        topic=ftopic;
    type=ftype;
    details=fdetails;
    advicer=authinfo.user;
}
    db.up_feedback(feedback);
}