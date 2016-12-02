function Float32List (initialSize) {
    var self = this;
    var internalArray = new Float32Array(initialSize || 1024*256);

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
        var newSize = getBestSize(minimumSize);
        console.warn("Float32List:Increasing internal array to " + newSize + ", " + (newSize * internalArray.BYTES_PER_ELEMENT)/1024/1024 + "(MB) . Probably you need to set bigger default size.");
        var newData = new Float32Array(newSize);
        newData.set(internalArray);
        internalArray = newData;
    }

    self.concat =  function (dataToAdd){
        if (self.length + dataToAdd.length > internalArray.length) {
            increaseInternalArray(self.length + dataToAdd.length);
        }

        internalArray.set(dataToAdd, self.length);
        self.length += dataToAdd.length;
    }

    self.subarray = function (begin, end) {
        if (end > self.length) end = self.length;

        var array = internalArray.subarray(begin, end);
        var floatList = new Float32List(array.length);
        floatList.concat(array);

        return floatList;
    }

    self.slice = function(begin, _end) {
        var end = _end || self.length;

        var array = internalArray.slice(begin, end);
        var floatList = new Float32List(array.length);
        floatList.concat(array);

        return floatList;
    }
    
    self.toArray = function() {
        return internalArray.subarray(0, self.length);
    }
}