import Propeller from './propeller.js';

export default function colorPickerRotator() {
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
            angle: initialAngle
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
                $element.removeClass('dragging');
            }
        });

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

            colorPicker.removeEventListener('wheel', onScroll);

            colorPicker = null;
        });

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
