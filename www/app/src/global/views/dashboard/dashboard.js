(function (window, angular, undefined) {

  "use strict";

  function DashboardController($scope, userProfile) {
    $scope.models = {
      user: {
        photo: userProfile.getPhoto(),
        fullName: userProfile.getFullName()
      }
    };
  }

  angular.module("safefamilies")
    .controller("DashboardController", ["$scope", "userProfile", DashboardController]);

})(window, window.angular);