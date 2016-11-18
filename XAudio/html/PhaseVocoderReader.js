function PhaseVocoderReader(source, _frameSize, _sampleRate) {
    
    var self = this;
    var frameSize = _frameSize || 4096 / 8;
    var sampleRate = _sampleRate || 44100;
    var _pvL = new PhaseVocoder(frameSize, sampleRate); _pvL.init();
    var _pvR = new PhaseVocoder(frameSize, sampleRate); _pvR.init();
    var _buffer;
    var _position = 0;
    var _newAlpha = 1;
    
    var _midBufL = new CBuffer(Math.round(frameSize * 2));
    var _midBufR = new CBuffer(Math.round(frameSize * 2));
    
    var receivedDecodedBufferR = new Float32List();
    
    self.reachedEnd = false;

    self.read = function(samplesRequested) {
        console.info('PhaseVocoderReader:samplesRequested : ' + samplesRequested);
        var decodedFloat = source.read(samplesRequested*2);
        console.info('PhaseVocoderReader:samplesGotten : ' + decodedFloat.length);

        receivedDecodedBufferR.concat(decodedFloat);
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
            
            var bufL = il.subarray(_position, _position + frameSize);
            var bufR = ir.subarray(_position, _position + frameSize);
            
            if (_newAlpha != undefined && _newAlpha != _pvL.get_alpha()) {
                _pvL.set_alpha(_newAlpha);
                _pvR.set_alpha(_newAlpha);
                _newAlpha = undefined;
            }
            
            
            /* LEFT */
            _pvL.process(bufL, _midBufL);
            //console.warn(_midBufL);
            _pvR.process(bufR, _midBufR);
            for (var i = sampleCounter; _midBufL.size > 0 && i < ol.length; i++) {
                ol[i] = _midBufL.shift();
                or[i] = _midBufR.shift();
            }
            
            sampleCounter += _pvL.get_synthesis_hop();
            
            _position += _pvL.get_analysis_hop();
            console.info('new position ' + _position);
        } while (sampleCounter < ol.length);

        return ol;
    }
    
    self.speed = function(speed){
        _newAlpha = 2 - speed;
        console.info("speed "+speed + " alpha" + _newAlpha);
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