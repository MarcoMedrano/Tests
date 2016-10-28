function AudioContextPlayer(buffer, onEndedCallback) {

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var self = this;
    var context = new AudioContext();
    var source = context.createBufferSource(); // creates a sound source
    if (onEndedCallback) source.onended = onEndedCallback;

    var playWithAudioContext = function (buffer) {
        
        //var rightChannel = buffer.getChannelData(0); //encoded on Float32
        //var left = buffer.getChannelData(1);
        source.buffer = buffer; // tell the source which sound to play
        source.connect(context.destination); // connect the source to the context's destination (the speakers)
        source.start(0); // play the source now
    };

    self.play = function () {
        context.decodeAudioData(buffer, playWithAudioContext, function (e) { console.error(e); });
    };

    self.stop = function() {
        source.stop();
    };
}