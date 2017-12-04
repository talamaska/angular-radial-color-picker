(function() {
    'use strict';

    angular.module('app')
        .config(function($mdThemingProvider, $compileProvider, $mdInkRippleProvider) {
            $mdThemingProvider.theme('default')
              .primaryPalette('pink')
              .accentPalette('indigo');

            $compileProvider.debugInfoEnabled(false);
            $mdInkRippleProvider.disableInkRipple();
        });
})();
