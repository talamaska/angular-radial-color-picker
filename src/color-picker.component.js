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
}));
