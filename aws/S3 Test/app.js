console.log('Loading');

exports.handler = function (event, context) {

    var S3Bucket = require("ee-aws-s3-bucket");
    
    var myBucket = new S3Bucket({
        key: ""
        , secret: ""
        , bucket: "storage-staging"
        , maxConcurrent: 10 				// generic limit, overrrides the default of 10
        , maxConcurrentDownloads: 100 		// limit to 100 concurrent downloads, overrides the generic limit
        , maxConcurrentUploads: 50 			// limit to 50 concurrent uploads, overrides the generic limit
        , maxConcurrentDeletes: 200 		// limit to 200 concurrent deletes, overrides the generic limit
        , maxConcurrentLists: 5 			// limit to 5 concurrent lists, overrides the generic limit
    });
    
    console.log("hola nena");
    
    var handleListResult = function (err, list, next) {
        if (err) console.log(err);
        else {
            console.log(list);
            
            // get the next 1'000 items if available
            if (next) next(handleListResult);
        }
    };
    
    myBucket.list("/1301/10/", handleListResult);
};
