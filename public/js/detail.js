/*
id: login => 登录
id: signup => 注册
id: user => 到个人页面的<a>
id: username => 用户名
id: logout => 退出按钮
id: search-data => 搜索框
id: search_btn => 搜索按钮
id: resource_name => 资源名
id: uploader_href => 上传者的链接
id: uploader => 上传者名
id: upload_time => 上传时间
id: filename => 文件名
id: describe => 描述
id: keywords => 关键词
id: catalog => 分类
id: btn2 => 购买资源
id: btn4 => 下载
id: need_points => 所需积分
id: confirm_need_points => 确认时的所需积分
id: purchase_times => 购买次数
id: filesize => 文件大小
id: confirm_buy => 确认购买窗口
id: confirmed_buy => 确认购买
id: not_enough_points => 积分不足窗口
 */

const socket = io.connect();
function $$(id) { return document.getElementById(id); }
let authinfo;
let user_cookie_name = 'expert_system_username';
let pwd_cookie_name = 'expert_system_password';

let need_points = null;
let now_points = null ;

function getUrlParms(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)
        return unescape(r[2]);
    return null;
}

$$('logout').onclick = () => {
    authinfo = null ;
    cookie_helper.delCookie(user_cookie_name);
    cookie_helper.delCookie(pwd_cookie_name);
    window.location.href = '/';
    return false;
};

$$('confirmed_buy_btn').onclick = () => {
    if(now_points < need_points){
        cancel();
        point_not_enough();
    }
    else {
        socket.emit('user:buy_resource', {user: authinfo.user, id: getUrlParms('id')});
    }
};

$$('btn4').onclick = () => {
    socket.emit('user:check_purchase', {user: authinfo.user, id: getUrlParms('id')});
};

socket.on('user:login', (res) => {
    if (res){
        $$('login').style.visibility = 'hidden';
        $$('signup').style.visibility = 'hidden';
        $$('username').innerHTML = authinfo.user ;
    }
    else {
        $$('user').parentNode.removeChild($$('user'));
        $$('logout').parentNode.removeChild($$('logout'));
    }
});

socket.on('func:detail', (res) => {
    if (res === null){
        alert("文件不存在");
        window.location.href = '/error';
        throw new Error("参数错误");
    }
    $$('resource_name').innerHTML = res.title;
    $$('uploader').innerHTML = res.uploader;
    $$('upload_time').innerHTML = String( new Date(res.upload_time)).split(' GM')[0];
    $$('filename').innerHTML = res.filename;
    $$('describe').innerHTML = res.description;
    $$('keywords').innerHTML = res.keyword;
    $$('catalog').innerHTML = res.category;
    $$('need_points').innerHTML = res.required_points;
    $$('confirm_need_points').innerHTML = res.required_points;
    $$('purchase_times').innerHTML = res.pur_times;
    $$('filesize').innerHTML = (res.filesize / 1024 ).toFixed(2) + 'kb';
    need_points = res.required_points;
});

socket.on('user:get_points', (res) => {
    $$('confirm_remain_points').innerHTML = res ;
    now_points = res ;
});

socket.on('user:buy_resource', (res) => {
    if (res === -1){
        alert("您已经购买过该资源");
    }
    else if (res === 1){
        alert("购买成功");
    }
    else
    {
        alert("购买失败");
    }
    cancel();
});

socket.on('user:check_purchase', (res) => {
    if (res){
        window.location.href = '/download?id=' + getUrlParms('id');
    }
    else
    {
        alert("请先购买资源");
    }
});

