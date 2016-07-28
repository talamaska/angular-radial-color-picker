(function() {
    'use strict';

    angular
        .module('color.picker.service', [])
        .service('ColorPickerSrv', ColorPickerSrv);

    /* @ngInject */
    function ColorPickerSrv($q) {
        var instance = null;
        this.canvas = null;
        this.imageData = null;
        this.ctx = null;
        this.getColor = getColor;
        this.getCanvas = getCanvas;
        this.getImageData = getImageData;
        this.getCanvasData  = getCanvasData;
        this.renderColorCanvas = renderColorCanvas;
        this.coefficient = 0.77;
        this.getCanvasThickness = getCanvasThickness;
        this.hasColorMap = false;
        var that = this;

        function getCanvasThickness() {
            return that.diameter / 2 - (that.diameter / 2) * that.coefficient;
        }

        function getImageData() {
            if (that.imageData !== null) {
                console.log('we have the image data');
                return that.imageData;
            } else {
                console.log('we dont have the image data, get it');
                return getCanvasData();
            }
        }

        function getCanvasData() {
            console.log('get the image data');
            that.imageData = that.canvas.toDataURL();
            return that.imageData;
        }

        function getCanvas(diameter) {
            if (that.canvas !== null) {
                console.log('we have canvas, return the instance');
                return that;
            } else {
                console.log('we dont have canvas, init');
                initCanvas(diameter);
                console.log('return instance');
                return that;
            }
        }

        function getColor(x, y) {
            var color = that.ctx.getImageData(x, y, 1, 1).data;
            return {
                red: color[0],
                green: color[1],
                blue: color[2]
            };
        }

        function initCanvas(diameter) {
            var canvas = document.createElement('canvas');
            canvas.height = diameter;
            canvas.width = diameter;
            that.canvas = canvas;
            that.ctx = canvas.getContext('2d');
            that.ctx.imageSmoothingEnabled = true;
            that.diameter = diameter;
        }

        function getColorMap(diameter) {
            var def = $q.defer();
            if (!that.hasColorMap) {
                renderColorMap(diameter)
                .then(function() {
                    def.resolve();
                });
            }

            def.resolve();
            return def.promise;
        }

        function renderColorMap(diameter) {
            var def = $q.defer();
            var radius = diameter / 2;
            var toRad = (2 * Math.PI) / 360;
            var step = 0.2;
            var aliasing = 1;

            var ctx = that.ctx;
            ctx.clearRect(0, 0, diameter, diameter);
            for (var i = 0; i < 360; i += step) {
                var sRad = (i - aliasing) * toRad;
                var eRad = (i + step) * toRad;
                ctx.beginPath();
                ctx.arc(radius, radius, radius / 2, sRad, eRad, false);
                ctx.strokeStyle = 'hsl(' + i + ', 100%, 50%)';
                ctx.lineWidth = radius;
                ctx.closePath();
                ctx.stroke();

                //console.log(i);
            }

            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.beginPath();
            ctx.arc(radius, radius, radius * that.coefficient, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();

            //console.log('internal circle');
            ctx.strokeStyle = 'rgb(255, 255, 255)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
            ctx.stroke();

            //console.log('external circle');

            that.hasColorMap = true;
            def.resolve();

            return def.promise;
        }

        function renderColorCanvas(diameter) {
            var def = $q.defer();

            getColorMap(diameter)
            .then(function() {
                def.resolve();
            });

            return def.promise;
        }
    }
})();
