function FileLoader() {
    var self = this;

    self.load = function (fileName, callback){

        var request = new XMLHttpRequest();
        request.open('GET', fileName, true);
        request.responseType = 'arraybuffer';
        
        // Decode asynchronously
        request.onload = function () {
            console.info('FileLoader: received ' + request.response.byteLength);

             callback(request.response);
        }
        request.send();
    };

}