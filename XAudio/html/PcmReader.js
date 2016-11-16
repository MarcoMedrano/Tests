function PcmReader(source, _significantBitsPerSample, channelsPerFrame) {
    var self = this;
    var significantBitsPerSample = _significantBitsPerSample || 16;
    var isOneBytePerSample = significantBitsPerSample == 8;
    var bytesPerSample = _significantBitsPerSample==0 ? 1 : _significantBitsPerSample / 8;  // This IF is only to support GSM raw data

    //-1 ONLY FOR SIGNED PCM WAVE that said for bitsPerSample above 16bit. 8-bit format are always unsigned pcm waves
    var conversionFact = Math.pow(2, significantBitsPerSample - (isOneBytePerSample ? 0 : 1));
    console.debug('PcmReader:conversionFact : ' + conversionFact);
    self.reachedEnd = false;

    self.read = function (samplesRequested) {
        console.debug('PcmReader:samplesRequested : ' + samplesRequested);

        var rawBuffer = source.read(samplesRequested * channelsPerFrame * bytesPerSample);
        console.debug('PcmReader:bytesGotten : ' + rawBuffer.byteLength);

        var bitsPerSampleArray = isOneBytePerSample ? new Uint8Array(rawBuffer) : new Int16Array(rawBuffer);
        console.debug('PcmReader:samplesToReturn : ' + bitsPerSampleArray.length);

        // Each sample is the bitsPerSample * channels but based on what the source returns that might be smaller or longer :...
        var decodedFloat = new Float32Array(bitsPerSampleArray.length);
        
        for (var i = 0; i < decodedFloat.length; i++) {
            decodedFloat[i] = bitsPerSampleArray[i] / conversionFact;
        }
        
        self.reachedEnd = source.reachedEnd;

        return decodedFloat;
    };
}