(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        // CommonJS
        if (typeof angular === 'undefined') {
            factory(require('angular'));
        } else {
            factory(angular);
        }
        module.exports = 'color.picker.core';
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(['angular'], factory);
    } else {
        // Global Variables
        factory(root.angular);
    }
}(this, function (angular) {
    'use strict';

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
    angular
        .module('color.picker.core', [])
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

    /* @ngInject */
    function ColorPickerController($element, ColorPickerService) {
        var vm = this;

        this.$onInit = $onInit;
        this.$onDestroy = $onDestroy;
        this.$onChanges = $onChanges;
        this.onColorSelClick = onColorSelClick;
        this.onRotatorDrag = onRotatorDrag;

        var knob, rotator, colorSel, ripple, palette;

        ColorPickerService.subscribe('open', function() {
            if (!_isPaletteVisible()) {
                ColorPickerService.publish('show', vm.selectedColor);

                // showing palette will also show the knob
                palette.classList.add('blur-palette-in');
                palette.classList.remove('blur-palette-out');
            }
        });

        ColorPickerService.subscribe('close', function() {
            if (_isPaletteVisible()) {
                ColorPickerService.publish('hide', vm.selectedColor);

                // hiding knob will also hide the palette
                knob.classList.add('zoom-knob-out');
                knob.classList.remove('zoom-knob-in');
            }
        });

        function onColorSelClick() {
            colorSel.classList.add('click-color');

            if (_isPaletteVisible()) {
                vm.onSelect({ color: vm.selectedColor });
                ColorPickerService.publish('selected', vm.selectedColor);
                ColorPickerService.publish('hide', vm.selectedColor);
                ripple.classList.add('color-shadow-animate');
            } else {
                ColorPickerService.publish('show', vm.selectedColor);
                palette.classList.add('blur-palette-in');
                palette.classList.remove('blur-palette-out');
            }
        }

        function onRotatorDrag(angle) {
            var saturation = 100;
            var luminosity = 50;
            var alpha = 1;
            var color = 'hsla(' + angle + ', ' + saturation + '%, ' + luminosity + '%, ' + alpha + ')';
            var rgbModel = ColorPickerService.hslToRgb(angle, saturation, luminosity);
            var hexModel = ColorPickerService.hslToHex(angle, saturation, luminosity);

            colorSel.style.backgroundColor = color;
            ripple.style.borderColor = color;

            vm.angle = angle;
            vm.selectedColor = {
                hex: hexModel,
                hsla: {
                    hue: angle,
                    saturation: saturation,
                    luminosity: luminosity,
                    alpha: alpha
                },
                rgba: {
                    red: rgbModel.red,
                    green: rgbModel.green,
                    blue: rgbModel.blue,
                    alpha: alpha
                }
            };
        }

        function $onInit() {
            rotator = $element[0].querySelector('.rotator');
            knob = $element[0].querySelector('.knob');
            colorSel = $element[0].querySelector('.color');
            ripple = $element[0].querySelector('.color-shadow');
            palette = $element[0].querySelector('.color-palette');

            colorSel.addEventListener('animationend', _onColorSelAnimationEnd);
            knob.addEventListener('transitionend', _onKnobTransitionEnd);
            ripple.addEventListener('animationend', _onRippleAnimationEnd);
            palette.addEventListener('transitionend', _onPaletteTransitionEnd);

            // @fix angular < 1.5.4 doesn't trigger $onChanges properly on init
            $onChanges.call(this);
        }

        function $onChanges() {
            if (this.color && 'red' in this.color && 'green' in this.color && 'blue' in this.color) {
                this.angle = ColorPickerService.rgbToHsl(this.color.red, this.color.green, this.color.blue).hue;
            } else {
                this.angle = 0;
            }
        }

        function $onDestroy() {
            colorSel.removeEventListener('animationend', _onColorSelAnimationEnd);
            knob.removeEventListener('transitionend', _onKnobTransitionEnd);
            ripple.removeEventListener('animationend', _onRippleAnimationEnd);
            palette.removeEventListener('transitionend', _onPaletteTransitionEnd);

            // clear circular child DOM node references to allow GC to collect them
            knob     = null; rotator = null;
            colorSel = null; ripple = null;
            palette  = null;

            ColorPickerService.unsubscribe();
        }

        function _onColorSelAnimationEnd() {
            if (!_isKnobVisible()) {
                knob.classList.add('zoom-knob-in');
                knob.classList.remove('zoom-knob-out');
            } else {
                knob.classList.add('zoom-knob-out');
                knob.classList.remove('zoom-knob-in');
            }

            colorSel.classList.remove('click-color');
        }

        function _onKnobTransitionEnd(ev) {
            // 'transitionend' fires for every transitioned property
            if (ev.propertyName === 'transform') {
                if (!_isKnobVisible()) {
                    palette.classList.add('blur-palette-out');
                    palette.classList.remove('blur-palette-in');
                } else {
                    ColorPickerService.publish('shown', vm.selectedColor);
                }
            }
        }

        function _onRippleAnimationEnd() {
            ripple.classList.remove('color-shadow-animate');
        }

        function _onPaletteTransitionEnd(ev) {
            // 'transitionend' fires for every transitioned property
            if (ev.propertyName === 'transform') {
                if (_isPaletteVisible()) {
                    knob.classList.add('zoom-knob-in');
                    knob.classList.remove('zoom-knob-out');
                } else {
                    ColorPickerService.publish('hidden', vm.selectedColor);
                }
            }
        }

        function _isPaletteVisible() {
            var isIn = palette.classList.contains('blur-palette-in');
            var isOut = palette.classList.contains('blur-palette-out');

            return isIn || (!isIn && !isOut);
        }

        function _isKnobVisible() {
            return !knob.classList.contains('zoom-knob-out');
        }
    }

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
    angular
        .module('color.picker.core')
        .service('ColorPickerService', ColorPickerService);

    /* @ngInject */
    function ColorPickerService($rootScope) {
        this.publish = publish;
        this.subscribe = subscribe;
        this.unsubscribe = unsubscribe;

        this.rgbToHex = rgbToHex;
        this.rgbToHsl = rgbToHsl;
        this.hslToRgb = hslToRgb;
        this.hslToHex = hslToHex;

        var subscribers = [];
        var eventPrefix = 'color-picker.'

        /**
         * Broadcasts an event on the whole app. Uses $rootScope as an event bus
         * so that sibling components can catch the event also. $applyAsync is used
         * to make sure that the broadcast happens on the earliest next digest cycle.
         *
         * @memberOf Utilities
         *
         * @param  {string} eventName Sub-topic to broadcast
         * @param  {*}      [data]    Any type of payload to broadcast
         *
         * @return {void}
         */
        function publish(eventName, data) {
            $rootScope.$applyAsync(function() {
                // queue up the broadcast in the next digest
                $rootScope.$broadcast(eventPrefix + eventName, data);
            });
        }

        /**
         * Facade wrapper for outside world interaction via $rootScope events.
         *
         * @memberOf Utilities
         *
         * @param  {string}   eventName Sub-topic to listen for. Can be 'open' or 'close'
         * @param  {Function} callback  Function to invoke when event gets fired
         *
         * @return {Function}           Unsubscribe function for manual unsubscribtion.
         */
        function subscribe(eventName, callback) {
            var unsubToken = $rootScope.$on(eventPrefix + eventName, callback);

            subscribers.push(unsubToken);

            return unsubToken;
        }

        /**
         * Removes all event listeners setup with the `.subscribe()` method
         *
         * @memberOf Utilities
         *
         * @param  {string}   eventName Sub-topic to listen for. Can be 'open' or 'close'
         * @param  {Function} callback  Function to invoke when event gets fired
         *
         * @return {void}
         */
        function unsubscribe() {
            subscribers.forEach(function(unsubscribe) {
                unsubscribe();
            });
        }

        /**
         * Converts RGB color model to hexadecimal string.
         *
         * @memberOf Utilities
         *
         * @param  {number} r Integer between 0 and 255
         * @param  {number} g Integer between 0 and 255
         * @param  {number} b Integer between 0 and 255
         *
         * @return {string}   6 char long hex string
         */
        function rgbToHex(r, g, b) {
            return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        /**
         * Converts RGB color model to HSL model.
         *
         * @memberOf Utilities
         *
         * @param   {number} r Integer between 0 and 255
         * @param   {number} g Integer between 0 and 255
         * @param   {number} b Integer between 0 and 255
         *
         * @return  {Object}   The HSL representation containing the hue (in degrees),
         *                     saturation (in percentage) and luminosity (in percentage) fields.
         */
        function rgbToHsl(r, g, b) {
            r = r / 255;
            g = g / 255;
            b = b / 255;

            var h, s;
            var max = Math.max(r, g, b);
            var min = Math.min(r, g, b);
            var l = (max + min) / 2;

            if (max === min) {
                h = s = 0; // achromatic
            } else {
                var d = max - min;

                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

                if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
                if (max === g) h = (b - r) / d + 2;
                if (max === b) h = (r - g) / d + 4;
            }

            return {
                hue: h * 60,
                saturation: s * 100,
                luminosity: l * 100
            };
        }

        /**
         * Converts HSL color model to hexademical string.
         *
         * @memberOf Utilities
         *
         * @param  {number} r Integer between 0 and 255
         * @param  {number} g Integer between 0 and 255
         * @param  {number} b Integer between 0 and 255
         *
         * @return {string}   6 char long hex string
         */
        function hslToHex(h, s, l) {
            var colorModel = hslToRgb(h, s, l);

            return rgbToHex(colorModel.red, colorModel.green, colorModel.blue);
        }

        /**
         * Converts HSL color model to RGB model.
         * Shamelessly taken from http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
         *
         * @memberOf Utilities
         *
         * @param   {number} h The hue. Number in the 0-360 range
         * @param   {number} s The saturation. Number in the 0-100 range
         * @param   {number} l The luminosity. Number in the 0-100 range
         *
         * @return  {Object}   The RGB representation containing the red, green and blue fields
         */
        function hslToRgb(h, s, l) {
            var r, g, b;

            h = h / 360;
            s = s / 100;
            l = l / 100;

            if (s === 0) {
                r = g = b = l; // achromatic
            } else {
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;

                r = _hue2rgb(p, q, h + 1/3);
                g = _hue2rgb(p, q, h);
                b = _hue2rgb(p, q, h - 1/3);
            }

            return {
                red: Math.round(r * 255),
                green: Math.round(g * 255),
                blue: Math.round(b * 255)
            };
        }

        function _hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;

            return p;
        }
    }
}));
