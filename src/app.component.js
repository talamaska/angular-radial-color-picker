(function() {
    'use strict';

    angular
        .module('app')
        .component('app', {
            controller: AppController,
            templateUrl: 'src/app.component.html'
        });

    /* @ngInject */
    function AppController($rootScope, $scope, $mdDialog) {
        var vm = this;

        vm.color = { hue: 333, saturation: 100, luminosity: 50, alpha: 1 };
        vm.isNotOpened = true;

        vm.showPicker = showPicker;
        vm.cancelDialog = cancelDialog;

        Prism.highlightAll();

        function cancelDialog(color) {
            $mdDialog.hide();
        }

        function showPicker($event) {
            vm.isNotOpened = false;
            $mdDialog.show({
                templateUrl: 'color-picker-dialog',
                targetEvent: $event,
                clickOutsideToClose: true,
                fullscreen: true,
                locals: {
                    initialColor: angular.copy(vm.color),
                },
                bindToController: true,
                controller: function($mdDialog) {
                    this.closeDialog = function() {
                        $mdDialog.hide();
                    }
                },
                controllerAs: 'vm',
            });
        }

        $rootScope.$on('color-picker.hide', function(ev, color) {
            vm.color = color;
        });

        $rootScope.$on('color-picker.hidden', function(ev, color) {
            $mdDialog.hide();
        });
    }
})();
