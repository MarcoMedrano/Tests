function PhaseVocoderProcessor2(frameSize) {

    var self = this;
    var _frameSize = frameSize || 4096/8;
    var _pvL = new PhaseVocoder(_frameSize, 44100); _pvL.init();
    var _pvR = new PhaseVocoder(_frameSize, 44100); _pvR.init();
    var _buffer;
    var _position = 0;
    var _newAlpha = 1;
    
    var _midBufL = new CBuffer(Math.round(_frameSize * 2));
    var _midBufR = new CBuffer(Math.round(_frameSize * 2));
    
    var receivedDecodedBufferR = new Float32List();

    self.process = function(decodedFloat, samplesRequested) {
        if (!receivedDecodedBufferR)
            return;

        receivedDecodedBufferR.concat(decodedFloat);
        console.log("Called process");
        var sampleCounter = 0;
        
        //var il = _buffer.getChannelData(0);
        var il = receivedDecodedBufferR;
        //var ir = _buffer.getChannelData(0);
        var ir = receivedDecodedBufferR;
        //var ol = outputAudioBuffer.getChannelData(0);
        var ol = new Float32Array(samplesRequested);
        //var or = outputAudioBuffer.getChannelData(1);
        var or = new Float32Array(samplesRequested);
        
        
        while (_midBufR.size > 0 && sampleCounter < ol.length) {
            var i = sampleCounter++;
            ol[i] = _midBufL.shift();
            or[i] = _midBufR.shift();
        }
        
        if (sampleCounter == ol.length)
            return ol;
        
        do {
            
            var bufL = il.subarray(_position, _position + _frameSize);
            var bufR = ir.subarray(_position, _position + _frameSize);
            
            if (_newAlpha != undefined && _newAlpha != _pvL.get_alpha()) {
                _pvL.set_alpha(_newAlpha);
                _pvR.set_alpha(_newAlpha);
                _newAlpha = undefined;
            }
            
            
            /* LEFT */
            _pvL.process(bufL, _midBufL);
            console.warn(_midBufL);
            _pvR.process(bufR, _midBufR);
            for (var i = sampleCounter; _midBufL.size > 0 && i < ol.length; i++) {
                ol[i] = _midBufL.shift();
                or[i] = _midBufR.shift();
            }
            
            sampleCounter += _pvL.get_synthesis_hop();
            
            _position += _pvL.get_analysis_hop();
            console.log('new position ' + _position);
        } while (sampleCounter < ol.length);

        return ol;
    }
    
    self.speed = function(speed){
        _newAlpha = 2 - speed;
        console.log("speed "+speed + " alpha" + _newAlpha);
    }

    Object.defineProperties(this, {
        'position' : {
            get : function () {
                return _position;
            }, 
            set : function (newPosition) {
                _position = newPosition;
            }
        }, 
        'alpha' : {
            get : function () {
                return _pvL.get_alpha();
            }, 
            set : function (newAlpha) {
                _newAlpha = newAlpha;
            }
        }
    });
}