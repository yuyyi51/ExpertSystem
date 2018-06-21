const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';
let authinfo = null ;

function getUrlParms(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)
        return unescape(r[2]);
    return null;
}


function introduction_load(result)
{
    if(result.name !== undefined)
        $$('name').innerHTML = result.name;
    else
        $$('name').innerHTML = "暂无";
    if(result.org !== undefined)
        if(result.org[0] !== undefined)
            $$('education').innerHTML = result.org[0];
        else  $$('education').innerHTML = "暂无";
    else
        $$('education').innerHTML = "暂无";
    if(result.foc !== undefined)
    {
        var major="";
        for(var i=0;i<result.foc.length && i<10;i++)
        {
            major += result.foc[i] + "<br>";
        }
        $$('major').innerHTML = major;
    }
    else
        $$('major').innerHTML = "暂无";
    if(result.count !== undefined)
    {
        $$('job_title').innerHTML= result.count;
    }
    else
        $$('job_title').innerHTML = "暂无";
    if(result.phone !== undefined || result.phone === "")
    {
        $$('phone').innerHTML = result.phone;
    }
    else
        $$('phone').innerHTML = "暂无";
    if(result.email !== undefined || result.email === "")
    {
        $$('email').innerHTML = result.email;
    }
    else
        $$('email').innerHTML = "暂无";
    if(result.refer !== undefined)
    {
        $$('talent_category').innerHTML = result.refer;
    }
    else
        $$('talent_category').innerHTML = "暂无";
    if(result.description !== undefined)
        $$('bried_introduction').innerHTML = result.description;
    else
        $$('bried_introduction').innerHTML = "暂无";
    resouce_list_load(result.papers);
}

function resouce_list_load(array)    //[{title:string, uptime:str}]
{
    for(var i=0;i<array.length;i++)
    {
        var tr = $$('table').insertRow();
        var td1=tr.insertCell();
        var td2=tr.insertCell();
        var td3=tr.insertCell();
        td1.innerHTML = (i+1).toString();
        td2.innerHTML = '<a href="detail.html?id=' + array[i]._id + '">' + array[i].title + '</a>';
        td3.innerHTML = array[i].year;
    }
}
//introduction_load(result);

socket.on('func:get_expert_intro', (res) => {
    //console.log(res);
    introduction_load(res);
});
socket.on('expert:get_author_id', (res) => {
    console.log(res);
    console.log(getUrlParms('id'));
    if (res === getUrlParms('id')){
        $$('change').style.visibility = 'visible';
    }
});
socket.on('user:login', (res) => {
    if (res){
        socket.emit('expert:get_author_id', authinfo.user);
    }
    else {
        cookie_helper.delCookie(user_cookie_name);
        cookie_helper.delCookie(pwd_cookie_name);
    }
});

if (getUrlParms('id') === null || getUrlParms('id') === ""){
    alert("参数错误");
    window.location.href = '/error';
    throw new Error("参数错误");
}

authinfo = {
    user : cookie_helper.getCookie(user_cookie_name),
    password : cookie_helper.getCookie(pwd_cookie_name)
};

if (authinfo.user === null || authinfo.password === null)
{
    authinfo = null ;
    $$('user').parentNode.removeChild($$('user'));
    $$('logout').parentNode.removeChild($$('logout'));
}
else
{
    socket.emit('user:login', authinfo);
}

socket.emit('func:get_expert_intro',getUrlParms('id'));