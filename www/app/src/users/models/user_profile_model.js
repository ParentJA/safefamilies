(function (window, angular, undefined) {

  'use strict';

  function UserProfileModel() {
    var userProfile = {};

    this.getFirstName = function getFirstName() {
      return userProfile.first_name;
    };

    this.getLastName = function getLastName() {
      return userProfile.last_name;
    };

    this.getFullName = function getFullName() {
      return userProfile.first_name + ' ' + userProfile.last_name;
    };

    this.getEmail = function getEmail() {
      return userProfile.email;
    };

    this.getPhoto = function getPhoto() {
      return userProfile.photo;
    };

    this.getAddress1 = function getAddress1() {
      return userProfile.address_1;
    };

    this.getAddress2 = function getAddress2() {
      return userProfile.address_2;
    };

    this.getCity = function getCity() {
      return userProfile.city;
    };

    this.getState = function getState() {
      return userProfile.state;
    };

    this.getZipCode = function getZipCode() {
      return userProfile.zip_code;
    };

    this.getFullAddress = function getFullAddress() {
      if (_.some([userProfile.address_1, userProfile.city, userProfile.state, userProfile.zip_code], _.isEmpty)) {
        return null;
      }

      var address = userProfile.address_1;

      if (userProfile.address_2) {
        address = address + ', ' + userProfile.address_2;
      }

      return address + ', ' + userProfile.city + ', ' + userProfile.state + ' ' + userProfile.zip_code;
    };

    this.getPhoneNumber = function getPhoneNumber() {
      return userProfile.phone_number;
    };

    this.hasUserProfile = function hasUserProfile() {
      return !_.isEmpty(userProfile);
    };

    this.update = function update(data) {
      userProfile = data;
    };
  }

  angular.module('safefamilies')
    .service('UserProfileModel', [UserProfileModel]);

})(window, window.angular);