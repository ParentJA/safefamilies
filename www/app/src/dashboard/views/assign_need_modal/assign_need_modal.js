(function (window, angular, undefined) {

  "use strict";

  function AssignNeedModalController($scope, $uibModalInstance, need) {
    $scope.need = need;

    $scope.ok = function ok() {
      $uibModalInstance.close(need);
    };

    $scope.cancel = function cancel() {
      $uibModalInstance.dismiss("cancel");
    };
  }

  angular.module("safefamilies")
    .controller("AssignNeedModalController", ["$scope", "$uibModalInstance", "need", AssignNeedModalController]);

})(window, window.angular);