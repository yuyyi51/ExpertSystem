const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';
let authinfo = null ;

var result = {
    "_id" : "5b2756594a6d3537a0ef5e5f",
    "foc" : [
        "biomedical research",
        "bioinformatics",
        "emphysema/with papilloedema",
        "nerves/optic"
    ],
    "org" : [
        "Chase Farm Hospital, Enfield, Middlesex, United Kingdom."
    ],
    "name" : "T. Simpson",
    "count" : 3,
    "refer" : 0
};

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
        for(var i=0;i<result.foc.length;i++)
        {
            major += result.foc[i] + ";";
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
    if(result.refer !== undefined)
    {
        $$('talent_category').innerHTML = result.refer;
    }
    else
        $$('talent_category').innerHTML = "暂无";
    if(result.intro !== undefined)
        $$('bried_introduction').innerHTML = result.intro;
    else
        $$('bried_introduction').innerHTML = "暂无";
    var resouce = [
        {
            title:"title1",
            uptime:"time"
        },
        {
            title:"title2",
            uptime:"time2"
        }
    ]
    resouce_list_load(resouce);
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
        td2.innerHTML = array[i].title;
        td3.innerHTML = array[i].uptime;
    }
}
introduction_load(result);