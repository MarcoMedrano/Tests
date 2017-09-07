/// <reference path="../../../libs/operative/operative.min.js" />
/// <reference path="../../../libs/catiline/catiline.js" />
/// <reference path="decompression/LZRW1Decompress.js" />
/// <reference path="../../../../libs/emitter/emitter.js" />
/// <reference path="bitmap/bitmap.js" />
/// <reference path="bitmap/rgbaImage.js" />
/// <reference path="videoFrame.js" />
/// <reference path="VideoFrameSource.js" />

function ImageQueueRequester(maxQueuedElements) {
    var self = new Emitter(this);
    var processedImages = new Array();
    var worker = new Worker('src/app/Media/Video/ImageProcessWorker.js');
    var play = false;
    var numberOfRequestsInProcess = 0;

    worker.addEventListener('message', function (e) {

        e.data.image = new Uint8Array(e.data.imageInArrayBuffer);
        processedImages.push(e.data);

        console.log('VideoSource: FullImage received, queue at capacity: ' + (processedImages.length * 100) / maxQueuedElements);
        self.emit('capacity_consumed_in_percentage', (processedImages.length * 100) / maxQueuedElements);
        //if (processedImages.length > maxQueuedElements) {
        //    throw 'how the fuck';
        //}
        if (processedImages.length == maxQueuedElements) {
            self.emit('full');
        }
        
        numberOfRequestsInProcess--;
        console.log('VideoSource: Number of request in progress : ' + numberOfRequestsInProcess);
        if (play) {
            self.requestImageIfNeeded();
        }

        if (play == false && numberOfRequestsInProcess == 0) {
            self.emit('stoped');
        }
    }, false);


    self.consume = function () {
        setTimeout(self.requestImageIfNeeded, 20);

        return processedImages.shift();
    };

    self.requestImageIfNeeded = function () {
        if (numberOfRequestsInProcess < maxQueuedElements && processedImages.length < maxQueuedElements) {
            numberOfRequestsInProcess++;
            worker.postMessage({ cmd: 'processImageAhead'});
        }
    };

    self.start = function () {
        play = true;
        self.requestImageIfNeeded();
    }

    self.requestStop = function () {
        play = false;
        if (numberOfRequestsInProcess == 0) {
            self.emit('stoped');
        }
    }

    self.addFrame = function (frame) {
        worker.postMessage({ cmd: 'addFrame', args: frame });
    }
}
function VideoSource(totalLength) {
    var self = this;

    /* Frame variables*/
    var frames = new Array();
    var currentFrameIndex = 0;
    var videoFrameHeader = null;

    /* Image variables*/
    var fullImage = null;
    var processedImages = new Array();
    self.mediaReady = false;
    var isNewImage = false;

    var imageRequester = new ImageQueueRequester(3);
    imageRequester.once('full', function () {
        self.mediaReady = true;
        isNewImage = true;
        fullImage = imageRequester.consume();
        imageRequester.removeAllListeners('capacity_consumed_in_percentage');
    });

    imageRequester.on('capacity_consumed_in_percentage', function (porcentage) {
        GlobalEmitter.emit('video_seek_progress', porcentage);
    })

    GlobalEmitter.emit('video_seek_progress', 0);
    imageRequester.start();

    var consumeFullImage = function () {
        isNewImage = true;
        fullImage = imageRequester.consume();
    }
    var addFrame = function (frame) {
        frames.push(frame);
        imageRequester.addFrame(frame);
    }
    
    var videoFrameSource = new VideoFrameSource(totalLength, addFrame.bind(self));

    self.getBuffered = function () {
        return videoFrameSource.totalReceived / totalLength;
    };

    self.getBufferedFrameTime = function () {
        var lastFrameTime = calculateTimeFromFrame(frames[frames.length - 1]);
        return lastFrameTime;
    };

    self.getCurrentFrameTime = function () {
        return calculateTimeFromFrame(frames[currentFrameIndex]);
    };

    // appendToBuffer is a function.
    self.appendToBuffer = function (arrayBuffer) {
        videoFrameSource.appendToBuffer(arrayBuffer);
    };

    /*
     * Gets a sample image, returns null if the sample is not anew image, this in order to do not the canvas redraw same image.
     */
    self.getSample = function (timeInSeconds) {

        processDataToTime(timeInSeconds, false);

        if (isNewImage) {
            isNewImage = false;
            return fullImage;
        }

        return null;
    };

     self.seek = function (seekSecond) {
        var currentFrameTime = calculateTimeFromFrame(frames[currentFrameIndex]);
        if (currentFrameTime > seekSecond) {
            currentFrameIndex = 0;
            GlobalEmitter.emit('video_seek_progress', 0);

            imageRequester.once('stoped', function () {

                //var reportProgress = function (percentage) {
                //    GlobalEmitter.emit('video_seek_progress', percentage);
                //};
                //imageRequester.on('capacity_consumed_percentage', reportProgress);

                //imageRequester.once('full', function () {
                //    imageRequester.removeListener('capacity_consumed_percentage', reportProgress);
                //});
                
                imageRequester.start();
                processDataToTime(seekSecond, true);
            });

            imageRequester.requestStop();

        } else {
            processDataToTime(seekSecond, true);
        }
//        self.mediaReady = false;
    };

    var processDataToTime = function (/*seconds*/time, canReportProgress) {

        canReportProgress = canReportProgress || false;
        var currentFrameTime = calculateTimeFromFrame(frames[currentFrameIndex]);
        var totalDifferenceInSec = Math.abs(time - currentFrameTime);

        var reportProgress = canReportProgress && totalDifferenceInSec > 1;
        var processedImage = false;


        for (var i = currentFrameIndex; i < frames.length; i++) {

            var frameTime = calculateTimeFromFrame(frames[i]);
            //console.log('FRAME TIME : ' + frameTime + ' >= ' +time + ' = ' + (frameTime >= time));
            //if (reportProgress) {
            //    var actualDiferenceInSec = time - frameTime;
            //    var progress = 1 - (actualDiferenceInSec / totalDifferenceInSec);
            //    if (progress >= 1 && self.mediaReady) {
            //        GlobalEmitter.emit('video_seek_progress', progress > 1 ? 1 : progress);
            //    }
            //}

            if (frameTime >= time/* || i == frames.length - 1*/) {
                currentFrameIndex = i;
                return;
            }

            switch (frames[i].frameType)
            {
                case VideoFrameType.FileHeader:
                    processFileHeader(frames[i]);
                    break;
                case VideoFrameType.FillColor:
                    break;
                case VideoFrameType.FullImage:
                case VideoFrameType.Image:
                    processedImage = true;
                    break;
                case VideoFrameType.End:
                    if (processedImage) {
                        processedImage = false;
                        consumeFullImage();
                    }
                    break;
                case VideoFrameType.Mouse:
                    GlobalEmitter.emit('mouse_move', frames[i].frameX, frames[i].frameY);
                    break;
                case VideoFrameType.BlackoutStart:
                    GlobalEmitter.emit('blackout_start');
                    break;
                case VideoFrameType.BlackoutEnd:
                    GlobalEmitter.emit('blackout_stop');
                    break;
            }
        }
    };


    var processFileHeader = function (frame) {
        videoFrameHeader = frame;
    };

    var calculateTimeFromFrame = function (frame) {

        if (!videoFrameHeader) {
            return 0;
        }

        return frame.frameTime - videoFrameHeader.frameTime;
    };
}

