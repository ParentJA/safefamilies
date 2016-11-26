(function (window, angular, undefined) {

  'use strict';

  function ProfileDetailController(userProfile) {
    var vm = this;
    
    vm.selectedDetail = 'name';
    vm.models = {
      full_name: userProfile.getFullName(),
      photo: userProfile.getPhoto(),
      full_address: userProfile.getFullAddress(),
      phone_number: userProfile.getPhoneNumber(),
      email: userProfile.getEmail()
    };

    vm.setSelectedDetail = function setSelectedDetail(detail) {
      vm.selectedDetail = detail;
    };
  }

  angular.module('safefamilies')
    .controller('ProfileDetailController', ['userProfile', ProfileDetailController]);

})(window, window.angular);