import ColorPickerService from './color-picker.service.js';
import colorPickerRotator from './color-picker-rotator.directive.js';
import ColorPickerController from './color-picker.component.js';

export default angular
    .module('color.picker.core', [])

    .service('ColorPickerService', ColorPickerService)

    .directive('colorPickerRotator', colorPickerRotator)

    .component('colorPicker', {
        bindings: {
            onSelect: '&',
            color: '<?ngModel' // initial color to load
        },
        controller: ColorPickerController,
        template:   '<div class="rotator" color-picker-rotator on-rotate="$ctrl.onRotatorDrag(angle)" angle="$ctrl.angle">' +
                        '<div class="knob"></div>' +
                    '</div>' +
                    '<button type="button" class="color" ng-click="$ctrl.onColorSelClick()"></button>' +
                    '<div class="color-shadow"></div>' +
                    '<div class="color-palette"></div>'
    });

