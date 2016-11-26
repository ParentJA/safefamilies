(function (window, angular, undefined) {

  'use strict';

  function ProfileEditController($state, saveUserProfile, userProfile) {
    var vm = this;
    
    vm.errorByField = {};
    vm.form = "";
    vm.models = {
      first_name: userProfile.getFirstName(),
      last_name: userProfile.getLastName(),
      address_1: userProfile.getAddress1(),
      address_2: userProfile.getAddress2(),
      city: userProfile.getCity(),
      state: userProfile.getState(),
      zip_code: userProfile.getZipCode(),
      phone_number: userProfile.getPhoneNumber()
    };

    vm.hasErrors = function hasErrors() {
      return !_.isEmpty(vm.errorByField);
    };

    vm.onSubmit = function onSubmit() {
      saveUserProfile(vm.models).then(function () {
        $state.go('app.profile.detail');
      }, function (response) {
        vm.errorByField = response;
      });
    };
  }

  angular.module('safefamilies')
    .controller('ProfileEditController', ['$state', 'saveUserProfile', 'userProfile', ProfileEditController]);

})(window, window.angular);