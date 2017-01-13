function RawBufferPipe(rawBuffer) {

    var self = this;
    var bufferOffset = 0;
    self.reachedEnd = false;

    self.read = function (size) {
        var rawBlock = rawBuffer.slice(bufferOffset, bufferOffset + size);
            
        bufferOffset += rawBlock.byteLength;
        self.reachedEnd = bufferOffset >= rawBuffer.byteLength;
        
        return rawBlock;
    }

    self.getPosition = function () {
        return bufferOffset;
    }
}