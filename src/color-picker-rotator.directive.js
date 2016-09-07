(function() {
    'use strict';

    /**
     * @ngdoc directive
     * @name colorPickerRotator
     * @module color.picker.core
     * @restrict A
     *
     * @param {expression} [onRotate] Usually a function to invoke when angle changes
     * @param {number}     [angle]    Angle to change the rotator at. A number between 0 and 360
     *
     * @description
     * Provides rotation capabilities to any element. Also supports touch devices.
     *
     * @example <div color-picker-rotator on-rotate="$ctrl.onRotate(angle)" angle="$ctrl.angle"></div>
     */
    angular
        .module('color.picker.core')
        .directive('colorPickerRotator', colorPickerRotator);

    /* @ngInject */
    function colorPickerRotator() {
        var directive = {
            link: ColorPickerRotatorLink,
            restrict: 'A',
            scope: {
                onRotate: '&',
                angle: '<'
            }
        };

        return directive;

        function ColorPickerRotatorLink($scope, $element) {
            $scope.angle = $scope.angle || 0;

            var propelInstance = new Propeller($element[0], {
                angle: $scope.angle,
                inertia: .7,
                speed: 0,
                onRotate: function(ev) {
                    $scope.onRotate({ angle: this.angle });
                },
                onDragStart: function() {
                    $element.addClass('dragging');
                },
                onDragStop: function() {
                    $element.removeClass('dragging');
                }
            });

            $scope.$watch('angle', function(newAngle) {
                propelInstance.angle = newAngle;
                $scope.onRotate({ angle: newAngle });
            });

            $scope.$on('$destroy', function() {
                propelInstance.stop();
                propelInstance.unbind();
                propelInstance = null;
            });
        }
    }
})();
