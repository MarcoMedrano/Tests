//var room = prompt("Enter room name:");
var room = "one";
var signalingChannel = new SignalingChannel(room);
var selfView = document.getElementById("selfView");
var remoteView = document.getElementById("remoteView");

var configuration = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  }]
};
var pc;

// call start() to initiate

function start() {
  pc = new RTCPeerConnection(configuration);

  // send any ice candidates to the other peer
  pc.onicecandidate = function (message) {
    console.info("onicecandidate", message);
    if (message.candidate)
      signalingChannel.send({
        'candidate': message.candidate
      });
  };

  // let the 'negotiationneeded' event trigger offer generation
  pc.onnegotiationneeded = function () {
    pc.createOffer(localDescCreated, logError);
  }

  // once remote stream arrives, show it in the remote video element
  pc.onaddstream = function (evt) {
    remoteView.src = URL.createObjectURL(evt.stream);
  };

  // get a local stream, show it in a self-view and add it to be sent
  navigator.getUserMedia({
    'audio': true,
    'video': true
  }, function (stream) {
    selfView.src = URL.createObjectURL(stream);
    pc.addStream(stream);
  }, logError);
}

function localDescCreated(desc) {
  pc.setLocalDescription(desc, function () {
    signalingChannel.send({
      'sdp': pc.localDescription
    });
  }, logError);
}

signalingChannel.onmessage = function (message) {
  console.info("onmessage", message);
  if (!pc)
    start();

  if (message.sdp)
    pc.setRemoteDescription(new RTCSessionDescription(message.sdp), function () {
      // if we received an offer, we need to answer
      if (pc.remoteDescription.type == 'offer')
        pc.createAnswer(localDescCreated, logError);
    }, logError);
  else
    pc.addIceCandidate(new RTCIceCandidate(message.candidate));
};

function logError(error) {
  log(error.name + ': ' + error.message);
}
