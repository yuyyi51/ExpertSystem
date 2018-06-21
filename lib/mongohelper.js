module.exports = class MongoDB{
    constructor(config) {
        this.db_url = 'mongodb://' + config.mongodb.host + ':' + config.mongodb.port.toString() + '/' + config.mongodb.db;
        this.mongo_client = require('mongodb').MongoClient;
        this.objectid = require('mongodb').ObjectID;
    }
    get_paper_and_author(_id, fn){
        this.mongo_client.connect(this.db_url, (err, cli) => {
            if (err){
                console.log('[error] - ', err.message);
                fn(null);
                cli.close();
                return;
            }
            cli.db().collection("paper").findOne({_id:this.objectid(_id)}, (err, res) => {
                if (err){
                    console.log('[error] - ', err.message);
                    cli.close();
                    fn(null);
                    return;
                }
                if (res === null){
                    cli.close();
                    fn(null);
                    return;
                }
                let f = (index) => {
                    if (index >= res.authors.length){
                        fn(res);
                        cli.close();
                        return;
                    }
                    cli.db().collection("author").findOne({name:res.authors[index].name}, (err, res2) => {
                        if (err){
                            console.log('[error] - ', err.message);
                            cli.close();
                            fn(null);
                            return;
                        }
                        res.authors[index].id = res2._id;
                        f(index+1);
                    });
                };
                f(0);
            });
        })
    }
    get_author_info_by_id(_id, fn){
        _id = this.objectid(_id);
        this.mongo_client.connect(this.db_url, (err, cli) => {
            if (err){
                console.log('[error] - ', err.message);
                fn(null);
                cli.close();
                return;
            }
            cli.db().collection("author").findOne({_id:_id}, (err, res) => {
                if (err){
                    console.log('[error] - ', err.message);
                    fn(null);
                    cli.close();
                    return;
                }
                cli.close();

                fn(res);
            });
        });
    }
    search(keyword, skip, count, fn){
        this.mongo_client.connect(this.db_url, (err, cli) => {
            if (err){
                console.log('[error] - ', err.message);
                fn(null);
                cli.close();
                return;
            }
            cli.db().collection("paper").find({$text:
                    {$search: keyword}},
                {limit: count, skip:skip}).toArray( (err, res) => {
                    if (err){
                        console.log('[error] - ', err.message);
                        fn(null);
                        cli.close();
                        return;
                    }
                    fn(res);
                });
        });
    };
    get_refer_by_id(_id, fn){
        this.mongo_client.connect(this.db_url, (err, cli) => {
            if (err) {
                console.log('[error] - ', err.message);
                fn(null);
                cli.close();
                return;
            }
            cli.db().collection("paper").findOne({_id:this.objectid(_id)}, (err, res) => {
                if (err) {
                    console.log('[error] - ', err.message);
                    cli.close();
                    fn(null);

                    return;
                }
                if (res === null){
                    cli.close();
                    fn([]);
                    return;
                }
                let refer = res.references;
                if (refer === undefined){
                    cli.close();
                    fn([]);
                    return;
                }
                cli.db().collection("paper").find({id:{$in:refer}}).toArray((err, res) => {
                    if (err) {
                        console.log('[error] - ', err.message);
                        fn(null);
                        cli.close();
                        return;
                    }
                    cli.close();
                    fn(res);
                });
            })
        })
    }
    add_new_file(json, fn){
        this.mongo_client.connect(this.db_url, (err, cli) => {
            if (err){
                console.log('[error] - ', err.message);
                fn(null);
                cli.close();
                return;
            }
            cli.db().collection("author").findOne({user:json.authors[0].name}, (err, res) => {
                if (err){
                    console.log('[error] - ', err.message);
                    cli.close();
                    fn(null);
                    return;
                }
                json.authors[0].name = res.name;
                cli.db().collection("paper").insertOne(json, (err, res) => {
                    if (err){
                        console.log('[error] - ', err.message);
                        cli.close();
                        fn(null);
                        return;
                    }
                    fn(res);
                    cli.db().collection("author").updateOne({name: json.authors[0].name}, {$inc:{count: 1}},  (err, res) => {
                        if (err){
                            console.log('[error] - ', err.message);
                            cli.close();
                            return;
                        }
                        cli.close();
                    });
                });
            });
        });
    }
    add_new_cert(json, fn){
        this.mongo_client.connect(this.db_url, (err, cli) => {
            if (err) {
                console.log('[error] - ', err.message);
                cli.close();
                fn(null);
                return;
            }
            cli.db().collection('cert').insertOne(json, (err, res) => {
                if (err) {
                    console.log('[error] - ', err.message);
                    fn(null);
                    cli.close();
                    return;
                }
                cli.close();
                fn(true);
            });
        });
    }
    get_cert(id, fn){
        this.mongo_client.connect(this.db_url, (err, cli) => {
            if (err) {
                console.log('[error] - ', err.message);
                cli.close();
                fn(null);
                return;
            }
            cli.db().collection('cert').findOne({sqlid:id}, (err, res) => {
                if (err) {
                    console.log('[error] - ', err.message);
                    fn(null);
                    cli.close();
                    return;
                }
                cli.close();
                fn(res);
            });
        });
    }
    accept_cert(sqlid, fn){
        this.mongo_client.connect(this.db_url, (err, cli) => {
            if (err) {
                console.log('[error] - ', err.message);
                cli.close();
                fn(false);
                return;
            }
            cli.db().collection('cert').findOne({sqlid:sqlid}, (err, res) => {
                if (err) {
                    console.log('[error] - ', err.message);
                    fn(false);
                    cli.close();
                    return;
                }
                res.refer = 0;
                res.count = 0;
                delete res._id;
                cli.db().collection('author').insertOne(res, (err, res) => {
                    if (err) {
                        console.log('[error] - ', err.message);
                        fn(false);
                        cli.close();
                        return;
                    }
                    cli.close();
                    fn(true);
                });

            });
        });
    }
    get_expert_intro(id, fn){
        this.mongo_client.connect(this.db_url, (err, cli) => {
            if (err) {
                console.log('[error] - ', err.message);
                cli.close();
                fn(null);
                return;
            }
            cli.db().collection('author').findOne({_id:this.objectid(id)}, (err, res) => {
                if (err) {
                    console.log('[error] - ', err.message);
                    cli.close();
                    fn(null);
                    return;
                }
                if (res === null){
                    cli.close();
                    fn(null);
                    return;
                }
                cli.db().collection('paper').find({authors:{$elemMatch:{name:res.name}}},{limit:10}).toArray((err, res2) => {
                    if (err) {
                        console.log('[error] - ', err.message);
                        cli.close();
                        res.papers = [];
                        fn(res);
                        return;
                    }
                    res.papers = res2;
                    cli.close();
                    fn(res);
                })
            })
        });
    }
};