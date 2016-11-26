(function (window, angular, undefined) {

  'use strict';

  function LandingController(AccountModel) {
    var vm = this;

    vm.hasUser = function hasUser() {
      return AccountModel.hasUser();
    };
  }

  angular.module('safefamilies')
    .controller('LandingController', ['AccountModel', LandingController]);

})(window, window.angular);