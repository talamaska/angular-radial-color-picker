export default {
    bindings: {
        onSelect: '&',
        color: '<',
        onColorChange: '&'
        mouseScroll: '<',
        scrollSensitivity: '<'
    },
    controller: ColorPickerController,
    template: '\
        <div class="color-palette"></div> \
        <div class="rotator" \
             color-picker-rotator \
             disabled="$ctrl.disabled" \
             mouse-scroll="$ctrl.mouseScroll" \
             scroll-sensitivity="$ctrl.scrollSensitivity" \
             on-rotate="$ctrl.onRotatorDrag(angle)" \
             angle="$ctrl.angle">\
            <div class="knob"></div>\
        </div> \
        <div class="color-shadow"></div> \
        <button type="button" class="color" ng-click="$ctrl.onColorSelClick()"></button> \
    '
};

ColorPickerController.$inject = ['$element', '$rootScope', 'ColorPickerService'];
function ColorPickerController($element, $rootScope, ColorPickerService) {
    var vm = this;

    this.disabled = false;
    this.colorModel = { hue: 0, saturation: 100, luminosity: 50, alpha: 1 };

    this.$onInit = $onInit;
    this.$onDestroy = $onDestroy;
    this.$onChanges = $onChanges;
    this.onColorSelClick = onColorSelClick;
    this.onRotatorDrag = onRotatorDrag;

    var wrapper, knob, rotator, colorSel, ripple, palette;

    ColorPickerService.subscribe('open', function() {
        if (vm.disabled) {
            ColorPickerService.publish('show', vm.colorModel);

            // showing palette will also show the knob
            palette.classList.add('blur-palette-in');
            palette.classList.remove('blur-palette-out');
        }
    });

    ColorPickerService.subscribe('close', function() {
        if (!vm.disabled) {
            ColorPickerService.publish('hide', vm.colorModel);

            // hiding knob will also hide the palette
            knob.classList.add('zoom-knob-out');
            knob.classList.remove('zoom-knob-in');
        }
    });

    function onColorSelClick() {
        colorSel.classList.add('click-color');

        if (!vm.disabled) {
            ColorPickerService.publish('selected', vm.colorModel);
            vm.onSelect({ color: vm.colorModel });
            ColorPickerService.publish('hide', vm.colorModel);
            ripple.classList.add('color-shadow-animate');
        } else {
            ColorPickerService.publish('show', vm.colorModel);
            palette.classList.add('blur-palette-in');
            palette.classList.remove('blur-palette-out');
        }
    }

    function onRotatorDrag(angle) {
        vm.angle = angle;

        _updateColoredElements(angle);

        $rootScope.$applyAsync(function() {
            vm.onColorChange({ color: vm.colorModel });
        });
    }

    function $onInit() {
        wrapper = $element[0];
        rotator = wrapper.querySelector('.rotator');
        knob = wrapper.querySelector('.knob');
        colorSel = wrapper.querySelector('.color');
        ripple = wrapper.querySelector('.color-shadow');
        palette = wrapper.querySelector('.color-palette');

        wrapper.addEventListener('keyup', _togglePalleteOnEnter);
        colorSel.addEventListener('animationend', _onColorSelAnimationEnd);
        knob.addEventListener('transitionend', _onKnobTransitionEnd);
        ripple.addEventListener('animationend', _onRippleAnimationEnd);
        palette.addEventListener('transitionend', _onPaletteTransitionEnd);

        wrapper.setAttribute('tabindex', 0);

        if (vm.color && vm.color.hue) {
            vm.angle = vm.color.hue;
            _updateColoredElements(vm.color.hue);
        } else {
            vm.angle = 0;
        }
    }

    function $onChanges() {
        if (changeObj.color) {
            // on angular > 1.5.3 $onChanges is triggered once before $onInit and then again after $onInit
            if (colorSel && ripple) {
                vm.angle = vm.color.hue;
                _updateColoredElements(vm.color.hue);
            }
        }
    }

    function $onDestroy() {
        wrapper.removeEventListener('keypress', _togglePalleteOnEnter);
        colorSel.removeEventListener('animationend', _onColorSelAnimationEnd);
        knob.removeEventListener('transitionend', _onKnobTransitionEnd);
        ripple.removeEventListener('animationend', _onRippleAnimationEnd);
        palette.removeEventListener('transitionend', _onPaletteTransitionEnd);

        // clear circular child DOM node references to allow GC to collect them
        knob     = null; rotator = null;
        colorSel = null; ripple = null;
        palette  = null; wrapper = null;

        ColorPickerService.unsubscribe();
    }

    function _togglePalleteOnEnter(ev) {
        if (ColorPickerService.isKey.enter(ev.key)) {
            onColorSelClick();
        }
    }

    function _updateColoredElements(angle) {
        var color = '';

        if (vm.color) {
            vm.color.hue = angle;
            color = 'hsla(' + vm.color.hue + ', ' + vm.color.saturation + '%, ' + vm.color.luminosity + '%, ' + vm.color.alpha + ')';
            vm.colorModel = vm.color;
        } else {
            color = 'hsla(' + angle + ', 100%, 50%, 1)';
            vm.colorModel = { hue: angle, saturation: 100, luminosity: 50, alpha: 1 };
        }

        colorSel.style.backgroundColor = color;
        ripple.style.borderColor = color;
    }

    function _onColorSelAnimationEnd() {
        if (vm.disabled) {
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
            if (!vm.disabled) {
                palette.classList.add('blur-palette-out');
                palette.classList.remove('blur-palette-in');
            } else {
                vm.disabled = false;
                wrapper.classList.remove('disabled');
                ColorPickerService.publish('shown', vm.colorModel);
            }
        }
    }

    function _onRippleAnimationEnd() {
        ripple.classList.remove('color-shadow-animate');
    }

    function _onPaletteTransitionEnd(ev) {
        // 'transitionend' fires for every transitioned property
        if (ev.propertyName === 'transform') {
            if (vm.disabled) {
                knob.classList.add('zoom-knob-in');
                knob.classList.remove('zoom-knob-out');
            } else {
                vm.disabled = true;
                wrapper.classList.add('disabled');
                ColorPickerService.publish('hidden', vm.colorModel);
            }
        }
    }
}
