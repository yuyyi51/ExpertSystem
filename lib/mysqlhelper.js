module.exports = class mysqlhelper{
    constructor(config) {
        this.connection = require("mysql").createConnection(config.db);
        this.connection.connect();
    }
    close(){
        this.connection.end();
    }
    register(user, pw, fn){
        var check = 'select username from user where username = ?';
        var check_params = [user];
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
            var query = 'insert into user(username, password) values(?,?)';
            var params = [user, pw];
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
    login(user, pw){

    }

};
