// Pretty good references:
// http://www.signalogic.com/index.pl?page=ms_waveform
// http://www.topherlee.com/software/pcm-tut-wavformat.html
// http://soundfile.sapp.org/doc/WaveFormat/
// http://blog.bjornroche.com/2013/05/the-abcs-of-pcm-uncompressed-digital.html
// http://stackoverflow.com/questions/15087668/how-to-convert-pcm-samples-in-byte-array-as-floating-point-numbers-in-the-range

function XAudioPlayer(buffer, _onEndedCallback) {
    
    var self = this;
    var speed = 1;
    var intervalId = 0;
    var reachedEnd = false;

    var wav = null;
    var xAudioServer = null;

    var currentPipe = null;
    var normalSpeedPipe = null;
    var changedSpeedPipe = null;

    var onEndedCallback = null;

    var failureCallback = function(e) {console.error("XAudioPlayer: " + e);}

    var getSamplesCallback = function (samplesRequested) {

        var decodedFloat =  currentPipe.read(samplesRequested);
        reachedEnd = currentPipe.reachedEnd;
        
        return decodedFloat;
    };

    self.play = function() {
       intervalId = setInterval(function () {
            if (reachedEnd) {
                clearInterval(intervalId);
                if (onEndedCallback) onEndedCallback();
                return;
            }
            
            xAudioServer.executeCallback();
        }, 200);
    };
    
    self.stop = function () {
        clearInterval(intervalId);
    };
    
    self.speed = function (speedRequested) {
        speed = speedRequested;
        
        //currentPipe = speed == 1 ? normalSpeedPipe : changedSpeedPipe;
        
        if(changedSpeedPipe)
            changedSpeedPipe.speed(speedRequested);
    };
    
    self.init = function (buffer, _onEndedCallback) {
        
        onEndedCallback = _onEndedCallback;
        
        wav = new WaveParser(new Uint8Array(buffer));
        wav.ReadHeader();
        var rawData = buffer.slice(wav.GetHeaderSize(), buffer.byteLength);
        
        var rawBufferReader = new RawBufferPipe(rawData);
        var pcmReader = new PcmPipe(rawBufferReader, wav.format.significantBitsPerSample, wav.format.channelsPerFrame);
        var gsmReader = new PcmPipe(new GsmPipe(rawBufferReader, wav.format.blockAlign, wav.format.samplesPerBlock), wav.format.significantBitsPerSample, wav.format.channelsPerFrame);
        
        normalSpeedPipe = wav.format.formatID == 'gsm' ? gsmReader : pcmReader;
        changedSpeedPipe = new PhaseVocoderPipe(normalSpeedPipe, wav.format.sampleRate);
        currentPipe = changedSpeedPipe;

        xAudioServer = new XAudioServer(
            wav.format.channelsPerFrame,
            wav.format.sampleRate,
            wav.format.sampleRate / 4,
            wav.format.sampleRate / 2,
            getSamplesCallback,
            1,
            failureCallback);
    }

    if (buffer && _onEndedCallback) self.init(buffer, _onEndedCallback);
}