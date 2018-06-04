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
            let query = "insert into resource(filename, filesize, uploader, description, required_points, title, category, keyword) values(?,?,?,?,?,?,?,?)";
            let params = [file.filename, file.size, file.uploader, file.description, file.point, file.title, file.category, file.keywords];
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
            if (res.length === 0){
                fn(null);
                return;
            }
            //console.log(res[0]);
            //console.log(String(res[0].upload_time).split(' GM')[0]);
            fn(res[0]);
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

    get_points(user, fn){
        let query = "select points from user where username = ?";
        let params = [user];
        this.connection.query(query, params, (err, res) => {
            if (err){
                console.log('[error] - ', err.message);
                fn(null);
                return;
            }
            if (res.length === 0)
            {
                fn(null);
                return ;
            }
            fn(res[0].points);
        });
    }

    check_purchase(user, resource_id, fn){
        let query = 'select count(*) as \'count\' from user inner join purchase_res on user.user_id = purchase_res.pur_user_id where user.username = ? and purchase_res.resource_id = ?';
        let params = [user, resource_id];
        this.connection.query(query, params, (err, res) => {
            if (err){
                console.log('[error] - ', err.message);
                fn(false);
                return;
            }
            console.log(res);
            if (res[0].count === 0)
            {
                fn(false);
                return;
            }
            fn(true);
        });

    }

    reduce_point(user, num, fn){
        let query = "update user set points = points - ? where username = ?";
        let params = [num, user];
        this.connection.query(query, params, (err, res) => {
            if (err){
                console.log('[error] - ', err.message);
                fn(false);
                return;
            }
            fn(true);
        });
    }

    buy_resource(user, resource_id, fn){
        let query = "insert into purchase_res(pur_user_id, resource_id) values((select user_id from user where username = ?),?)";
        let params = [user, resource_id];
        this.get_points(user, (now_point) => {
            if (now_point === null){
                fn(false);
                return;
            }

            this.select_file(resource_id, (file) => {
                if (file === null)
                {
                    fn(false);
                    return ;
                }
                if (now_point < file.required_points) {
                    fn(false);
                    return ;
                }
                this.reduce_point(user, file.required_points, (sus) => {
                    if (!sus){
                        fn(false);
                        return ;
                    }
                    this.connection.query(query, params, (err, res) => {
                        if (err){
                            console.log('[error] - ', err.message);
                            fn(false);
                            return;
                        }
                        fn(true);
                    });
                });

            });
        });
    };

    up_feedback(feedback,fn) {
        let query = "insert into feedback(feedback_type,feedback_content,feedback_topic) values(?,?,?)";
        let params = [feedback.type, feedback.details, feedback.topic];
        this.connection.query(query, params, (err, res) => {
            if (err) {
                console.log('[error] - ', err.message);
                fn(false);
                return;
            }
        });
        let sel1 = "select user_id from user where username = ?";
        let parm1 = [feedback.advicer];
        this.connection.query(sel1, parm1, (err, userid) => {
            if (err) {
                console.log('[error1] - ', err.message);
                fn(false);
                return;
            }
            let sel2 = "select feedback_id from feedback where feedback_content = ? and feedback_type = ?";
            let parm2 = [feedback.details,feedback.type];
            this.connection.query(sel2, parm2, (err, feedbackid) => {
                if (err) {
                    console.log('[error2] - ', err.message);
                    fn(0);
                    return;
                }
                let sel3="select submit_user_id from submit_feedback where feedback_id = ?";
                let parm4=[feedbackid[0].feedback_id];
                this.connection.query(sel3,parm4,(err,res2)=>{
                    if (err) {
                        console.log('[error] - ', err.message);
                        fn(0);
                        return;
                    }
                    else
                    {
                        if(res2.length!==0){
                            if(res2[0].submit_user_id==userid[0].user_id)
                            {
                                fn(2);
                                return;
                            }
                        }
                            let ins = "insert into submit_feedback(feedback_id,submit_user_id,state) values(?,?,?)";
                            let parm3 = [feedbackid[0].feedback_id, userid[0].user_id, 0];
                            this.connection.query(ins, parm3, (err, resu) => {
                                if (err) {
                                    console.log('[error3] - ', err.message);
                                    fn(0);
                                    return;
                                }
                                fn(1);
                            });
                    }
                });

            });
        });
        return;
    };
};
