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
            console.log(result);
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
            console.log(result);
            if (result.length === 0){
                fn(false);
            }
            else{
                fn(true);
            }
        });
    }

};
