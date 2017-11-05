import ColorPickerService from './color-picker.service.js';
import colorPickerRotator from './color-picker-rotator.directive.js';
import colorPickerComponent from './color-picker.component.js';
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
     * @private
     *
     * @param {expression} [onRotate]          Function to invoke when angle changes
     * @param {number}     [angle]             Angle to change the rotator at. A number between 0 and 359
     * @param {boolean}    [disabled]          Reference for the closed state of the picker. When the picker is closed disabled is true. Defaults to false
     * @param {boolean}    [mouseScroll]       Opt-in for using wheel event to rotate. Defaults to falsy value and the wheel event listener is not added
     * @param {number}     [scrollSensitivity] Amount of degrees to rotate the picker with keyboard and/or wheel. Defaults to 2 degrees
     *
     * @description
     * Provides rotation capabilities to any element. Also supports touch devices.
     * Although it's visible to other modules usage of this directive is discouraged by 3rd party users.
     * Changes in this directive are considered as breaking and are subject to change at any time.
     *
     * @example <div color-picker-rotator on-rotate="$ctrl.onRotate(angle)" angle="0" disabled="false" mouse-scroll="false" scroll-sensitivity="2"></div>
     */
    .directive('colorPickerRotator', colorPickerRotator)

    /**
     * @ngdoc component
     * @name colorPicker
     * @module color.picker.core
     * @restrict E
     *
     * @param {expression} [onSelect]          A function to invoke when user selects a color
     * @param {Object}     [color]             HSLA color model. If provided will set the picker to the provided color
     *                                         Defaults to { hue: 0, saturation: 100, luminosity: 50, alpha: 1 }
     * @param {number}     color.hue           Value between 0 and 359
     * @param {number}     color.saturation    Value between 0 and 100
     * @param {number}     color.luminosity    Value between 0 and 100
     * @param {number}     color.alpha         Value between 0 and 1
     * @param {expression} [onColorChange]     A function to invoke when color is changed (i.e. on rotation).
     *                                         `on-color-change` is like `ng-change` to `ng-model` - triggered every time the color is changed
     * @param {boolean}    [mouseScroll]       Opt-in for using wheel event to rotate.
     *                                         Defaults to falsy value and the wheel event listener is not added
     * @param {number}     [scrollSensitivity] Amount of degrees to rotate the picker with keyboard and/or wheel. Defaults to 2 degrees
     *
     * @description
     * Material design radial color picker. Provides selecting a pure color via dragging the whole color wheel.
     * `color` is used to change programatically the active color in the picker. If it's not provided
     * the initial color defaults to red (0, 100%, 50%, 1).
     *
     * The `on-select` attribute is a function which is called when a user a user selects a color with the color
     * selector in the middle. The function is invoked only if the color picker is opened.
     *
     * For easier communication a set of events are provided that can even programatically open or close the picker
     * without interacting with the UI. All events are published/subscribed at the $rootScope so that sibling components
     * can subscribe to them too. This means that you can subscribe for an event on the $scope too.
     * All events carry the current color in the event data payload.
     *
     * `color-picker.show` - Fires when the color picker is about to show and *before* any animation is started.
     * `color-picker.shown` - Fires when the color picker is shown and has finished animating.
     *
     * `color-picker.selected` - Fires when a color is selected via the middle selector. Event is fired right before `hide`.
     *
     * `color-picker.hide` - Fires when the color picker is about to hide and *before* any animation is started.
     * `color-picker.hidden` - Fires when the color picker is hidden and has finished animating.
     *
     * `color-picker.open` - Programatically opens the color picker if it's not already open.
     * `color-picker.close` - Programatically closes the color picker if it's not already closed.
     *
     * @example <color-picker on-select="$ctrl.onSelect(color)" color="$ctrl.initialColor" on-color-change=""></color-picker>
     */
    .component('colorPicker', colorPickerComponent);
