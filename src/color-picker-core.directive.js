(function() {
    'use strict';

    angular
    .module('color.picker.core', [])
    .directive('colorPicker', colorPicker);

    /* @ngInject */
    function colorPicker(ColorPickerSrv) {
        var directive = {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/shared/directives/color-picker/color-picker-core/color-picker.view.html',
            bindToController: {
                onSelect: '&',
                selectedColor: '=',
                colorDiameter:'='
            },
            scope:{

            },
            controller: Controller,
            controllerAs: 'vm',
            link: linkFunc
        };

        return directive;

        function linkFunc($scope, $element, $attr, $ctrl) {
            console.log('link');

            var color = null;
            var border = 2;
            var navbar = document.querySelector('ion-header-bar');
            var navbarBox = navbar.getBoundingClientRect();
            var navbarHeight = navbarBox.height;
            var dragging = false;
            var diameter = null;
            var knob = $element[0].querySelector('.knob');
            var rotator = $element[0].querySelector('.rotator');
            var colorSel = $element[0].querySelector('.color');
            var colorShadow = $element[0].querySelector('.color-shadow');
            var colorPalete = null;
            var rotCoords = rotator.getBoundingClientRect();
            var radius = rotCoords.width / 2;

            init();

            function init() {
                diameter = $ctrl.colorDiameter ? $ctrl.colorDiameter : $element[0].getBoundingClientRect().width;
                $ctrl.ColorPickerSrv
                .getCanvas(diameter)
                .renderColorCanvas(diameter)
                .then(function() {

                    var src = $ctrl.ColorPickerSrv.getImageData();
                    var img = new Image();
                    img.onload = function() {
                        setInitialColor();
                        $element[0].appendChild(img);
                        colorPalete = $element[0].querySelector('.color-palete');
                        $element[0].addEventListener('animationend', function(ev) {
                            //console.log(ev);
                            if (ev.target.classList.contains('color')) {
                                if (ev.target.classList.contains('zoom-in-color')) {
                                    ev.target.classList.add('final-state-1');
                                    ev.target.classList.remove('zoom-in-color');
                                }

                                if (ev.target.classList.contains('click-color')) {
                                    ev.target.classList.remove('click-color');
                                }
                            }

                            if (ev.target.classList.contains('zoom-in-knob')) {
                                ev.target.classList.add('final-state-1');
                                ev.target.classList.remove('zoom-in-knob');
                            }

                            if (ev.target.classList.contains('rotator')) {
                                ev.target.classList.add('final-state-1');
                                ev.target.classList.remove('blur-zoom-in');
                            }

                            if (ev.target.classList.contains('color-shadow')) {
                                ev.target.classList.remove('color-shadow-animate');
                                exitAnimations();
                            }

                            if (ev.target.classList.contains('color-palete')) {
                                if (ev.target.classList.contains('blur-zoom-in')) {
                                    ev.target.classList.add('final-state-1');
                                    ev.target.classList.remove('blur-zoom-in');
                                    setupBindings();
                                    $ctrl.triggerEvent('color.picker.shown', {});
                                }

                                if (ev.target.classList.contains('blur-zoom-out')) {
                                    console.log('color is chosen');
                                    console.log(color);
                                    $ctrl.onSelect({color: color});
                                    $ctrl.triggerEvent('color.picker.select', color);
                                }
                            }

                        }, false);

                        enterAnimations();
                    };

                    img.classList.add('color-palete');
                    img.src = src;
                });
            }

            function enterAnimations() {
                colorSel.classList.add('zoom-in-color');
                colorPalete.classList.add('blur-zoom-in');
                rotator.classList.add('blur-zoom-in');
                knob.classList.add('zoom-in-knob');
            }

            function exitAnimations() {
                knob.classList.add('zoom-out-knob');
                colorPalete.classList.add('blur-zoom-out');
            }

            function setColor(imgData) {
                colorSel.style.backgroundColor = 'rgb(' + imgData.red + ',' + imgData.green + ',' + imgData.blue + ')';
                colorShadow.style.borderColor =  'rgb(' + imgData.red + ',' + imgData.green + ',' + imgData.blue + ')';
                color = '#';
                color += $ctrl.rgbToHex(imgData.red, imgData.green, imgData.blue);

                $ctrl.publishSelectedColor(color);
                $scope.$apply();
            }

            function setInitialColor(cb) {
                var x = diameter / 2;
                var thickness = $ctrl.ColorPickerSrv.getCanvasThickness();
                var y = thickness / 2;
                var imgData = $ctrl.ColorPickerSrv.getColor(x, y);
                setColor(imgData);
            }

            function updateColor(ev) {
                var point = {
                    x: ev.touches[0].clientX - $element[0].offsetLeft - (rotCoords.width / 2),
                    y: ((ev.touches[0].clientY - $element[0].offsetTop) * -1) + (rotCoords.height / 2) + navbarHeight
                };
                var quadrant = $ctrl.calculateQuadrant(point);
                var rotation = $ctrl.determineCSSRotationAngle(point, quadrant);

                rotator.style.transform = 'rotate(' + rotation + 'deg)';
                var coord = $ctrl.normalizeCoordinates(rotation, radius, border);

                var imgData = $ctrl.ColorPickerSrv.getColor(coord.x, coord.y);
                setColor(imgData);
            }

            function setupBindings() {

                colorSel.addEventListener('touchstart', function(ev) {
                    ev.target.classList.add('click-color');
                    var colorShadow = $element[0].querySelector('.color-shadow');
                    colorShadow.classList.add('color-shadow-animate');
                });

                knob.addEventListener('touchstart', function(ev) {
                    dragging = true;
                    ev.target.classList.add('dragging');
                    requestAnimationFrame(function() {
                        updateColor(ev);
                    });
                });

                knob.addEventListener('touchmove', function(ev) {
                    if (dragging) {
                        requestAnimationFrame(function() {
                            updateColor(ev);
                        });
                    }
                });

                knob.addEventListener('touchend', function(ev) {
                    dragging = false;
                    ev.target.classList.remove('dragging');
                });

                knob.addEventListener('touchcancel', function(ev) {
                    dragging = false;
                    ev.target.classList.remove('dragging');
                });
            }

        }
    }

    /* @ngInject */
    function Controller($scope, $element, ColorPickerSrv) {
        console.log('controller');
        this.ColorPickerSrv = ColorPickerSrv;
        this.$element = $element;
        this.$scope = $scope;
        this.Cache = {
            sin90:  Math.sin(270 * Math.PI / 180),
            sin180: Math.sin(180 * Math.PI / 180),
            sin270: Math.sin(90 * Math.PI / 180),
            cos90:  Math.cos(270 * Math.PI / 180),
            cos180: Math.cos(180 * Math.PI / 180),
            cos270: Math.cos(90 * Math.PI / 180)
        };

        this.Quadrant = {
            I:   'q1',
            II:  'q2',
            III: 'q3',
            IV:  'q4'
        };
    }

    Controller.prototype.triggerEvent = function(eventName, data) {
        this.$scope.$emit(eventName, data);
    };

    Controller.prototype.publishSelectedColor = function(color) {
        this.selectedColor = color;
    };

    Controller.prototype.normalizeCoordinates = function(rotation, radius, border) {
        var alphaRad = ((90 - rotation) * Math.PI) / 180;

        return {
            x: parseInt((Math.cos(alphaRad) * (radius - border)) + radius),
            y: parseInt(radius - (Math.sin(alphaRad) * (radius - border)))
        };
    };

    Controller.prototype.calculateQuadrant = function(point) {
        var that = this;
        if (point.x > 0) {
            if (point.y > 0) {
                return that.Quadrant.I;
            } else {
                return that.Quadrant.IV;
            }
        } else {
            if (point.y > 0) {
                return that.Quadrant.II;
            } else {
                return that.Quadrant.III;
            }
        }
    };

    /**
    * Calculates the distance between two points.
    *
    * This variant expects separate x/y values for each point. If you already have
    * the points as array or object use the corresponding methods.
    *
    * @param {number} x1 The X value of the first point.
    * @param {number} y1 The Y value of the first point.
    * @param {number} x2 The X value of the second point.
    * @param {number} y2 The Y value of the second point.
    * @return {number} The distance between the two points.
    */
    Controller.prototype.distanceOfSegmentByXYValues = function(x1, y1, x2, y2) {
        return Math.sqrt(((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)));
    };

    Controller.prototype.determineCSSRotationAngle = function(point, quadrant) {
        var cx = point.x;
        var cy = point.y;
        var add = 0;
        var that = this;

        switch (quadrant) {
            case that.Quadrant.II:
                add = 270;
                cx = ((point.x * that.Cache.cos90) - (point.y * that.Cache.sin90));
                cy = ((point.x * that.Cache.sin90) + (point.y * that.Cache.cos90));
            break;
            case that.Quadrant.III:
                add = 180;
                cx = ((point.x * that.Cache.cos180) - (point.y * that.Cache.sin180));
                cy = ((point.x * that.Cache.sin180) + (point.y * that.Cache.cos180));
            break;
            case that.Quadrant.IV:
                add = 90;
                cx = ((point.x * that.Cache.cos270) - (point.y * that.Cache.sin270));
                cy = ((point.x * that.Cache.sin270) + (point.y * that.Cache.cos270));
            break;
        }

        var rotation = Math.atan((that.distanceOfSegmentByXYValues(0, cy, cx, cy)) / (that.distanceOfSegmentByXYValues(0, cy, 0, 0)));

        return (rotation * (180 / Math.PI)) + add;
    };

    Controller.prototype.rgbToHex = function(r,g,b) {
        var bin = r << 16 | g << 8 | b;
        return (function(h) {
            return new Array(7 - h.length).join('0') + h;
        })(bin.toString(16).toUpperCase());
    };

})();
