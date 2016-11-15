function RawBufferReader(encodedBuffer) {

    var self = this;
    var bufferOffset = 0;
    self.reachedEnd = false;

    self.read = function (_size) {
        var size = _size || 65 * 10;
        var encodedBlock = encodedBuffer.slice(bufferOffset, bufferOffset + size);
            
        bufferOffset += encodedBlock.byteLength;
        self.reachedEnd = bufferOffset >= encodedBuffer.byteLength;
        
        return encodedBlock;
    }
}