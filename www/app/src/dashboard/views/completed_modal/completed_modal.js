(function (window, angular, undefined) {

  "use strict";

  function CompletedModalController($scope, $uibModalInstance, event, need) {
    $scope.event = event;
    $scope.need = need;

    $scope.ok = function ok() {
      $uibModalInstance.close({event: $scope.event, need: $scope.need});
    };

    $scope.cancel = function cancel() {
      $uibModalInstance.dismiss(event);
    };
  }

  angular.module("safefamilies")
    .controller("CompletedModalController", ["$scope", "$uibModalInstance", "event", "need", CompletedModalController]);

})(window, window.angular);