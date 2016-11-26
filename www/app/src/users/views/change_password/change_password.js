(function (window, angular, undefined) {

  'use strict';

  function ChangePasswordController($state, changePasswordService) {
    var vm = this;
    
    vm.error = {};
    vm.form = "";
    vm.oldPassword = null;
    vm.newPassword = null;
    vm.newPasswordAgain = null;

    vm.hasError = function hasError() {
      return !_.isEmpty(vm.error);
    };

    vm.onSubmit = function onSubmit() {
      changePasswordService(vm.oldPassword, vm.newPassword).then(function () {
        $state.go('app.profile.detail');
      }, function (response) {
        vm.error = response;
        vm.oldPassword = null;
        vm.newPassword = null;
        vm.newPasswordAgain = null;
      });
    };

    vm.passwordsMatch = function passwordsMatch() {
      return (!_.isEmpty(vm.newPassword) && vm.newPassword === vm.newPasswordAgain);
    };
  }

  angular.module('safefamilies')
    .controller('ChangePasswordController', ['$state', 'changePasswordService', ChangePasswordController]);

})(window, window.angular);