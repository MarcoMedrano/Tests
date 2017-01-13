function PhaseVocoderPipe(source, _sampleRate, _frameSize) {
    
    var self = this;
    var sampleRate = _sampleRate || 44100;
    var frameSize = _frameSize || 512;
    var alpha = 1;
    
    var phaseVocoder = new PhaseVocoder(frameSize, sampleRate);
    phaseVocoder.init();
    
    var input = new Float32List();
    var outProcessedBuffer = new CBuffer(Math.round(frameSize * 2));
    
    self.reachedEnd = false;
    
    var shifToOutput = function (offset, ol, samplesRequested) {
        var sampleCounter = offset;
        
        while (outProcessedBuffer.size > 0 && sampleCounter < samplesRequested) {
            ol[sampleCounter] = outProcessedBuffer.shift();
            sampleCounter++;
        }
        
        return sampleCounter;
    };
    
    var setReachedEnd = function () {
        self.reachedEnd = source.reachedEnd && outProcessedBuffer.size == 0 && input.length == 0;
        if (self.reachedEnd)
            console.warn("Reached End");
    }
    
    var readFromSource = function (samplesRequested) {
        var decodedFloat = source.read(samplesRequested);
        console.info('PhaseVocoderPipe:samplesGotten : ' + decodedFloat.length);
        input.concat(decodedFloat);
        console.info('PhaseVocoderPipe:input : ' + input.length);
    }
    
    self.read = function (samplesRequested) {
        console.info("PhaseVocoderPipe:-----------------------------------------------------");
        console.info('PhaseVocoderPipe:samplesRequested : ' + samplesRequested);
        
        var output = new Float32Array(samplesRequested);
        
        var sampleCounter = shifToOutput(0, output, samplesRequested);
        
        if (sampleCounter >= samplesRequested || source.reachedEnd && input.length == 0) {
            setReachedEnd();
            console.info("PhaseVocoderPipe:samplesToReturn " + output.length);
            return output;
        }
        
        //readFromSource(samplesRequested);
        
        do {
            if (frameSize >= input.length)
                readFromSource(frameSize);
            
            var bufL = input.subarray(0, frameSize).toArray();
            
            phaseVocoder.process(bufL, outProcessedBuffer);
            
            shifToOutput(sampleCounter, output, samplesRequested);
            
            sampleCounter += phaseVocoder.get_synthesis_hop();
            input = input.slice(phaseVocoder.get_analysis_hop());

        } while (sampleCounter < samplesRequested);
        
        setReachedEnd();
        console.info("PhaseVocoderPipe:samplesToReturn " + output.length);
        return output;
    }
    
    self.speed = function (speed) {
        alpha = parseFloat((2 - speed).toFixed(2));
        console.info("PhaseVocoderReader:speed " + speed + " alpha " + alpha);
        phaseVocoder.set_alpha(alpha);
    }
    
    self.cleanUp = function () {
        input = new Float32List();
        outProcessedBuffer = new CBuffer(Math.round(frameSize * 2));
        
        phaseVocoder = new PhaseVocoder(frameSize, sampleRate);
        phaseVocoder.init();
        phaseVocoder.set_alpha(alpha);
    }
}