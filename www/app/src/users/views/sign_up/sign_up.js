(function (window, angular, undefined) {

  "use strict";

  function SignUpController($scope, $state, signUpService) {
    $scope.email = null;
    $scope.error = {};
    $scope.form = "";
    $scope.password = null;
    $scope.passwordAgain = null;
    $scope.username = null;

    $scope.hasError = function hasError() {
      return !_.isEmpty($scope.error);
    };

    $scope.onSubmit = function onSubmit() {
      signUpService($scope.username, $scope.email, $scope.password).then(function () {
        $state.go("app.dashboard");
      }, function (response) {
        $scope.error = response.data;
        $scope.password = null;
        $scope.passwordAgain = null;
      });
    };

    $scope.passwordsMatch = function passwordsMatch() {
      return (!_.isEmpty($scope.password) && $scope.password === $scope.passwordAgain);
    };
  }

  angular.module("safefamilies")
    .controller("SignUpController", ["$scope", "$state", "signUpService", SignUpController]);

})(window, window.angular);