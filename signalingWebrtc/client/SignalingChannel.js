function SignalingChannel(room) {

  var socket = io.connect();
  socket.emit('create or join', room);

  var self = {
    send: function (message) {
      socket.emit('message', message);
    },
    onmessage: undefined
  };

  socket.on('message', function (message) {
    if (self.onmessage) self.onmessage(message);
    else console.warn("not onmessage function, message received", message);
  });
  return self;
}