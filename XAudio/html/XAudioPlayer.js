﻿// Pretty good references:
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

    var rawBufferReader = null;
    var pcmReader = null;
    var gsmReader = null;
    var currentReader = null;

    var phaseVocoderProcessor = null;

    var onEndedCallback = null;

    var failureCallback = function(e) {console.error("XAudioPlayer: " + e);}

    var getSamplesCallback = function (samplesRequested) {

        var decodedFloat =  currentReader.read(samplesRequested * (speed != 1 ?  2 : 1));
        reachedEnd = currentReader.reachedEnd;

        //if (speed != 1) {
        //    decodedFloat = phaseVocoderProcessor.process(decodedFloat, samplesRequested);
        //}

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
        
        if (speed == 1) {
            if (wav.format.formatID == 'gsm')
                currentReader = gsmReader;
            else
                currentReader = pcmReader;
        } 
        else {
            currentReader = phaseVocoderProcessor;
        }

        phaseVocoderProcessor.speed(speedRequested);
    };
    
    self.init = function (buffer, _onEndedCallback) {
        
        onEndedCallback = _onEndedCallback;
        
        wav = new WaveParser(new Uint8Array(buffer));
        wav.ReadHeader();
        var rawData = buffer.slice(wav.GetHeaderSize(), buffer.byteLength);
        
        rawBufferReader = new RawBufferReader(rawData);
        pcmReader = new PcmReader(rawBufferReader, wav.format.significantBitsPerSample, wav.format.channelsPerFrame);
        gsmReader = new PcmReader(new GsmReader(rawBufferReader, wav.format.blockAlign, wav.format.samplesPerBlock), wav.format.significantBitsPerSample, wav.format.channelsPerFrame);
        //gsmReader = new GsmReader(rawBufferReader, wav.format.blockAlign, wav.format.samplesPerBlock);
        if (wav.format.formatID == 'gsm')
            currentReader = gsmReader;
        else 
            currentReader = pcmReader;

        phaseVocoderProcessor = new PhaseVocoderReader(currentReader);

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
            reachedEnd = true;

        return samples;
    };

    if (buffer && _onEndedCallback) self.init(buffer, _onEndedCallback);
}