socket.on('func:get_5_day_purchase', (res) => {
    //console.log(res);
    let c = $$('canvas1');
    let cvs = c.getContext('2d');
    cvs.beginPath();
    cvs.moveTo(75, 300);
    cvs.lineTo(525, 300);
    cvs.lineWidth = 4 ;
    cvs.strokeStyle = "#aaaaaa";
    cvs.moveTo(75,300);
    cvs.lineTo(75, 50);
    cvs.stroke();
    cvs.closePath();
    let max = 0;
    for (let i = 0; i < 5 ; i++){
        if (max < res[i].count)
            max = res[i].count;
    }
    let unit = 180.0 / max ;
    if (max === 0)
        unit = 0 ;
    console.log(unit);
    let last_x , last_y;
    //画点和线
    for (let i = 0; i< 5 ; i ++){
        let y = 250 - res[i].count * unit;
        let x = 125 + 80 * i ;
        cvs.beginPath();
        cvs.lineWidth = 1 ;
        cvs.strokeStyle = "#ff0000";
        cvs.fillStyle = '#ff0000';
        cvs.moveTo(x-4,y-4);
        cvs.lineTo(x+4,y-4);
        cvs.lineTo(x+4,y+4);
        cvs.lineTo(x-4,y+4);
        cvs.lineTo(x-4,y-4);
        cvs.fill();
        cvs.stroke();
        cvs.closePath();
        cvs.beginPath();
        cvs.font = '20px Arial';
        cvs.fillStyle = '#000000';
        cvs.fillText(res[i].count.toString(),x-5,y-15);
        cvs.closePath();
        if (i !== 0){
            cvs.beginPath();
            cvs.moveTo(last_x,last_y);
            cvs.lineTo(x,y);
            cvs.strokeStyle = '#ff0000';
            cvs.stroke();
            cvs.closePath();
        }
        last_x = x ;
        last_y = y ;
    }

    //标注日期
    for (let i = 0 ; i < 5 ; ++i){
        cvs.beginPath();
        cvs.fillText(res[i].date.toString() + '日',125 + 80 * i - 15,320);
        cvs.closePath();
    }

    cvs.beginPath();
    cvs.fillText("日期", 530, 300);
    cvs.fillText("购买次数", 35, 40);
    cvs.closePath();
});



