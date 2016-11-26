(function (window, angular, undefined) {

  'use strict';

  function LogInController($state, logInService) {
    var vm = this;
    
    vm.error = {};
    vm.form = "";
    vm.password = null;
    vm.username = null;

    vm.hasError = function hasError() {
      return !_.isEmpty(vm.error);
    };

    vm.onSubmit = function onSubmit() {
      logInService(vm.username, vm.password).then(function () {
        $state.go('app.dashboard');
      }, function (response) {
        vm.error = response;
        vm.password = null;
      });
    };
  }

  angular.module('safefamilies')
    .controller('LogInController', ['$state', 'logInService', LogInController]);

})(window, window.angular);