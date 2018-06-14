const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const sql = require('./lib/mysqlhelper');
const config = require('./lib/config');
const db = new sql(config);
const SparkMD5 = require('spark-md5');
const fs = require('fs');
const cookie = require('cookie-parser');
const admZip = require('adm-zip');
/*
http.listen(3000, () => {
    console.log('listening on *:' + 3000);
});


app.use('/', express.static(__dirname + '/public'));

io.on('connection',(socket) => {
    console.log('visitor connected.');
    socket.on('button',() => {
        console.log('button clicked');
    })
});
*/

function getReqCookie(req, name)//取cookies函数
{
    var arr = req.cookies.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
    if (arr != null) {
        return unescape(arr[2]);
    } else {
        return null;
    }

}

//app.use('/', express.static(__dirname + '/public/'));
app.use('/', express.static(__dirname + '/public/'));
app.use(cookie());
app.get('/error', (req, res) => {
    res.send("出现错误");
});
app.get('/download', (req, res) => {
    let id = req.query.id ;
    let path = config.file_path + id ;
    if (id === null || id === undefined){
        res.send("参数错误");
        return;
    }
    let username = req.cookies.expert_system_username;
    let password = req.cookies.expert_system_password;
    if (username === null || password === null){
        res.send("没有下载权限或文件不存在");
        return;
    }
    db.login(username, calcSaltMd5(password), (result) => {
        if (!result){
            res.send("没有下载权限或文件不存在");
            return;
        }
        db.check_purchase(username, id, (result) => {
            if (!result){
                res.send("没有下载权限或文件不存在");
                return;
            }
            db.select_file(id, (result) => {
                if (result === null){
                    res.send("没有下载权限或文件不存在");
                    return;
                }
                let filename = result.filename ;
                console.log(filename);
                res.download(path, filename);
            });
        });
    });
});

app.get('/download_cert', (req, res) => {
    let id = req.query.id ;
    let path = config.auth_path + id + '.zip' ;
    if (id === null || id === undefined){
        res.send("参数错误");
        return;
    }
    let username = req.cookies.expert_system_username;
    let password = req.cookies.expert_system_password;
    if (username === null || password === null){
        res.send("没有下载权限或文件不存在");
        return;
    }
    db.login(username, calcSaltMd5(password), (result) => {
        if (!result){
            res.send("没有下载权限或文件不存在");
            return;
        }
        db.check_privilege(username, (result) => {
            if (result !== 2){
                res.send("没有下载权限或文件不存在");
                return;
            }
            let filename = id + '.zip';
            res.download(path,filename);
        });
    });
});
process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
        db.close();
        process.exit();
    }
});

http.listen(3000, () => {
    console.log('listening on *:' + 3000);
});

/////////////////////////////////////////
//              功能
/////////////////////////////////////////
function calcSaltMd5(pass){
    return SparkMD5.hash(config.salt + pass + config.salt);
}
function log(str){
    console.log(new Date().toLocaleString() + " : " + str);
}

