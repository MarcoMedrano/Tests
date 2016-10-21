
(function () {
    
    app.controller('CanvasController', function () {
        var self = this;
        //self.testComponent = 1;
        console.log("starting fucking angular ");

        self.zoomIn = function() {
            console.log("zoom in ");
            if (self.canZoom) {
                self.scale *= 1.2;
                self.resize();
            }
        };

        self.zoomOut = function() {
            console.log("zoom out ");
            if (self.canZoom) {
                self.scale /= 1.2;
                self.resize();
            }
        };

        self.cursorUp = function () {
            console.log("cursor up ");
            self.offset = {
                x: self.offset.x,
                y: self.offset.y + 100
            };
            self.resize();
        };

        self.cursorDown = function () {
            console.log("cursor down ");
            self.offset = {
                x: self.offset.x,
                y: self.offset.y - 100
            };
            self.resize();
        };

        self.cursorLeft = function () {
            console.log("cursor left ");
            self.offset = {
                x: self.offset.x + 100,
                y: self.offset.y
            };
            self.resize();
        };

        self.cursorRight = function () {
            console.log("cursor right ");
            self.offset = {
                x: self.offset.x - 100,
                y: self.offset.y
            };
            self.resize();
        };


        var previousMousePosition = null, isMoving = false, isUpdateOffset = false, isUpdateScale = false, lastZoomDist = null;
        self.defaultScale = 1;
        self.defaultMaxScale = 6;
        self.maxscale = self.defaultMaxScale;
        self.canZoom = false;
        self.pixelRatio = window.devicePixelRatio;
        self.scale = 1;

        //top of the image
        //self.offset = {
        //    x: 20000,
        //    y: 20000
        //};
        if (!self.mode) {
            self.mode = 'fit';
        }
        self.wrapper = document.getElementById('videoContainer');
        self.canvas = document.getElementById('canvasVideo');
        self.context = self.canvas.getContext('2d');
        self.context.imageSmoothingEnabled = false;
        self.init = true;
        self.blackout = false;

        self.resetVideo = function () {
            self.canZoom = false;
            inMemoryCanvas = undefined;
            console.log('Reset Video Panel');
            self.frame = new Image;
            self.frame.src = 'img/test.jpg';
            self.init = true;
            self.blackout = false;
            self.frame.onload = function () {
                self.canvas.width = self.frame.width;
                self.canvas.height = self.frame.height;
                self.offset = {
                    x: 0,
                    y: 0
                };
                setScale(1);

                self.canZoom = true;
                drawImage();
            }
        }

        self.drawImageEvent = function (event, rgbaImage) {
            if (!self.blackout && rgbaImage) {
                self.canZoom = true;
                if (typeof inMemoryCanvas === 'undefined') {
                    inMemoryCanvas = document.createElement("canvas");
                    inMemCtx = inMemoryCanvas.getContext('2d');
                    inMemoryCanvas.width = rgbaImage.width;
                    inMemoryCanvas.height = rgbaImage.height;
                    inMemCtx.imageSmoothingEnabled = false;
                }
                for (var i = 0; i < rgbaImage.imagesProcessed.length; i++) {
                    var imageFrame = rgbaImage.imagesProcessed[i];
                    inMemCtx.putImageData(imageFrame.imageData, imageFrame.x, imageFrame.y);
                }
                self.frame = inMemoryCanvas;
                if (self.init) {
                    self.canvas.width = self.canvas.clientWidth;
                    self.canvas.height = self.canvas.clientHeight;
                    updateScale(self.frame);
                    self.init = false;
                }

                if (!self.blackout) {
                    drawImage();
                }
            }
        }

        self.VideoResize = function () {
            if (!self.isResizing) {
                self.resize();
            }
        }

        angular.element(window).bind('resize', function () {
            if (!self.isResizing) {
                setTimeout(self.resize(), 500);
            }
        });

        self.resize = function () {
            self.isResizing = true;
            self.canvas.width = self.canvas.clientWidth;
            self.canvas.height = self.canvas.clientHeight;
            self.offset = {
                x: 20000,
                y: 20000
            };
            if (self.frame) {
                updateScale(self.frame);
                // if it's a blackout or no video picture init  = true
                if (!self.frame.src) {
                    self.init = false;
                }
                drawImage();
            };
            self.isResizing = false;
        }

        function setScale(scale) {
            isUpdateScale = true;
            if (scale && scale != null && scale != Infinity) {
                self.scale = scale;
            }
            isUpdateScale = false;
        }

        function updateScale(image) {
            var widthScale = self.canvas.width / image.width, heightScale = self.canvas.height / image.height;
            if (self.mode === 'fill') {
                self.defaultScale = Math.max(widthScale, heightScale);
            } else if (self.mode === 'fit') {
                self.defaultScale = Math.min(widthScale, heightScale);
            } else {
                self.defaultScale = 1;
            }
            setScale(self.defaultScale);
        }


        function drawImage() {
            if (self.frame) {
                if (isUpdateScale || isUpdateOffset) {
                    return;
                }
                clipToBounds(self.frame);
                drawCanvasImage(self.context, self.frame, self.scale, self.offset);
            }
        }

        function clipToBounds(image) {
            isUpdateOffset = true;
            var bounds = {
                width: self.canvas.width,
                height: self.canvas.height
            }, offsetLimits = getImageOffsetLimits(image, self.scale, bounds);
            if (self.offset.y < offsetLimits.top) {
                self.offset.y = offsetLimits.top;
            }
            if (self.offset.y > offsetLimits.bottom) {
                self.offset.y = offsetLimits.bottom;
            }
            if (self.offset.x < offsetLimits.left) {
                self.offset.x = offsetLimits.left;
            }
            if (self.offset.x > offsetLimits.right) {
                self.offset.x = offsetLimits.right;
            }
            isUpdateOffset = false;
        }

        function drawCanvasImage(ctx, image, scale, offset) {
            if (scale && offset) {
                var imageHalfWidth = image.width / 2, imageHalfHeight = image.height / 2, canvasHalfWidth = self.context.canvas.width / 2, canvasHalfHeight = self.context.canvas.height / 2, beforeScaleOffset = {
                    x: (-imageHalfWidth + offset.x) * scale,
                    y: (-imageHalfHeight + offset.y) * scale
                }, afterScaleOffset = {
                    x: canvasHalfWidth / scale,
                    y: canvasHalfHeight / scale
                };
                self.context.canvas.width = self.context.canvas.width;
                // move center to the left and top corner
                self.context.translate(beforeScaleOffset.x, beforeScaleOffset.y);
                // scale
                self.context.scale(scale, scale);
                // move center back to the center
                self.context.translate(afterScaleOffset.x, afterScaleOffset.y);
            }
            // draw image in original size
            self.context.drawImage(image, 0, 0);//, image.width, image.height, 0, 0, image.width, image.height);

        }

        function getImageOffsetLimits(image, scale, size) {
            var imageHalfWidth = image.width / 2, imageHalfHeight = image.height / 2, boundsHalfWidth = size.width / 2, boundsHalfHeight = size.height / 2, scaledBoundsHalfWidth = boundsHalfWidth / scale, scaledBoundsHalfHeight = boundsHalfHeight / scale;
            return {
                left: -imageHalfWidth + scaledBoundsHalfWidth,
                right: imageHalfWidth - scaledBoundsHalfWidth,
                top: -imageHalfHeight + scaledBoundsHalfHeight,
                bottom: imageHalfHeight - scaledBoundsHalfHeight
            };
        }


        if (self.zoomable) {
            function getMousePosition(e) {
                var rect = self.canvas.getBoundingClientRect();
                return {
                    x: (e.clientX - rect.left) / self.scale,
                    y: (e.clientY - rect.top) / self.scale
                };
            }
            function setIsMoving(moving, event, position) {
                event.preventDefault();
                isMoving = moving;
                if (moving) {
                    previousMousePosition = getMousePosition(position);
                }
            }
            function moveTo(e, position) {
                if (isMoving) {
                    e.preventDefault();
                    var mousePosition = getMousePosition(position);
                    self.offset = {
                        x: self.offset.x + (mousePosition.x - previousMousePosition.x) * 3,
                        y: self.offset.y + (mousePosition.y - previousMousePosition.y) * 3
                    };
                    previousMousePosition = mousePosition;
                    self.$apply();
                }
            }
            function zoom(e, touch1, touch2) {
                e.preventDefault();
                var dist = Math.sqrt(Math.pow(touch2.pageX - touch1.pageX, 2) + Math.pow(touch2.pageY - touch1.pageY, 2));
                if (lastZoomDist) {
                    self.scale *= dist / lastZoomDist;
                    self.$apply();
                }
                lastZoomDist = dist;
            }
            function handleMouseDown(e) {
                setIsMoving(true, e, e);
            }
            function handleTouchStart(e) {
                if (e.targetTouches.length === 1) {
                    setIsMoving(true, e, e.changedTouches[0]);
                }
            }
            function handleMouseUp(e) {
                setIsMoving(false, e);
            }
            function handleTouchEnd(e) {
                lastZoomDist = null;
                setIsMoving(false, e);
            }
            function handleMouseMove(e) {
                moveTo(e, e);
            }
            function handleTouchMove(e) {
                if (e.targetTouches.length >= 2) {
                    var touch1 = e.targetTouches[0], touch2 = e.targetTouches[1];
                    if (touch1 && touch2) {
                        zoom(e, touch1, touch2);
                    }
                } else {
                    moveTo(e, e.changedTouches[0]);
                }
            }
            function handleMouseWheel(e) {
                if (self.canZoom) {
                    if ((e.detail ? (e.detail * -120) : e.wheelDelta) < 0) {
                        self.scale /= 1.2;
                    } else {
                        self.scale *= 1.2;
                    }
                    self.$apply();
                }
            }
            self.canvas.addEventListener('mousedown', handleMouseDown, false);
            self.canvas.addEventListener('mouseup', handleMouseUp, false);
            self.canvas.addEventListener('mouseleave', handleMouseUp, false);
            self.canvas.addEventListener('mousemove', handleMouseMove, false);
            self.canvas.addEventListener('mousewheel', handleMouseWheel, false);
            self.canvas.addEventListener(navigator.userAgent.indexOf("Firefox") > -1 ? "DOMMouseScroll" : "mousewheel", handleMouseWheel, false);
            self.canvas.addEventListener('touchstart', handleTouchStart, false);
            self.canvas.addEventListener('touchend', handleTouchEnd, false);
            self.canvas.addEventListener('touchcancel', handleTouchEnd, false);
            self.canvas.addEventListener('touchleave', handleTouchEnd, false);
            self.canvas.addEventListener('touchmove', handleTouchMove, false);
            if (!self.testComponent || self.testComponent != 1) {
                self.$watch(function () {
                    return self.scale;
                }, function (newScale, oldScale) {
                    if (newScale != oldScale) {
                        if (newScale < self.defaultScale) {
                            setScale(self.defaultScale);
                        }
                        if (newScale > self.maxscale) {
                            setScale(self.defaultMaxScale);
                        }
                        drawImage();
                    }
                });
                self.$watch(function () {
                    return self.offset;
                }, function (newOffset) {
                    drawImage();
                });
            }
        }
        if (self.testComponent && self.testComponent == 1) {
            console.log('TEST Video');
            setScale(1);
            self.canvas.width = 300;
            self.canvas.height = 240;
            self.frame = new Image;
            self.frame.src = 'img/test.jpg';
        };

        self.resetVideo();
        //funciton controller
    });
})();