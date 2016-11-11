function PhaseVocoderProcessor(frameSize) {

    var self = this;
    var _frameSize = frameSize || 2048;
    var _position = 0;
    var _newAlpha = 1;

    var receivedDecodedBufferR = new Float32List();
    var _pvR = new PhaseVocoder(_frameSize, 44100); _pvR.init();
    var _midBufR = new CBuffer(Math.round(_frameSize * 2));
    
    var adjustIfNewAlpha = function () {
        if (_newAlpha != undefined && _newAlpha != _pvR.get_alpha()) {
            console.log("New Alpha detected " + _newAlpha);
            _pvR.set_alpha(_newAlpha);
            _newAlpha = undefined;
        }
    }

    self.process = function(decodedFloat, samplesRequested) {
        //return decodedFloat;
        //console.log("DecodedFloat " + decodedFloat.length + " Samples Requested " + samplesRequested);
        var sampleCounter = 0;

        receivedDecodedBufferR.concat(decodedFloat);
        var ir = receivedDecodedBufferR;
        var or = new Float32Array(samplesRequested);

        while (_midBufR.size > 0 && sampleCounter < samplesRequested) {
            var i = sampleCounter++;
            or[i] = _midBufR.shift();
        }
        
        if (sampleCounter == samplesRequested)
            return or;

        do {
            adjustIfNewAlpha();
            var bufR = ir.subarray(_position, _position + _frameSize);

            /* LEFT */
            _pvR.process(bufR, _midBufR);
            for (var i = sampleCounter; _midBufR.size > 0 && i < samplesRequested; i++) {
                or[i] = _midBufR.shift();
            }

            sampleCounter += _pvR.get_synthesis_hop();
            _position += _pvR.get_analysis_hop();

        } while (sampleCounter < samplesRequested);

        return or;
    }
    
    self.speed = function(speed){
        _newAlpha = 2 - speed;
        console.log("speed "+speed + " alpha" + _newAlpha);
    }


}