function PcmReader(source, significantBitsPerSample, channelsPerFrame) {
    var self = this;
    var bytesPerSample = significantBitsPerSample / 8;
    var isOneBytePerSample = significantBitsPerSample == 8;
    //-1 ONLY FOR SIGNED PCM WAVE that said for bitsPerSample above 16bit. 8-bit format are always unsigned pcm waves
    var conversionFact = Math.pow(2, significantBitsPerSample - (isOneBytePerSample ? 0 : 1));
    console.log('conversion fact calculated: ' + conversionFact);
    self.reachedEnd = false;

    self.read = function (samplesRequested) {
        var encodedBuffer = source.read(samplesRequested * channelsPerFrame * (bytesPerSample));
        var bitsPerSampleArray = isOneBytePerSample ? new Uint8Array(encodedBuffer) : new Int16Array(encodedBuffer);
        // Each sample is the bitsPerSample per the channels but based on what the source returns...
        var decodedFloat = new Float32Array(bitsPerSampleArray.length);
        
        for (var i = 0; i < decodedFloat.length; i++) {
            decodedFloat[i] = bitsPerSampleArray[i] / conversionFact;
        }
        
        self.reachedEnd = source.reachedEnd;

        return decodedFloat;
    };
}