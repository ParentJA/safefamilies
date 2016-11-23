(function (window, angular, undefined) {

  "use strict";

  function ChangePasswordController($scope, $state, changePasswordService) {
    $scope.error = {};
    $scope.form = "";
    $scope.oldPassword = null;
    $scope.newPassword = null;
    $scope.newPasswordAgain = null;

    $scope.hasError = function hasError() {
      return !_.isEmpty($scope.error);
    };

    $scope.onSubmit = function onSubmit() {
      changePasswordService($scope.oldPassword, $scope.newPassword).then(function () {
        $state.go("app.profile.detail");
      }, function (response) {
        $scope.error = response;
        $scope.oldPassword = null;
        $scope.newPassword = null;
        $scope.newPasswordAgain = null;
      });
    };

    $scope.passwordsMatch = function passwordsMatch() {
      return (!_.isEmpty($scope.newPassword) && $scope.newPassword === $scope.newPasswordAgain);
    };
  }

  angular.module("safefamilies")
    .controller("ChangePasswordController", ["$scope", "$state", "changePasswordService", ChangePasswordController]);

})(window, window.angular);