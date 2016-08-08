(function (window, angular, undefined) {

  "use strict";

  function AssignNeedModalController($scope, $uibModalInstance, need, userService) {
    $scope.need = need;

    $scope.getFullName = function getFullName(user) {
      return userService.getFullName(user);
    };

    $scope.getFullAddress = function getFullAddress(user) {
      return userService.getFullAddress(user);
    };

    $scope.getEmail = function getEmail(user) {
      return userService.getEmail(user);
    };

    this.getPhoneNumber = function getPhoneNumber(user) {
      return userService.getPhoneNumber(user);
    };

    $scope.ok = function ok() {
      $uibModalInstance.close(need);
    };

    $scope.cancel = function cancel() {
      $uibModalInstance.dismiss("cancel");
    };
  }

  angular.module("safefamilies")
    .controller("AssignNeedModalController", [
      "$scope", "$uibModalInstance", "need", "userService", AssignNeedModalController]);

})(window, window.angular);