function Float32List (initialSize) {
    var self = this;
    var internalArray = new Float32Array(initialSize || 1024);

    self.length = 0;
    
    var getBestSize = function(minimumSize) {
        if (!minimumSize) return internalArray.length * 2;

        var newlength = internalArray.length * 2;
        while (newlength < minimumSize) {
            newlength *= 2;
        }

        return newlength;
    }

    var increaseInternalArray = function (minimumSize) {
        newData = new Float32Array(getBestSize(minimumSize));
        newData.set(internalArray);
        internalArray = newData;
    }

    self.concat =  function (dataToAdd){
        if (self.length + dataToAdd.length >= internalArray.length) {
            increaseInternalArray(self.length + dataToAdd.length);
        }
        internalArray.set(dataToAdd, self.length);
        self.length += dataToAdd.length;
    }

    self.subarray = function (begin, end) {
        if (end > self.length) end = self.length;

        return internalArray.subarray(begin, end);
    }
}