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
};