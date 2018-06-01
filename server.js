const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const sql = require('./lib/mysqlhelper');
const config = require('./lib/config');
const db = new sql(config);
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

app.use('/', express.static(__dirname + '/public'));
app.get('/ppp', function (req, res) {
    res.send('Hello World!');
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
io.on('connection',(socket) => {
    console.log('visitor connected.');
    socket.on('disconnect', (reason) => {
        console.log('visitor disconnected')
    });

    //////////////////////////////
    //          用户相关
    //////////////////////////////
    socket.on('user:register', (data) => {
        res = db.register(data.user, data.password, (res) => {
            socket.emit('user:register', res);
        });

    });
    socket.on('user:login', (data) => {
        res = db.login(data.user, data.password);
        socket.emit('user:login', res);
    });

    ///////////////////////////////
    //            功能
    ///////////////////////////////
    socket.on('func:search', (data) => {

    });
    socket.on('func:detail', (id) => {

    });

});