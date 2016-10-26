function FileLoader() {
    var self = this;

    self.load = function (fileName, callback){

        var request = new XMLHttpRequest();
        request.open('GET', fileName, true);
        request.responseType = 'arraybuffer';
        
        // Decode asynchronously
        request.onload = function () {
            var uint8Array = new Uint8Array(request.response);
            console.info('received ' + uint8Array.length);

             callback(uint8Array);
        }

        request.send();
    };

}