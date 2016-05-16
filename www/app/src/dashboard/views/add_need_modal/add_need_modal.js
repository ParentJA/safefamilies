(function (window, angular, undefined) {

  "use strict";

  function AddNeedModalController($scope, $uibModalInstance) {
    $scope.models = {
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

    $scope.part1 = null;
    $scope.part2 = null;
    $scope.part3 = null;

    $scope.currentPart = 1;

    $scope.goToPart = function goToPart(part) {
      $scope.currentPart = part;
    };

    $scope.ok = function ok() {
      $uibModalInstance.close($scope.models);
    };

    $scope.cancel = function cancel() {
      $uibModalInstance.dismiss("cancel");
    };
  }

  angular.module("safefamilies")
    .controller("AddNeedModalController", ["$scope", "$uibModalInstance", AddNeedModalController]);

})(window, window.angular);