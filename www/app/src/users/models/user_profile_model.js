(function (window, angular, undefined) {

  "use strict";

  function UserProfileModel() {
    var userProfile = {};

    this.getFullName = function getFullName() {
      return userProfile.first_name + " " + userProfile.last_name;
    };

    this.getPhoto = function getPhoto() {
      return userProfile.photo;
    };

    this.hasUserProfile = function hasUserProfile() {
      return !_.isEmpty(userProfile);
    };

    this.update = function update(data) {
      userProfile = data;
    };
  }

  angular.module("safefamilies")
    .service("UserProfileModel", [UserProfileModel]);

})(window, window.angular);