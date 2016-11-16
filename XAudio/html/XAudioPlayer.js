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
    var encodedBuffer = null;
    var encodedBufferOffset = 0;
    var reachedEndOfBuffer = false;
    var wav = null;
    var xAudioServer = null;

    var rawBufferReader = null;
    var pcmReader = null;
    var gsmReader = null;

    var gsmDecoder = new GsmDecoder();
    var phaseVocoderProcessor = new PhaseVocoderProcessor2();

    var onEndedCallback = null;

    var failureCallback = function(e) {console.error("XAudioPlayer: " + e);}

    var getSamplesCallback = function (samplesRequested) {

        var decodedFloat;

        if (wav.format.formatID == 'gsm')
        //decodedFloat = gsmDecoder.decode(new Uint8Array(getEncodedBlocks()));
            decodedFloat = gsmReader.read(samplesRequested);
        else //assuming it is lpcm
        //decodedFloat = getPcmBlocks(samplesRequested*4/4);
            decodedFloat = pcmReader.read(samplesRequested);
        reachedEndOfBuffer = pcmReader.reachedEnd;
        if (speed != 1) {
            decodedFloat = phaseVocoderProcessor.process(decodedFloat, samplesRequested);
        }

        return decodedFloat;
    };

    self.play = function() {
       intervalId = setInterval(function () {
            if (reachedEndOfBuffer) {
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
        phaseVocoderProcessor.speed(speedRequested);
    };
    
    self.init = function (buffer, _onEndedCallback) {
        
        onEndedCallback = _onEndedCallback;
        
        wav = new WaveParser(new Uint8Array(buffer));
        wav.ReadHeader();
        encodedBuffer = buffer.slice(wav.GetHeaderSize(), buffer.byteLength);
        rawBufferReader = new RawBufferReader(encodedBuffer);
        pcmReader = new PcmReader(rawBufferReader, wav.format.significantBitsPerSample, wav.format.channelsPerFrame);
        gsmReader = new PcmReader(new GsmReader(rawBufferReader, wav.format.blockAlign, wav.format.samplesPerBlock), wav.format.significantBitsPerSample, wav.format.channelsPerFrame);
        //gsmReader = new GsmReader(rawBufferReader, wav.format.blockAlign, wav.format.samplesPerBlock);

        xAudioServer = new XAudioServer(
            wav.format.channelsPerFrame,
            wav.format.sampleRate,
            wav.format.sampleRate / 4,
            wav.format.sampleRate / 2,
            getSamplesCallback,
            1,
            failureCallback);
        
        //var context = new AudioContext();
        //context.decodeAudioData(buffer, function(buffer) { audioBuffer2 = buffer; }, function (e) { console.error(e); });
    }
    
    var audioBufferOffset2 = 0;
    var audioBuffer2 = null;

    var getPcmBlocks2 = function(samplesRequested) {
        var samples = audioBuffer2.getChannelData(0).subarray(audioBufferOffset2, audioBufferOffset2 + samplesRequested);
        audioBufferOffset2 += samplesRequested;
        
        if (audioBufferOffset2 >= audioBuffer2.length)
            reachedEndOfBuffer = true;

        return samples;
    };

    if (buffer && _onEndedCallback) self.init(buffer, _onEndedCallback);
}