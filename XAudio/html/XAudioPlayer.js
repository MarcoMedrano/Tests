function XAudioPlayer(buffer) {
    
    var self = this;
    var encodedBufferOffset = 0;
    var reachedEndOfBuffer = false;
    var wav = new WaveParser(new Uint8Array(buffer));
    wav.ReadHeader();
    var encodedBuffer = buffer.slice(wav.GetHeaderSize(), buffer.byteLength);
    var gsmDecoder = new GsmDecoder();

    var failureCallback = function(e) {console.error("XAudioPlayer: " + e);}

    var getSamplesCallback = function (samplesRequested) {
        if (wav.format.formatID == 'gsm')
            return gsmDecoder.decode(new Uint8Array(self.getEncodedBlocks()));
        else //assuming it is lpcm
            return self.getPcmBlocks(samplesRequested);
    };
    
    self.getEncodedBlocks = function () {
        var encodedBlock = encodedBuffer.slice(encodedBufferOffset, encodedBufferOffset + (65 * 10));
        
        encodedBufferOffset += encodedBlock.byteLength;
        reachedEndOfBuffer = encodedBufferOffset >= encodedBuffer.byteLength;
        return encodedBlock;
    };
    
    self.getPcmBlocks = function (samplesRequested) {
        //-1 ONLY FOR SIGNED PCM WAVE that said for bitsPerAample above 16bit. 8-bit format are always signed pcm waves
        var conversionFact = Math.pow(2, wav.format.significantBitsPerSample - (wav.format.significantBitsPerSample == 8 ? 0 : 1));
        
        var bitsPerSampleArray = wav.format.significantBitsPerSample == 8 ? new Uint8Array(encodedBuffer, encodedBufferOffset) : new Int16Array(encodedBuffer, encodedBufferOffset);
        // Each sample is the bitsPerSample per the channels
        var decodedFloat = new Float32Array(samplesRequested * wav.format.channelsPerFrame /*3200 * 6*/);
        
        for (var i = 0; i < decodedFloat.length; i++) {
            decodedFloat[i] = bitsPerSampleArray[i] / conversionFact;
            encodedBufferOffset += bitsPerSampleArray.BYTES_PER_ELEMENT;
        }
        
        if (encodedBufferOffset >= encodedBuffer.byteLength)
            reachedEndOfBuffer = true;
        return decodedFloat;
    };

    self.play = function() {
       var intervalId = setInterval(function () {
            if (reachedEndOfBuffer) {
                clearInterval(intervalId);
                return;
            }
            
            xAudioServer.executeCallback();
        }, 200);
    };

    var xAudioServer = new XAudioServer(
        wav.format.channelsPerFrame,
            wav.format.sampleRate,
            wav.format.sampleRate / 4,
            wav.format.sampleRate / 2,
            getSamplesCallback,
            1,
            failureCallback);
}