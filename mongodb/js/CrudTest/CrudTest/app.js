var client = require('mongodb').MongoClient;
console.log('Hello world');
run();

function run() {
    // mongodb://<dbuser>:<dbpassword>@ds028559.mlab.com:28559/<dbname>
    var url = 'mongodb://esther:esther@ds028559.mlab.com:28559/sandbox';
    // Use connect method to connect to the Server 
    client.connect(url, function (err, db) {
        if (err) {
            console.error("Error on connection: " + err);
            return;
        }
        console.log("Connected correctly to server");

        read(db);

        //db.close();
    });
}

function read(db) {
    var cursor = db.collection('vuelos').find();
    cursor.each(function (err, doc) {
        if (err) {
            console.error("Error on read: " + err);
            return;
        }

        if (doc != null) {
            console.dir(doc);
        } else {
            console.warn("Doc not found");
        }
    });
}