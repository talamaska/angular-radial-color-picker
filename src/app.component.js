(function() {
    'use strict';

    angular
        .module('app')
        .component('app', {
            bindings: {},
            controller: AppController,
            templateUrl: 'src/app.component.html'
        });

    /* @ngInject */
    function AppController($rootScope, $scope, $mdDialog) {
        var vm = this;

        vm.selectedColor = 'rgb(233, 30, 99)';
        vm.initialColor = { red: 233, green: 30, blue: 99, alpha: 1 };
        vm.isNotOpened = true;

        vm.showPicker = showPicker;
        vm.cancelDialog = cancelDialog;
        vm.confirmDialog = confirmDialog;

        Prism.highlightAll();

        function cancelDialog(color) {
            $mdDialog.cancel();
        }

        function confirmDialog(color) {
            $rootScope.$broadcast('color-picker.close');
        }

        function showPicker($event) {
            vm.isNotOpened = false;
            $mdDialog.show({
              scope: $scope,
              preserveScope: true,
              template:
                  '<md-dialog class="color-picker-dialog">' +
                  '  <md-toolbar class="md-accent md-hue-2">' +
                  '    <div class="md-toolbar-tools">' +
                  '      <h2>Pick a Color</h2>' +
                  '      <span flex></span>' +
                  '      <md-button class="md-icon-button" ng-click="$ctrl.cancelDialog()">' +
                  '        <md-icon>close</md-icon>' +
                  '      </md-button>' +
                  '    </div>' +
                  '  </md-toolbar>' +
                  '  <md-dialog-content class="md-padding">' +
                  '    <div class="dialog-content-wrapper">' +
                  '      <color-picker ng-model="$ctrl.initialColor"></color-picker>' +
                  '      <div class="hint">' +
                  '        <p><strong>Hint:</strong> drag the wheel to change the color.</p>' +
                  '        <p>Save your selection by clicking the color circle in the middle</p>' +
                  '      </div>' +
                  '    </div>' +
                  '  </md-dialog-content>' +
                  '</md-dialog>',
              targetEvent: $event,
              clickOutsideToClose: true,
              fullscreen: true,
              locals: {
                initialColor: vm.initialColor,
              }
            });
        }

        $rootScope.$on('color-picker.hide', function(ev, color) {
            vm.initialColor = {
                red: color.rgba.red,
                green: color.rgba.green,
                blue: color.rgba.blue
            };
            vm.selectedColor = 'hsla(' +
                color.hsla.hue + ', ' +
                color.hsla.saturation + '%, ' +
                color.hsla.luminosity + '%, ' +
                color.hsla.alpha + ')';
        });

        $rootScope.$on('color-picker.hidden', function(ev, color) {
            $mdDialog.hide();
        });
    }
})();
