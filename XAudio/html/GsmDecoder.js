
function GsmDecoder() {
    var self = this;
    
    Module.ccall('Initialize');

    self.decode = function(encodedBuffer) {

        var decodedSamples = 3200;
        var inputPtr = Module._malloc(encodedBuffer.length * encodedBuffer.BYTES_PER_ELEMENT);
        Module.HEAPU8.set(encodedBuffer, inputPtr);
            
        var buf = Module._malloc(decodedSamples * Int16Array.BYTES_PER_ELEMENT);
        var len2 = Module.ccall('decode_block', 'number', ['pointer', 'number', 'pointer'], [inputPtr, encodedBuffer.length, buf]);
            
        var decodedBuffer = new Int16Array(Module.HEAPU8.buffer.slice(buf, buf + len2));
        var decodedFloat = new Float32Array(decodedSamples);
            
        for (var i = 0; i < decodedSamples; i++) {
            decodedFloat[i] = (decodedBuffer[i] / 32768);
        }
            
        //console.log("GsmDecoder: DecodeEncodedBlock: Size is " + deencodedBuffer.length);
        return decodedFloat; // this should be 320 floats break point to ensure logic comes out this way, if not, something small above is wrong    
    };
}