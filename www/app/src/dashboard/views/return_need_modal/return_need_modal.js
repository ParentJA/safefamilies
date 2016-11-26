(function (window, angular, undefined) {

  'use strict';

  function ReturnNeedModalController($uibModalInstance, need) {
    var vm = this;

    vm.need = need;

    vm.ok = function ok() {
      $uibModalInstance.close(need);
    };

    vm.cancel = function cancel() {
      $uibModalInstance.dismiss('cancel');
    };
  }

  angular.module('safefamilies')
    .controller('ReturnNeedModalController', ['$uibModalInstance', 'need', ReturnNeedModalController]);

})(window, window.angular);