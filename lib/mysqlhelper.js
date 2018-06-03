module.exports = class mysqlhelper{
    constructor(config) {
        this.connection = require("mysql").createConnection(config.db);
        this.connection.connect();
    }
    close(){
        this.connection.end();
    }
    register(user, pw, fn){
        let check = 'select username from user where username = ?';
        let check_params = [user];
        this.connection.query(check, check_params, (err, result) => {
           if (err){
               console.log('[error] - ', err.message);
               fn(false);
               return;
            }
            if (result.length !== 0){
                fn(false);
                return;
            }
            let query = 'insert into user(username, password) values(?,?)';
            let params = [user, pw];
            this.connection.query(query, params, (err, result) => {
                if (err){
                    console.log('[error] - ', err.message);
                    fn(false);
                    return;
                }
                console.log('[register] - ', result);
                fn(true);
            });
        });
    }
    login(user, pw, fn){
        let query = 'select username from user where username = ? and password = ?' ;
        let params = [user, pw];
        this.connection.query(query, params, (err, result) => {
            if (err){
                console.log('[error] - ', err.message);
                fn(false);
                return;
            }
            if (result.length === 0){
                fn(false);
            }
            else{
                fn(true);
            }
        });
    }
    check_privilege(user, fn){
        let query = 'select privilege from user where username = ?';
        let params = [user];
        this.connection.query(query, params, (err, result) => {
            if (err){
                console.log('[error] - ', err.message);
                fn(false);
                return;
            }
            if (result.length === 0){
                fn(0);
            }
            else {
                fn(result[0].privilege);
            }
        });
    }
    /*
    file = {
        filename, size, description, uploader, point
    }
    */
    upload_file(file, fn){
        let query1 = "select user_id from user where username = ?";
        let params1 = [file.uploader];
        this.connection.query(query1, params1, (err, res) => {
            if (err){
                console.log('[error] - ', err.message);
                fn(-1);
                return;
            }
            if (res.length === 0){
                fn(-1);
                return;
            }
            file.uploader = res[0].user_id;
            let query = "insert into resource(filename, filesize, uploader, description, required_points) values(?,?,?,?,?)";
            let params = [file.filename, file.size, file.uploader, file.description, file.point];
            this.connection.query(query, params, (err, res) => {
                if (err){
                    console.log('[error] - ', err.message);
                    fn(-1);
                    return;
                }
                let query2 = "insert into upload_res(upload_user_id, upload_res_id) values(?,?)";
                let params2 = [file.uploader, res.insertId];
                this.connection.query(query2, params2, (err, res) => {
                    if (err){
                        console.log('[error] - ', err.message);
                        return;
                    }
                });
                fn(res.insertId);
            });
        });
    }

    select_file(id, fn){
        let query = "select * from resource where resource_id = ?";
        let params = [id];
        this.connection.query(query, params, (err, res) => {
            if (err) {
                console.log('[error] - ', err.message);
                fn(null);
                return;
            }
            fn(res);
        });
    }

    buy_points(user, points, fn){
        let query = "update user set points = points + ? where username = ?";
        let params = [points, user];
        this.connection.query(query, params, (err, res) => {
            if (err){
                console.log('[error] - ', err.message);
                fn(false);
                return;
            }
            fn(true);
        });
    }

};
