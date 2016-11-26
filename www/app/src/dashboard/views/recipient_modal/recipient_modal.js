(function (window, angular, undefined) {

  'use strict';

  function RecipientModalController($uibModalInstance, need, userService) {
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

    vm.cancel = function cancel() {
      $uibModalInstance.dismiss('cancel');
    };
  }

  angular.module('safefamilies')
    .controller('RecipientModalController', ['$uibModalInstance', 'need', 'userService', RecipientModalController]);

})(window, window.angular);