io.on('connection',(socket) => {
    console.log('visitor connected.');
    socket.on('disconnect', (reason) => {
        console.log('visitor disconnected')
    });

    //////////////////////////////
    //          用户相关
    //////////////////////////////
    /*
    注册
    data : { user : str, password : str }
     */
    socket.on('user:register', (data) => {
        log(data.user + " 尝试注册");
        db.register(data.user, calcSaltMd5(data.password), data.email, (res) => {
            if (res)
                log(data.user + " 注册成功");
            else
                log(data.user + " 注册失败");
            socket.emit('user:register', res);
        });

    });

    /*
    登录
    data : { user : str, password : str }
     */
    socket.on('user:login', (data) => {
        console.log(data.user + " 尝试登录");
        db.login(data.user, calcSaltMd5(data.password), (res) => {
            if (res)
                log(data.user + " 登录成功");
            else
                log(data.user + " 登录失败");
            socket.emit('user:login', res);
        });

    });
    /*
    购买积分
    data : { user : str, points : int }
     */
    socket.on('user:buy_points', (data) => {
        db.buy_points(data.user, data.points, (res) => {
            if (res){
                log(data.user + " 购买成功，积分增加 " + data.points);
            }
            else{
                log(data.user + "购买失败");
            }
            socket.emit('user:buy_points', res);
        });
    });

    /*
    已购买返回-1，成功返回1，失败返回0
     */
    socket.on('user:buy_resource', (data) => {
        console.log(data);
        db.check_purchase(data.user, data.id, (res) => {
            if (res){
                //已购买
                socket.emit('user:buy_resource', -1);
                return;
            }
            db.buy_resource(data.user, data.id, (res) => {
                if (res){
                    //成功
                    socket.emit('user:buy_resource', 1) ;
                }
                else
                {
                    socket.emit('user:buy_resource', 0) ;
                }
            });
        });
    });

    socket.on('user:get_points', (data) => {
        db.get_points(data.user, (res) => {
            socket.emit('user:get_points', res);
        });
    });
    
    socket.on('user:check_purchase', (data) => {
        db.check_purchase(data.user, data.id , (res) => {
            socket.emit('user:check_purchase', res);
        });
    });
    /*
    提交反馈
    data : { topic : str, type : str, details : str, advicer str}
     */
    socket.on('user:feedback',(data) =>{
        db.up_feedback(data,(res)=>{
            if (res==1){
                log(data.advicer + " 提交反馈成功 ");
            }
            else{
                if(res==2){
                    log(data.advicer + " 已提交过相同反馈，提交失败 ");
                }
                else
                    log(data.advicer + " 提交失败");
            }
            socket.emit('user:feedback', res);
        });
    });
    /*
    data : {
        user : str,
        name : str,
        id_number : str,
        description : str,
        files : [{base: str, filename: str}]
    }
     */
    socket.on('user:certify', (data) => {
        //console.log(data);
        let user = data.user ;
        let id_number = data.id_number;
        let description = data.description;
        let name = data.name;
        let files = data.files;
        db.add_certify_request(user, name, id_number, description, (res) => {
            if (res === null)
            {
                socket.emit('user:certify', false);
                return;
            }
            let zip = new admZip();

            for (let i = 0; i < files.length ; ++i){
                let file = files[i];
                let filebuffer = new Buffer(file.base, 'base64');
                let splited = file.filename.split('.');
                let p = splited[splited.length-1];
                zip.addFile(i.toString() + '.' + p, filebuffer);

            }
            zip.writeZip(config.auth_path + res + ".zip");
            socket.emit('user:certify', true);
            /*
            let wstream = fs.createWriteStream(config.auth_path + res, {
                flags : 'w',
                encoding: 'binary'
            });
            wstream.on('open', () => {
                wstream.write(JSON.stringify(files), 'utf8');
                wstream.end();
            });
            wstream.on('close', () => {
                socket.emit('user:certify', true);
            });
            */
        });
    });
    ///////////////////////////////
    //            功能
    ///////////////////////////////
    /*
    data : { keywords : str[] , page : int }
     */
    socket.on('func:search', (data) => {
        //TODO: 服务器搜索功能
        let pagecount = 10 ;
        let start = (data.page-1) * pagecount;
        db.search(data.keywords, start, pagecount, (res) => {
            socket.emit('func:search', res);
        });
    });
    socket.on('func:detail', (id) => {
        db.select_file(id, (res) => {
            db.get_username_by_id(res.uploader, (res2) => {
                res.uploader = res2 ;
                socket.emit('func:detail', res);
            });
        });
    });
    socket.on('func:check_privilege', (data) => {
        db.check_privilege(data.user, (res) => {
            socket.emit('func:check_privilege', res);
        });
    });
    socket.on('func:get_5_day_purchase', (id) => {
        db.get_last_5_day_purchase(id, (res) => {
            socket.emit('func:get_5_day_purchase', res);
        });
    });
    socket.on('expert:upload', (data) => {
        let base = data.base64 ;
        let uname = data.uploader ;
        data.base64 = null ;
        db.upload_file(data, (res) => {
            if (res === -1){
                socket.emit('expert:upload', false);
                return ;
            }
            let filename = res ;
            let filebuffer = new Buffer(base, 'base64');
            let wstream = fs.createWriteStream(config.file_path + filename, {
                flags : 'w',
                encoding: 'binary'
            });
            wstream.on('open', () => {
                wstream.write(filebuffer);
                wstream.end();
            });
            wstream.on('close', () => {
                log(uname + " 上传了文件 " + data.filename + "，id为 " + res);
                socket.emit('expert:upload', true);
            });
        });

    });
    socket.on('admin:get_feedback', () => {
        db.get_feedback((res) => {
            socket.emit('admin:get_feedback', res);
        });
    });
    socket.on('admin:change_feedback_state', (id) => {
        db.change_feedback_state(id, (res) => {
            socket.emit('admin:change_feedback_state', res);
        });
    });
    socket.on('admin:get_auth_request', () => {
        db.get_auth_request((res) => {
            socket.emit('admin:get_auth_request', res);
        });
    });
    socket.on('admin:accept_request', (id,name,fn) => {
        db.certificate_pass(id,name,(res)=>{
            if(res) {
                log("成功提升用户"+name+"成为专家用户");
                fn(true);
            }
            else {
                log("未能提升用户"+name+"成为专家用户");
                fn(false);
            }
        });
    });
    socket.on('admin:reject_request', (id,name,fn) => {
        db.certificate_refuse(id,(res)=>{
            if(res) {
                log("成功拒绝用户"+name+"的认证申请");
                fn(true);
            }
            else {
                log("未能拒绝用户"+name+"的认证申请");
                fn(false);
            }
        });
    });
});