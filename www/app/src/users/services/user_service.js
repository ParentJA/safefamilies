(function (window, angular, undefined) {

  'use strict';

  function userService() {

    this.getFullName = function getFullName(user) {
      return user.first_name + ' ' + user.last_name;
    };

    this.getFullAddress = function getFullAddress(user) {
      if (_.some([user.address_1, user.city, user.state, user.zip_code], _.isEmpty)) {
        return null;
      }

      var address = user.address_1;

      if (user.address_2) {
        address = address + ', ' + user.address_2;
      }

      return address + ', ' + user.city + ', ' + user.state + ' ' + user.zip_code;
    };

    this.getEmail = function getEmail(user) {
      return user.email || 'N/A';
    };

    this.getPhoneNumber = function getPhoneNumber(user) {
      return user.phone_number || 'N/A';
    };

  }

  angular.module('safefamilies')
    .service('userService', [userService]);

})(window, window.angular);