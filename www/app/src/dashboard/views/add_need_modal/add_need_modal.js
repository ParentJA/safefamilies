(function (window, angular, undefined) {

  'use strict';

  function AddNeedModalController($uibModalInstance) {
    var vm = this;

    vm.models = {
      // Recipient.
      part1: {
        first_name: null,
        last_name: null,
        phone_number: null,
        email: null,
        address_1: null,
        address_2: null,
        city: null,
        state: null,
        zip_code: null
      },

      // Need.
      part2: {
        name: null,
        description: null
      },

      // Recipient need.
      part3: {
        quantity: null,
        due_date: null
      }
    };

    vm.part1 = null;
    vm.part2 = null;
    vm.part3 = null;

    vm.currentPart = 1;

    vm.goToPart = function goToPart(part) {
      vm.currentPart = part;
    };

    vm.ok = function ok() {
      $uibModalInstance.close(vm.models);
    };

    vm.cancel = function cancel() {
      $uibModalInstance.dismiss('cancel');
    };
  }

  angular.module('safefamilies')
    .controller('AddNeedModalController', ['$uibModalInstance', AddNeedModalController]);

})(window, window.angular);