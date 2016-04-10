(function (window, angular, undefined) {

  "use strict";

  function ReturnNeedModalController($scope, $uibModalInstance, need) {
    $scope.need = need;

    $scope.ok = function ok() {
      $uibModalInstance.close(need);
    };

    $scope.cancel = function cancel() {
      $uibModalInstance.dismiss("cancel");
    };
  }

  angular.module("safefamilies")
    .controller("ReturnNeedModalController", ["$scope", "$uibModalInstance", "need", ReturnNeedModalController]);

})(window, window.angular);