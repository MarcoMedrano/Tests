(function () {
    angular.module('webPlayerApp').directive('buttonPanel', function () {
        return {
            restrict: 'E',
            template: '<section>' +
                       //' <mfb-menu position="plt" effect="slidein"'+
                       // '    active-icon="glyphicon glyphicon-screenshot" resting-icon="glyphicon glyphicon-move"'+
                       //'     toggling-method="click" menu-state="open" >             '+
                       //'     <mfb-button icon="glyphicon glyphicon-arrow-right" ng-click="cursorRight()" ></mfb-button>'+
                       //'     <mfb-button icon="glyphicon glyphicon-arrow-down" ng-click="cursorDown()"  ></mfb-button>       '+        
                       //'     <mfb-button icon="glyphicon glyphicon glyphicon-arrow-left" ng-click="cursorLeft()"></mfb-button>'+
                       //'     <mfb-button icon="glyphicon glyphicon-arrow-up" ng-click="cursorUp()"></mfb-button>'+
                       //' </mfb-menu>'+
                      //'  <mfb-menu position="pl" effect="slidein"'+
                      // ' active-icon="glyphicon glyphicon-eye-close" resting-icon="glyphicon glyphicon-picture"'+
                      //'  toggling-method="hover" menu-state="closed"  >'+
                      //'      <mfb-button icon="glyphicon glyphicon-zoom-in" ng-click="zoomIn()" label="Zoom in" ></mfb-button>'+
                      //'      <mfb-button icon="glyphicon glyphicon-zoom-out" ng-click="zoomOut()" label="Zoom out" ></mfb-button>'+
                      // ' </mfb-menu>  '+
                     // '  <mfb-menu position="tr" effect="slidein"'+
                     // '  active-icon="glyphicon glyphicon-minus" resting-icon="glyphicon glyphicon-pushpin"'+
                     // '  toggling-method="hover" menu-state="closed" label="Menu" >'+
                     // '      <mfb-button icon="glyphicon glyphicon-th-list" ng-click="openLogs()" label="Show Logs" ></mfb-button>'+
                     // '  </mfb-menu>'+
                    '</section>',
            controllerAs: 'buttonCrtl',
            bindToController: true, //required in 1.3+ with controllerAs
            controller: function ($scope, $rootScope, $http, DialogLogsProvider, hotkeys) {
                /** 
                  * Logs Buttons
                  */
                $scope.openLogs = function () {
                    DialogLogsProvider.openLogs();
                }

                $scope.closeLogs = function () {
                    DialogLogsProvider.closeLogs();
                }

                /** 
                * Video Buttons
                */
                $scope.zoomIn = function () {
                    $rootScope.$broadcast('ZoomIn');
                }

                $scope.zoomOut = function () {
                    $rootScope.$broadcast('ZoomOut');
                }

                $scope.cursorLeft = function () {
                    $rootScope.$broadcast('MoveLeft');
                }

                $scope.cursorUp = function () {
                    $rootScope.$broadcast('MoveUp');
                }

                $scope.cursorRight = function () {
                    $rootScope.$broadcast('MoveRight');
                }

                $scope.cursorDown = function () {
                    $rootScope.$broadcast('MoveDown');
                }

                $scope.hideScreenCapture = function () {
                    $rootScope.$broadcast('hideScreenCapture');
                }

                $scope.showScreenCapture = function () {
                    $rootScope.$broadcast('showScreenCapture');
                }

                $scope.hideLayerDetail = function () {
                    $rootScope.$broadcast('hideLayerDetail');
                }

                $scope.showLayerDetail = function () {
                    $rootScope.$broadcast('showLayerDetail');
                }



                $scope.showWaveZoom = function () {
                    $rootScope.$broadcast('showHideZoomWaveBar');
                };

                $scope.showTags = function () {
                    $rootScope.$broadcast('showHideTagLabelBar');
                };


                $scope.waveZoomIn = function () {
                    $rootScope.$broadcast('waveZoomIn');
                };

                $scope.waveZoomOut = function () {
                    $rootScope.$broadcast('waveZoomOut');
                };

                /** 
                * Key shortcut
                */
                hotkeys.add({
                    combo: 'up',
                    description: 'Move Video up',
                    callback: function () {
                        $scope.cursorUp();
                    },
                });
                hotkeys.add({
                    combo: 'down',
                    description: 'Move Video down',
                    callback: function () {
                        $scope.cursorDown();
                    },
                });

                hotkeys.add({
                    combo: 'left',
                    description: 'Move Video left',
                    callback: function () {
                        $scope.cursorLeft();
                    },
                });

                hotkeys.add({
                    combo: 'right',
                    description: 'Move Video right',
                    callback: function () {
                        $scope.cursorRight();
                    },
                });

                hotkeys.add({
                    combo: 'ctrl+up',
                    description: 'zoom in video',
                    callback: function () {
                        $scope.zoomIn();
                    },
                });

                hotkeys.add({
                    combo: 'ctrl+down',
                    description: 'zoom out video',
                    callback: function () {
                        $scope.zoomOut();
                    },
                });

                hotkeys.add({
                    combo: 'ctrl+alt+l',
                    description: 'Open Logs',
                    callback: function () {
                        $scope.openLogs();
                    },
                });

                hotkeys.add({
                    combo: 'ctrl+alt+z',
                    description: 'Open Zoom wave Panel',
                    callback: function () {
                        $scope.showWaveZoom();
                    },
                });

                hotkeys.add({
                    combo: 'ctrl+alt+t',
                    description: 'Open Zoom wave Panel + Label panel',
                    callback: function () {
                        $scope.showTags();
                    },
                });
            }
        }

    });

})();


