// self.addEventListener('message', function(e) {
//   self.postMessage(e.data + "Mark was here :P");
// }, false);
  obj = null;

self.onmessage = function(event) {
  
  //self.postMessage("WORKER: " + event.text);

  switch (event.data.text) {
    case 'init':
    	obj = {text:'hey', data:event.data.data};
    	var view = new Uint8Array(obj.data);
    	view [0] = 1;

      	self.postMessage(obj, [obj.data]);
      break;
    case 'next':
    	obj.data = event.data.data;
    	//console.log('WORKER text='+ obj.text + ' data=' + obj.data.byteLength);
    	var view = new Uint8Array(obj.data);
    	
    	for (var i = 0; i < view.byteLength; i++) {
    		view[i] += 1;
    	};

    	self.postMessage(obj, [obj.data]);
    break;
	}
};