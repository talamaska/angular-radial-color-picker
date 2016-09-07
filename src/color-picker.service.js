(function() {
    'use strict';

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
})();
