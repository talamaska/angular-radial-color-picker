import ColorPickerService from './color-picker.service.js';
import colorPickerRotator from './color-picker-rotator.directive.js';
import ColorPickerController from './color-picker.component.js';

export default angular
    /**
     * @ngdoc module
     * @name color.picker.core
     * @description
     *
     * Angular Radial Color Picker
     */
    .module('color.picker.core', [])

    /**
     * @ngdoc service
     * @namespace Utilities
     * @name ColorPickerService
     * @module color.picker.core
     * @requires $rootScope
     *
     * @description
     * API for intercomponent comunication and color model conversions.
     *
     * @example
     * // Convert RGB color model to hexadecimal string
     * ColorPickerService.rgbToHex(255, 0, 0); // returns 'FF0000'
     */
    .service('ColorPickerService', ColorPickerService)

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
    .directive('colorPickerRotator', colorPickerRotator)

    /**
     * @ngdoc component
     * @name colorPicker
     * @module color.picker.core
     * @restrict E
     *
     * @param {expression} [onSelect]      A function to invoke when user selects a color
     * @param {Object}     [ngModel]       RGBA color model. If provided will set the picker to the provided color
     *                                     Defaults to { red: 255, green: 0, blue: 0 }
     * @param {number}     [ngModel.red]   Value between 0 and 255
     * @param {number}     [ngModel.green] Value between 0 and 255
     * @param {number}     [ngModel.blue]  Value between 0 and 255
     * @param {number}     [ngModel.alpha] Value between 0 and 1
     *
     * @description
     * Material design radial color picker. Provides selecting a pure color via dragging the whole color wheel.
     * `ng-model` is used to change programatically the active color in the picker. If it's not provided
     * the initial color defaults to red (255, 0, 0).
     *
     * The `on-select` attribute is a function which is called when a user a user selects a color with the color
     * selector in the middle. The function is invoked only if the color picker is opened.
     *
     * For easier communication a set of events are provided that can even programatically open or close the picker
     * without interacting with the UI. All events are published/subscribed at the $rootScope so that sibling components
     * can subscribe to them too. All events carry the current color in the event data payload.
     *
     * `color-picker.show` - Fires when the color picker is about to show and *before* any animation is started.
     * `color-picker.shown` - Fires when the color picker is shown and has finished animating.
     *
     * `color-picker.selected` - Fires when a color is selected via the middle selector. Event is fired right before `hide`.
     *
     * `color-picker.hide` - Fires when the color picker is about to hide and *before* any animation is started.
     * `color-picker.hidden` - Fires when the color picker is hidden and has finished animating.
     *
     * @example <color-picker on-select="$ctrl.onSelect(color)" ng-model="$ctrl.initialColor"></color-picker>
     */
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

