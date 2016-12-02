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
            sampleCounter++;
            ol[sampleCounter] = outProcessedBuffer.shift();
        }

        return sampleCounter;
    };
    
    var adjustIfNewAlpha = function () {
        if (alpha != undefined && alpha != phaseVocoder.get_alpha()) {
            console.log("New Alpha detected " + alpha);
            phaseVocoder.set_alpha(alpha);
            alpha = undefined;
        }
    }
    
    var setReachedEnd =  function() {
        self.reachedEnd = source.reachedEnd && outProcessedBuffer.size == 0;
    }
    
    var readFromSource = function(samplesRequested) {
        var decodedFloat = source.read(samplesRequested);
        console.info('PhaseVocoderReader:samplesGotten : ' + decodedFloat.length);
        input.concat(decodedFloat);
    }

    self.read = function(samplesRequested) {
        console.info('PhaseVocoderReader:samplesRequested : ' + samplesRequested);

        var output = new Float32Array(samplesRequested);

        var sampleCounter = shifToOutput(0, output, samplesRequested);
        
        if (sampleCounter >= samplesRequested || source.reachedEnd) {
            setReachedEnd();
            console.info("PhaseVocoderReader:samplesToReturn " + output.length);
            return output;
        }

        readFromSource(samplesRequested);

        do {
            adjustIfNewAlpha();

            if (frameSize >= input.length)
                readFromSource(frameSize);

            var bufL = input.subarray(0, frameSize).toArray();

            phaseVocoder.process(bufL, outProcessedBuffer);

            shifToOutput(sampleCounter, output, samplesRequested);

            sampleCounter += phaseVocoder.get_synthesis_hop();
            input = input.slice(phaseVocoder.get_analysis_hop());

        } while (sampleCounter < samplesRequested);
        
        setReachedEnd();
        console.info("PhaseVocoderReader:samplesToReturn " + output.length);
        return output;
    }
    
    self.speed = function(speed){
        alpha = parseFloat((2 - speed).toFixed(2));
        console.info("speed "+speed + " alpha " + alpha);
    }
}