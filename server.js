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
                //TODO: 加入购买记录检查
                let filename = result.filename ;
                console.log(filename);
                res.download(path, filename);
            });
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
        db.up_feedback(data);
    })
    ///////////////////////////////
    //            功能
    ///////////////////////////////
    socket.on('func:search', (data) => {

    });
    socket.on('func:detail', (id) => {
        db.select_file(id, (res) => {
            socket.emit('func:detail', res);
        });
    });
    socket.on('func:check_privilege', (data) => {
        db.check_privilege(data.user, (res) => {
            socket.emit('func:check_privilege', res);
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
});