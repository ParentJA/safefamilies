(function (window, angular, undefined) {

  "use strict";

  function AuthorizationRouterConfig($stateProvider) {
    $stateProvider.state("log_in", {
      url: "/log_in",
      templateUrl: "users/views/log_in/log_in.html",
      data: {
        loginRequired: false
      },
      controller: "LogInController"
    });
  }

  angular.module("safefamilies")
    .config(["$stateProvider", AuthorizationRouterConfig]);

})(window, window.angular);