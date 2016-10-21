var module = angular
  .module('VideoPanel', [])
  .directive("videoPanel", ['$window', function ($window) {
      return {
          restrict: 'E',
          scope: {
              maxscale: '=?',
              zoomable: '=?',
              mode: '=?',
              testComponent: '=',
          },
          template: " <videoC id='videoContainer' style='position: absolute; border: 1px solid black; z-index: 1;' > " +
                    "   <canvas id='canvasVideo' moz-opaque  style='position: relative; border: 1px solid black; z-index: 1; width: 100%; height:100%;'></canvas> " +
                    " </videoC>  ",
          link: function ($scope, element, attrs) {
              var previousMousePosition = null, isMoving = false, isUpdateOffset = false, isUpdateScale = false, lastZoomDist = null;
              $scope.defaultScale = 1;
              $scope.defaultMaxScale = 6;
              $scope.canZoom = false;
              $scope.pixelRatio = $window.devicePixelRatio;
              $scope.scale = 1;
              if (!$scope.maxscale) {
                  $scope.maxscale = $scope.defaultMaxScale;
              } else {
                  $scope.defaultMaxScale = $scope.maxscale;
              }
              //top of the image
              $scope.offset = {
                  x: 20000,
                  y: 20000
              };
              if (!$scope.mode) {
                  $scope.mode = 'fit';
              }
              $scope.wrapper = element.find('videoC')[0];
              $scope.canvas = element.find('canvas')[0];
              $scope.context = $scope.canvas.getContext('2d');
              $scope.context.imageSmoothingEnabled = false;
              $scope.init = true;
              $scope.blackout = false;              

              $scope.$on('resetVideo', function (event) {
                  $scope.canZoom = false;
                  inMemoryCanvas = undefined;
                  console.log('Reset Video Panel');
                  $scope.frame = new Image;
                  $scope.frame.src = '/Html5PlayerPortableArea/Cache/Scripts/src/app/VideoBar/img/no_video.jpg';
                  $scope.init = true;
                  $scope.blackout = false;
                  $scope.frame.onload = function () {
                      $scope.canvas.width = $scope.frame.width;
                      $scope.canvas.height = $scope.frame.height;
                      $scope.offset = {
                          x: 0,
                          y: 0
                      };
                      setScale(1);
                      drawImage();
                  }
              });


              $scope.$on('blackoutIn', function (event) {
                  console.log('VideoBlackoutIn');
                  $scope.canZoom = false;
                  $scope.frame = new Image;
                  $scope.frame.src = '/Html5PlayerPortableArea/Cache/Scripts/src/app/VideoBar/img/Blackout_Image.png';
                  $scope.frame.onload = function () {
                      if (!$scope.blackout) {
                          $scope.blackout = true;
                          $scope.canvas.width = $scope.frame.width;
                          $scope.canvas.height = $scope.frame.height;
                          $scope.offset = {
                              x: 0,
                              y: 0
                          };
                          setScale(1);
                          drawImage();
                      }
                  }
              });

              $scope.$on('blackoutOut', function (event) {
                  $scope.blackout = false;
                  console.log('VideoBlackoutOut');
                  $scope.canvas.width = $scope.canvas.clientWidth;
                  $scope.canvas.height = $scope.canvas.clientHeight;
                  $scope.offset = {
                      x: 20000,
                      y: 20000
                  };
                  $scope.init = true;
              });

              $scope.$on('drawImage', function (event, rgbaImage) {
                  if (!$scope.blackout && rgbaImage) {
                      $scope.canZoom = true;
                      if (typeof inMemoryCanvas === 'undefined')
                      {
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
                      $scope.frame = inMemoryCanvas;
                      if ($scope.init) {
                          $scope.canvas.width = $scope.canvas.clientWidth;
                          $scope.canvas.height = $scope.canvas.clientHeight;
                          updateScale($scope.frame);
                          $scope.init = false;
                      }
                  
                      if (!$scope.blackout) {
                          drawImage();
                      }
                  }
              });

              $scope.$on('VideoResize', function (event) {
                  if (!$scope.resize) {
                      resize();
                  }
              });

              angular.element($window).bind('resize', function () {
                  if (!$scope.resize) {
                      setTimeout("resize()", 500);
                  }
              });

              var resize = function () {
                  $scope.resize = true;
                  $scope.canvas.width = $scope.canvas.clientWidth;
                  $scope.canvas.height = $scope.canvas.clientHeight;
                  $scope.offset = {
                      x: 20000,
                      y: 20000
                  };
                  if ($scope.frame) {
                      updateScale($scope.frame);
                      // if it's a blackout or no video picture init  = true
                      if (!$scope.frame.src) {
                          $scope.init = false;
                      }
                      drawImage();
                  };
                  $scope.resize = false;
              }

              function setScale(scale) {
                  isUpdateScale = true;
                  if (scale && scale != null && scale != Infinity) {
                      $scope.scale = scale;
                  }
                  isUpdateScale = false;
              }

              function updateScale(image) {
                  var widthScale = $scope.canvas.width / image.width, heightScale = $scope.canvas.height / image.height;
                  if ($scope.mode === 'fill') {
                      $scope.defaultScale = Math.max(widthScale, heightScale);
                  } else if ($scope.mode === 'fit') {
                      $scope.defaultScale = Math.min(widthScale, heightScale);
                  } else {
                      $scope.defaultScale = 1;
                  }
                  setScale($scope.defaultScale);
              }


              function drawImage() {
                  if ($scope.frame) {
                      if (isUpdateScale || isUpdateOffset) {
                          return;
                      }
                      clipToBounds($scope.frame);
                      drawCanvasImage($scope.context, $scope.frame, $scope.scale, $scope.offset);
                  }
              }

              function clipToBounds(image) {
                  isUpdateOffset = true;
                  var bounds = {
                      width: $scope.canvas.width,
                      height: $scope.canvas.height
                  }, offsetLimits = getImageOffsetLimits(image, $scope.scale, bounds);
                  if ($scope.offset.y < offsetLimits.top) {
                      $scope.offset.y = offsetLimits.top;
                  }
                  if ($scope.offset.y > offsetLimits.bottom) {
                      $scope.offset.y = offsetLimits.bottom;
                  }
                  if ($scope.offset.x < offsetLimits.left) {
                      $scope.offset.x = offsetLimits.left;
                  }
                  if ($scope.offset.x > offsetLimits.right) {
                      $scope.offset.x = offsetLimits.right;
                  }
                  isUpdateOffset = false;
              }

              $scope.$on('ZoomIn', function (event) {
                  if ($scope.canZoom) {
                      $scope.scale *= 1.2;
                  }
              });

              $scope.$on('ZoomOut', function (event) {
                  if ($scope.canZoom) {
                      $scope.scale /= 1.2;
                  }
              });

              $scope.$on('MoveLeft', function (event) {
                  $scope.offset = {
                      x: $scope.offset.x + 100,
                      y: $scope.offset.y
                  };
              });

              $scope.$on('MoveUp', function (event) {
                  $scope.offset = {
                      x: $scope.offset.x,
                      y: $scope.offset.y + 100
                  };
              });

              $scope.$on('MoveRight', function (event) {
                  $scope.offset = {
                      x: $scope.offset.x - 100,
                      y: $scope.offset.y
                  };
              });

              $scope.$on('MoveDown', function (event) {
                  $scope.offset = {
                      x: $scope.offset.x,
                      y: $scope.offset.y - 100
                  };
              });


              function drawCanvasImage(ctx, image, scale, offset) {
                  if (scale && offset) {
                      var imageHalfWidth = image.width / 2, imageHalfHeight = image.height / 2, canvasHalfWidth = $scope.context.canvas.width / 2, canvasHalfHeight = $scope.context.canvas.height / 2, beforeScaleOffset = {
                          x: (-imageHalfWidth + offset.x) * scale,
                          y: (-imageHalfHeight + offset.y) * scale
                      }, afterScaleOffset = {
                          x: canvasHalfWidth / scale,
                          y: canvasHalfHeight / scale
                      };
                      $scope.context.canvas.width = $scope.context.canvas.width;
                      // move center to the left and top corner
                      $scope.context.translate(beforeScaleOffset.x, beforeScaleOffset.y);
                      // scale
                      $scope.context.scale(scale, scale);
                      // move center back to the center
                      $scope.context.translate(afterScaleOffset.x, afterScaleOffset.y);
                  }
                  // draw image in original size
                  $scope.context.drawImage(image, 0, 0);//, image.width, image.height, 0, 0, image.width, image.height);

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


              if ($scope.zoomable) {
                  function getMousePosition(e) {
                      var rect = $scope.canvas.getBoundingClientRect();
                      return {
                          x: (e.clientX - rect.left) / $scope.scale,
                          y: (e.clientY - rect.top) / $scope.scale
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
                          $scope.offset = {
                              x: $scope.offset.x + (mousePosition.x - previousMousePosition.x) * 3,
                              y: $scope.offset.y + (mousePosition.y - previousMousePosition.y) * 3
                          };
                          previousMousePosition = mousePosition;
                          $scope.$apply();
                      }
                  }
                  function zoom(e, touch1, touch2) {
                      e.preventDefault();
                      var dist = Math.sqrt(Math.pow(touch2.pageX - touch1.pageX, 2) + Math.pow(touch2.pageY - touch1.pageY, 2));
                      if (lastZoomDist) {
                          $scope.scale *= dist / lastZoomDist;
                          $scope.$apply();
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
                      if ($scope.canZoom) {
                          if ((e.detail ? (e.detail * -120) : e.wheelDelta) < 0) {
                              $scope.scale /= 1.2;
                          } else {
                              $scope.scale *= 1.2;
                          }
                          $scope.$apply();
                      }
                  }
                  $scope.canvas.addEventListener('mousedown', handleMouseDown, false);
                  $scope.canvas.addEventListener('mouseup', handleMouseUp, false);
                  $scope.canvas.addEventListener('mouseleave', handleMouseUp, false);
                  $scope.canvas.addEventListener('mousemove', handleMouseMove, false);
                  $scope.canvas.addEventListener('mousewheel', handleMouseWheel, false);
                  $scope.canvas.addEventListener(navigator.userAgent.indexOf("Firefox") > -1 ? "DOMMouseScroll" : "mousewheel", handleMouseWheel, false);
                  $scope.canvas.addEventListener('touchstart', handleTouchStart, false);
                  $scope.canvas.addEventListener('touchend', handleTouchEnd, false);
                  $scope.canvas.addEventListener('touchcancel', handleTouchEnd, false);
                  $scope.canvas.addEventListener('touchleave', handleTouchEnd, false);
                  $scope.canvas.addEventListener('touchmove', handleTouchMove, false);
                  if (!$scope.testComponent || $scope.testComponent != 1) {
                      $scope.$watch(function () {
                          return $scope.scale;
                      }, function (newScale, oldScale) {
                          if (newScale != oldScale) {
                              if (newScale < $scope.defaultScale) {
                                  setScale($scope.defaultScale);
                              }
                              if (newScale > $scope.maxscale) {
                                  setScale($scope.defaultMaxScale);
                              }
                              drawImage();
                          }
                      });
                      $scope.$watch(function () {
                          return $scope.offset;
                      }, function (newOffset) {
                          drawImage();
                      });
                  }
              }
              if ($scope.testComponent && $scope.testComponent == 1) {
                  console.log('TEST Video');
                  setScale(1);
                  $scope.canvas.width = 1920;
                  $scope.canvas.height = 1080;
                  $scope.frame = new Image;
                  $scope.frame.src = '/Html5PlayerPortableArea/Cache/Scripts/src/app/VideoBar/img/download.png';
              };
          }
      };
  }]);