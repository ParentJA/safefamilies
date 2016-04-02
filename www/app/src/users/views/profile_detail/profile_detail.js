(function (window, angular, undefined) {

  "use strict";

  function ProfileDetailController($scope, userProfile) {
    $scope.selectedDetail = "name";
    $scope.models = {
      full_name: userProfile.getFullName(),
      photo: userProfile.getPhoto(),
      full_address: userProfile.getFullAddress(),
      phone_number: userProfile.getPhoneNumber(),
      email: userProfile.getEmail()
    };

    $scope.setSelectedDetail = function setSelectedDetail(detail) {
      $scope.selectedDetail = detail;
    };
  }

  angular.module("safefamilies")
    .controller("ProfileDetailController", ["$scope", "userProfile", ProfileDetailController]);

})(window, window.angular);