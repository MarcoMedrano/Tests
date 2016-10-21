function WaveParser(buffer) {
    this.nativeEndian = new Uint16Array(new Uint8Array([0x12, 0x34]).buffer)[0] === 0x3412;
    this.buffer = buffer;
    this.waveHeaderMaxSize = 60;
    this.totalReceived = buffer.length;
    this.expectedTotalLength = buffer.length;
    this.buf = new ArrayBuffer(16);
    this.uint8 = new Uint8Array(this.buf);
    this.int8 = new Int8Array(this.buf);
    this.uint16 = new Uint16Array(this.buf);
    this.int16 = new Int16Array(this.buf);
    this.uint32 = new Uint32Array(this.buf);
    this.int32 = new Int32Array(this.buf);
    this.float32 = new Float32Array(this.buf);
    this.encoding = -1;
    this.formats = {
        0x0001: 'lpcm',
        0x0003: 'lpcm',
        0x0006: 'alaw',
        0x0007: 'ulaw',
        0x0031: 'gsm',
    };
    this.fileSize = 0;
    this.readStart = false;
    this.offset = 0;
    this.type = "";
    this.len = 0;
    this.format = undefined;
    this.totalSamples = 0;
    this.duration = 0;

    this.ReadHeader = function () {
        console.log('WaveParser: ReadHeader: Entered. ' + this.expectedTotalLength);
        var riffCheck = this.decodeASCIIString(4);
        console.log('WaveParser: readerHeader: read riff chunk value: ' + riffCheck);
        if (riffCheck !== 'RIFF') {
            return 'Invalid WAV file.';
        }
        this.fileSize = this.readUInt32(true);
        console.log('WaveParser: readHeader: this.fileSize: ' + this.fileSize);
        this.readStart = true;
        var wavCheck = this.decodeASCIIString(4);
        console.log('WaveParser: readHeader: read wav header value: ' + wavCheck);
        if (wavCheck !== 'WAVE') {
            return 'Invalid WAV file.';
        }
        // right now we only read to 
        while (this.offset < this.waveHeaderMaxSize) {
            if (!this.readHeaders && this.offset + 4 < this.waveHeaderMaxSize) {
                this.type = this.decodeASCIIString(4);
                this.len = this.readUInt32(true);
                console.log('WaveParser: readHeader: read riff type:' + this.type + ', chunk len: ' + this.len);
            }
            switch (this.type) {
                case 'fmt ':
                    this.encoding = this.readUInt16(true); // 2
                    console.log('WaveParser: readHeader: encoding read: ' + this.encoding);
                    if (!(this.encoding in this.formats)) {
                        return 'Unsupported format in WAV file.';
                    }
                    this.format = {
                        formatID: this.formats[this.encoding],
                        channelsPerFrame: this.readUInt16(true), // 2
                        sampleRate: this.readUInt32(true), // 4
                        averageBytesPerSecond: this.readUInt32(true),
                        blockAlign: this.readUInt16(true),
                        significantBitsPerSample: this.readUInt16(true),
                        cbSize: 1,
                        samplesPerBlock: 1,

                    };
                    if (this.format.formatID == 'gsm') {
                        this.format.cbSize = this.readUInt16(true);
                        this.format.samplesPerBlock = this.readUInt16(true);
                    }
                    console.log('WaveParser: readHeader: format.formatID: ' + this.format.formatID);
                    console.log('WaveParser: readHeader: format.channelsPerFrame: ' + this.format.channelsPerFrame);
                    console.log('WaveParser: readHeader: format.sampleRate: ' + this.format.sampleRate);
                    console.log('WaveParser: readHeader: format.averageBytesPerSecond: ' + this.format.averageBytesPerSecond);
                    console.log('WaveParser: readHeader: format.blockAlign: ' + this.format.blockAlign);
                    console.log('WaveParser: readHeader: format.significantBitsPerSample: ' + this.format.significantBitsPerSample);
                    console.log('WaveParser: readHeader: format.cbSize: ' + this.format.cbSize);
                    console.log('WaveParser: readHeader: format.samplesPerBlock: ' + this.format.samplesPerBlock);

                    break;
                case 'fact':
                    this.totalSamples = this.readUInt32(true);
                    console.log('WaveParser: readHeader: totalSamples in fact chunk ' + this.totalSamples);
                    break;
                case 'data':
                    console.log('found data');
                    this.headerSize = this.offset;
                    console.log("WaveParser: readHeader: total header size: " + this.headerSize);
                    this.calculateDuration();
                    console.log("WaveParser: ReadHeader: Duration Calculated.");
                    this.readHeader = true;
                    return 0;
                    break;
                default:
                    if (this.offset + this.len > this.totalReceived) {
                        return 'Not enough buffer';
                    }
                    this.offset += this.len;
            }
            if (this.type !== 'data') {
                this.readHeaders = false;
            }
        }
    };

    this.calculateDuration = function () {
        var b = this.format.bitsPerChannel / 8;
        //this.duration = (this.expectedTotalLength - this.offset) / b / this.format.channelsPerFrame / this.format.sampleRate * 1000 | 0;
        this.duration = (this.expectedTotalLength - this.headerSize) / this.format.blockAlign * this.format.samplesPerBlock / this.format.sampleRate * 1000;
        console.log('WaveParser: calculateDuration: ' + this.duration);

        // Sanity check
        if (this.expectedTotalLength - this.offset != this.len) {
            console.log('WaveParser: calculateDuration: offset-totalExpectedLength != chunkLen.  Values: ' + this.expectedTotalLength + '-' + this.offset + "!=" + this.len);
        }
    };

    this.GetNumberOfSamples = function() {
        return (this.expectedTotalLength - this.headerSize) / this.format.blockAlign * this.format.samplesPerBlock;
    };

    this.GetHeaderSize = function() {
        return this.headerSize;
    };

    this.GetSampleRate = function() {
        return this.format.sampleRate;
    };

    this.GetDuration = function() {
        return this.duration;
    };

    this.GetFormatInfo = function() {
        return this.format;
    };

    this.readUInt16 = function (littleEndian) {
        this.readBytes(2, littleEndian);
        return this.uint16[0];
    };
    this.readUInt32 = function (littleEndian) {
        this.readBytes(4, littleEndian);
        return this.uint32[0];
    };

    this.readBytes = function (bytes, littleEndian) {
        var i, _i, _j, _ref;
        if (littleEndian == null) {
            littleEndian = false;
        }
        if (littleEndian === this.nativeEndian) {
            for (i = _i = 0; _i < bytes; i = _i += 1) {
                this.uint8[i] = this.buffer[this.offset + i];
            }
        } else {
            for (i = _j = _ref = bytes - 1; _j >= 0; i = _j += -1) {
                this.uint8[i] = this.buffer[this.offset + i];
            }
        }
        this.offset += bytes;
    };

    this.decodeASCIIString = function (length) {
        if (length > this.totalReceived)
            return "";
        var result = "";
        var cnt = 0;
        while (cnt < length) {
            result += String.fromCharCode(this.buffer[this.offset++]);
            cnt++;
        }
        return result;
    };
}