function PhaseVocoderProcessor(frameSize) {

    var self = this;
    var _frameSize = frameSize || 4096;
    var _position = 0;
    var _newAlpha = 1;
    
    var _pvR = new PhaseVocoder(_frameSize, 44100); _pvR.init();
    var _midBufR = new CBuffer(Math.round(_frameSize * 2));

    self.process = function(decodedFloat, samplesRequested) {
        return decodedFloat;
       
    }
}