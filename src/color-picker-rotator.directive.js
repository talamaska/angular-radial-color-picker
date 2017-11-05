import Propeller from './propeller.js';

colorPickerRotator.$inject = ['ColorPickerService'];
export default function colorPickerRotator(ColorPickerService) {
    var directive = {
        link: ColorPickerRotatorLink,
        restrict: 'A',
        scope: {
            onRotate: '&',
            angle: '<',
            disabled: '<',
            mouseScroll: '<',
            scrollSensitivity: '<'
        }
    };

    return directive;

    function ColorPickerRotatorLink($scope, $element) {
        var colorPicker = $element[0].parentElement;
        var scrollSensitivity = $scope.scrollSensitivity || 2;
        var initialAngle = $scope.angle || 0;

        var propelInstance = new Propeller($element[0], {
            angle: initialAngle,
            inertia: .7,
            speed: 0,
            onRotate: function(ev) {
                $scope.onRotate({ angle: this.angle });
            },
            onDragStart: function() {
                if (!$scope.disabled) {
                    $element.addClass('dragging');
                }
            },
            onDragStop: function() {
                if (!$scope.disabled) {
                    $element.removeClass('dragging');
                }
            }
        });

        colorPicker.addEventListener('keydown', onKeydown);
        colorPicker.addEventListener('dblclick', onDblClick, { passive: true });

        if ($scope.mouseScroll) {
            colorPicker.addEventListener('wheel', onScroll);
        }

        $scope.$watch('angle', function(newAngle, oldAngle) {
            if (newAngle !== oldAngle) {
                propelInstance.angle = newAngle;
            }
        });

        $scope.$on('$destroy', function() {
            propelInstance.stop();
            propelInstance.unbind();
            propelInstance = null;

            colorPicker.removeEventListener('keydown', onKeydown);
            colorPicker.removeEventListener('dblclick', onDblClick);
            colorPicker.removeEventListener('wheel', onScroll);

            colorPicker = null;
        });

        function onKeydown(ev) {
            if ($scope.disabled)
                return;

            var multiplier = 0;
            var isIncrementing = ColorPickerService.isKey.up(ev.key) || ColorPickerService.isKey.right(ev.key);
            var isDecrementing = ColorPickerService.isKey.down(ev.key) || ColorPickerService.isKey.left(ev.key);

            if (isIncrementing) {
                multiplier = 1;

                if (ev.ctrlKey) {
                    multiplier = 6;
                } else if (ev.shiftKey) {
                    multiplier = 3;
                }
            } else if (isDecrementing) {
                multiplier = -1;

                if (ev.ctrlKey) {
                    multiplier = -6;
                } else if (ev.shiftKey) {
                    multiplier = -3;
                }
            }

            if (isIncrementing || isDecrementing) {
                ev.preventDefault();
                propelInstance.angle += scrollSensitivity * multiplier;
            }
        }

        function onDblClick(ev) {
            if ($scope.disabled || !ev.target.classList.contains('rotator'))
                return;

            var newAngle = propelInstance.getAngleToMouse({
                x: ev.clientX,
                y: ev.clientY,
            });

            propelInstance.angle = newAngle * Propeller.radToDegMulti;
        }

        function onScroll(ev) {
            if ($scope.disabled)
                return;

            ev.preventDefault();

            if (ev.deltaY > 0) {
                propelInstance.angle += scrollSensitivity;
            } else {
                propelInstance.angle -= scrollSensitivity;
            }
        }
    }
}
