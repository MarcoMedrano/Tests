﻿// Defaults from: https://github.com/naudio/NAudio/blob/85b68dd1b9bdd144459506f80217087e7e2c9907/NAudio/Wave/WaveFormats/Gsm610WaveFormat.cs
function GsmPipe(source, _blockAlign, _samplesPerBlock) {
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
        
        return rawBuffer;
    };
}