const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const sql = require('./lib/mysqlhelper');
const config = require('./lib/config');
const db = new sql(config);
const SparkMD5 = require('spark-md5');
const fs = require('fs');
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

app.use('/', express.static(__dirname + '/public/'));

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
    data : { data : str, password : str }
     */
    socket.on('user:register', (data) => {
        log(data.user + " 尝试注册");
        db.register(data.user, calcSaltMd5(data.password), (res) => {
            if (res)
                log(data.user + " 注册成功");
            else
                log(data.user + " 注册失败");
            socket.emit('user:register', res);
        });

    });

    /*
    登录
    data : { data : str, password : str }
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

    ///////////////////////////////
    //            功能
    ///////////////////////////////
    socket.on('func:search', (data) => {

    });
    socket.on('func:detail', (id) => {

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