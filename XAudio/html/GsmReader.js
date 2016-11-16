function GsmReader(source, _blockAlign, _samplesPerBlock) {
    var self = this;
    var blockAlign = _blockAlign || 65;
    var samplesPerBlock = _samplesPerBlock || 320;

    self.reachedEnd = false;

    Module.ccall('Initialize');

    self.read = function (samplesRequested) {
        console.debug("GsmReader:samplesRequested " + samplesRequested);
        
        var SamplesRequestedPerBlockAlign = Math.ceil(samplesRequested / samplesPerBlock);
        var bytesNeeded = Math_ceil(SamplesRequestedPerBlockAlign*blockAlign);
        console.debug("GsmReader:bytesNeeded " + bytesNeeded);

        var encodedBuffer = new Uint8Array(source.read(bytesNeeded));
        console.debug("GsmReader:bytesGotten " + encodedBuffer.length);

        var inputPtr = Module._malloc(encodedBuffer.length * encodedBuffer.BYTES_PER_ELEMENT);
        Module.HEAPU8.set(encodedBuffer, inputPtr);
        
        var buf = Module._malloc(samplesRequested * Int16Array.BYTES_PER_ELEMENT);
        var len2 = Module.ccall('decode_block', 'number', ['pointer', 'number', 'pointer'], [inputPtr, encodedBuffer.length, buf]);
        
        self.reachedEnd = source.reachedEnd;
        var rawBuffer = Module.HEAPU8.buffer.slice(buf, buf + len2);
        var int16Array = new Int16Array(rawBuffer);

        console.debug("GsmReader:decodedBuffer length " + int16Array.length);
        var decodedFloat = new Float32Array(int16Array.length);
        
        for (var i = 0; i < decodedFloat.length; i++) {
            decodedFloat[i] = (int16Array[i] / 32768);//2^15=32768
        }

        return decodedFloat;
    };
}
