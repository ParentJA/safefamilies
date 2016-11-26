(function (window, angular, undefined) {

  'use strict';

  function AssignNeedModalController($uibModalInstance, need, userService) {
    var vm = this;

    vm.need = need;

    vm.getFullName = function getFullName(user) {
      return userService.getFullName(user);
    };

    vm.getFullAddress = function getFullAddress(user) {
      return userService.getFullAddress(user);
    };

    vm.getEmail = function getEmail(user) {
      return userService.getEmail(user);
    };

    vm.getPhoneNumber = function getPhoneNumber(user) {
      return userService.getPhoneNumber(user);
    };

    vm.ok = function ok() {
      $uibModalInstance.close(need);
    };

    vm.cancel = function cancel() {
      $uibModalInstance.dismiss('cancel');
    };
  }

  angular.module('safefamilies')
    .controller('AssignNeedModalController', ['$uibModalInstance', 'need', 'userService', AssignNeedModalController]);

})(window, window.angular);