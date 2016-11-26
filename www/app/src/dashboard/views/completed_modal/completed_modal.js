(function (window, angular, undefined) {

  'use strict';

  function CompletedModalController($scope, $uibModalInstance, event, need) {
    var vm = this;

    vm.ok = function ok() {
      $uibModalInstance.close({event: event, need: need});
    };

    vm.cancel = function cancel() {
      $uibModalInstance.dismiss(event);
    };
  }

  angular.module('safefamilies')
    .controller('CompletedModalController', ['$scope', '$uibModalInstance', 'event', 'need', CompletedModalController]);

})(window, window.angular);