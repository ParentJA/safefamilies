(function (window, angular, undefined) {

  'use strict';

  function SignUpController($state, signUpService) {
    var vm = this;
    
    vm.email = null;
    vm.error = {};
    vm.form = '';
    vm.password = null;
    vm.passwordAgain = null;
    vm.username = null;

    vm.hasError = function hasError() {
      return !_.isEmpty(vm.error);
    };

    vm.onSubmit = function onSubmit() {
      signUpService(vm.username, vm.email, vm.password).then(function () {
        $state.go('app.dashboard');
      }, function (response) {
        vm.error = response;
        vm.password = null;
        vm.passwordAgain = null;
      });
    };

    vm.passwordsMatch = function passwordsMatch() {
      return (!_.isEmpty(vm.password) && vm.password === vm.passwordAgain);
    };
  }

  angular.module('safefamilies')
    .controller('SignUpController', ['$state', 'signUpService', SignUpController]);

})(window, window.angular);