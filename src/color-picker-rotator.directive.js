import Propeller from './propeller.js';

export default function colorPickerRotator() {
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
