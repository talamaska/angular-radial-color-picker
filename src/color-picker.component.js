export default {
    bindings: {
        onSelect: '&',
        color: '<?ngModel' // initial color to load
    },
    controller: ColorPickerController,
    template: '\
        <div class="color-palette"></div> \
        <div class="rotator" color-picker-rotator on-rotate="$ctrl.onRotatorDrag(angle)" angle="$ctrl.angle">\
            <div class="knob"></div>\
        </div> \
        <div class="color-shadow"></div> \
        <button type="button" class="color" ng-click="$ctrl.onColorSelClick()"></button> \
    '
};

ColorPickerController.$inject = ['$element', '$rootScope', 'ColorPickerService'];
function ColorPickerController($element, $rootScope, ColorPickerService) {
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