if (getUrlParms('id') === null){
    //alert("参数错误");
    //window.location.href = '/error';
    //throw new Error("参数错误");
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

//socket.emit('func:detail', getUrlParms('id'));
//socket.emit('func:get_5_day_purchase', getUrlParms('id'));
//if (authinfo !== null)
    //socket.emit('user:get_points', authinfo);

var result = {
    "_id" : "5b2737e44a6d35120c494308",
    "id" : "53e99822b7602d970204560f",
    "title" : "The ambitious entrepreneur",
    "authors" : [
        {
            "name" : "Lisa K Gundry"
        },
        {
            "name" : "Harold P Welsch",
            "org" : "DePaul University, Chicago, IL USA"
        }
    ],
    "venue" : "Journal of Business Venturing",
    "year" : 2001,
    "keywords" : [
        "life cycle",
        "technological change",
        "opportunity cost",
        "organization design"
    ],
    "page_start" : "453",
    "page_end" : "470",
    "lang" : "en",
    "volume" : "16",
    "issue" : "5",
    "issn" : "Journal of Business Venturing",
    "doi" : "10.1016/S0883-9026(99)00059-2",
    "url" : [
        "http://dx.doi.org/10.1016/S0883-9026(99)00059-2"
    ],
    "abstract" : "During the last two decades, researchers have sought to develop categories of entrepreneurs and their businesses along a variety of dimensions to better comprehend and analyze the entrepreneurial growth process. Some of this research has focused on differences related to industrial sectors, firm size, the geographical region in which a business is located, the use of high-technology or low-technology, and the life-cycle stage of the firm (i.e., start-up vs. more mature, formalized companies). Researchers have also considered ways in which entrepreneurs can be differentiated from small business managers. One of these classifications is based on the entrepreneur's desire to grow the business rapidly. This is the focus of our study. To date, the media have paid considerable attention to rapidly growing new ventures. However, still lacking are large-scale research studies guided by theory through which we can expand our knowledge of the underlying factors supporting ambitious expansion plans. Some research has identified factors that enhance or reduce the willingness of the entrepreneur to grow the business. Factors include the strategic origin of the business (i.e., the methods and paths through which the firm was founded); previous experience of the founder/owner; and the ability of the entrepreneur to set realistic, measurable goals and to manage conflict effectively. Our study attempted to identify the strategic paths chosen by entrepreneurs and the relation of those paths to the growth orientation of the firm. The entrepreneurs sampled in this study are women entrepreneurs across a wide range of industrial sectors. Recent reviews of entrepreneurship research have suggested the need for more studies comparing high-growth firms with slower-growth firms to better delineate their differences in strategic choices and behaviors. Our study sought to answer the following questions: What characterizes a “high growth-oriented entrepreneur?” Is this distinction associated with specific strategic intentions, prior experience, equity held in previous firms, the type of company structure in place, or success factors the entrepreneur perceives are important to the business? Do “high growth” entrepreneurs show greater entrepreneurial “intensity” (i.e., commitment to the firm's success)? Are they willing to “pay the price” for their own and their firm's success? (i.e., the “opportunity costs” associated with business success and growth). Other relationships under investigation included different patterns of financing the business' start-up and early growth. Do “high-growth” entrepreneurs use unique sources of funding compared with “lower-growth” entrepreneurs? Eight hundred thirty-two entrepreneurs responded to a survey in which they were asked to describe their growth intentions along nineteen strategic dimensions, as well as respond to the foregoing questions. Some of the strategic activity measures included adding a new product or service, expanding operations, selling to a new market, and applying for a loan to expand operations. Actual growth rates based on sales revenues were calculated, and average annualized growth rates of the industrial sectors represented in the sample were obtained. This study showed that high-growth-oriented entrepreneurs were clearly different from low-growth-oriented entrepreneurs along several dimensions. The former were much more likely to select strategies for their firms that permitted greater focus on market expansion and new technologies, to exhibit greater intensity towards business ownership (“my business is the most important activity in my life”), and to be willing to incur greater opportunity costs for the success of their firms (“I would rather own my own business than earn a higher salary while employed by someone else”). The high-growth–oriented entrepreneurs tended to have a more structured approach to organizing their businesses, which suggests a more disciplined perception of managing the firm. In summary, results showed the group of high-growth–oriented entrepreneurs, labeled “ambitious,” as having the following distinctions: strategic intentions that emphasize market growth and technological change, stronger commitment to the success of the business, greater willingness to sacrifice on behalf of the business, earlier planning for the growth of the business, utilization of a team-based form of organization design, concern for reputation and quality, adequate capitalization, strong leadership, and utilization of a wider range of financing sources for the expansion of the venture. The purpose in uncovering these differences is to enable entrepreneurs and researchers to identify more clearly the attributes of rapid-growth ventures and their founders and to move closer to a field-based model of the entrepreneurial growth process which will help delineate the alternative paths to venture growth and organizational change.",
    "references" : [
        "56d901fadabfae2eeedd8b38",
        "53e9aab0b7602d970342bb90",
        "56d901fadabfae2eeedd8d13",
        "53e99f02b7602d97027cd777",
        "53e9baecb7602d970471d754",
        "56d901fadabfae2eeedd8b16",
        "56d901fbdabfae2eeedd8ea1",
        "56d901fadabfae2eeedd8a1d",
        "56d901fadabfae2eeedd8bbb",
        "53e9b477b7602d9703f7c1cb",
        "53e9b9adb7602d97045a2fc1",
        "53e9ae10b7602d970381b30e",
        "56d853b7dabfae2eee17e967",
        "53e9acbcb7602d970369ae2f",
        "56d901fadabfae2eeedd8c73",
        "53e9af40b7602d9703980247",
        "53e9bd3eb7602d97049caea0",
        "53e9ae04b7602d970380d119",
        "56d901fadabfae2eeedd8c14",
        "56d901fbdabfae2eeedd8e4c",
        "53e9a003b7602d97028e9ab5",
        "53e9b4d9b7602d9703ffa2b9"
    ]
};

if(result.title!==undefined) $$('resource_name').innerHTML = result.title;
    else $$('resource_name').innerHTML = "暂无";
if(result.authors[0]!==undefined) $$('author1').innerHTML = result.authors[0].name + ";";
if(result.authors[1]!==undefined) $$('author2').innerHTML = result.authors[1].name + ";";
if(result.authors[2]!==undefined) $$('author3').innerHTML = result.authors[2].name + ";";
if(result.abstract!==undefined) $$('describe').innerHTML = result.abstract;
    else $$('describe').innerHTML = "暂无";
if(result.keywords[0]!==undefined) {
    var keywords = "";
    for (var i = 0; i < result.keywords.length; i++) {
        keywords = keywords + result.keywords[i].toString() + ";";
    }
    $$('keywords').innerHTML = keywords;
}
    else $$('keywords').innerHTML = "暂无";
if(result.references[0]!==undefined)
{
    for (var i = 0; i < result.references.length; i++) {
        var node = document.createElement('p');
        var part1 = document.createElement('span');
        part1.className = "ref-order";
        part1.innerHTML="[" + (i+1).toString() + "]";
        node.appendChild(part1);
        var part2 = document.createElement('span');
        part2.className = "ref-title";
        part2.innerHTML="title";   //文献标题
        node.appendChild(part2);
        var part3 = document.createElement('span');
        part3.className = "ref-type";
        part3.innerHTML="[" + "t" + "].";   //文献类别
        node.appendChild(part3);
        var part4 = document.createElement('span');
        part4.className = "ref-author";
        part4.innerHTML="author1" + "," + "author2" + ".";   //文献作者
        node.appendChild(part4);
        var part5 = document.createElement('span');
        part5.className = "magzine-type";
        part5.innerHTML="magazine" + ".";   //文献发表机构
        node.appendChild(part5);
        var part6 = document.createElement('span');
        part6.className = "ref-time";
        part6.innerHTML="year" + "(" + "month" + ")";   //文献发表机构
        node.appendChild(part6);
        $$('refer').appendChild(node);
    }
}
