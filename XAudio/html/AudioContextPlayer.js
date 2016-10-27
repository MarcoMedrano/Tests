function AudioContextPlayer(buffer) {

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var self = this;
    var context = new AudioContext();

    var playWithAudioContext = function (buffer) {
        var source = context.createBufferSource(); // creates a sound source
        //var rightChannel = buffer.getChannelData(0); //encoded on Float32
        //var left = buffer.getChannelData(1);
        source.buffer = buffer; // tell the source which sound to play
        source.connect(context.destination); // connect the source to the context's destination (the speakers)
        source.start(0); // play the source now
    };

    self.play = function () {
        context.decodeAudioData(buffer, playWithAudioContext, function (e) { console.error(e); });
    };
}