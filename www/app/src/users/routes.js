(function (window, angular, undefined) {

  "use strict";

  function AuthorizationRouterConfig($stateProvider) {
    $stateProvider
      .state("log_in", {
        url: "/log_in",
        templateUrl: "users/views/log_in/log_in.html",
        data: {
          loginRequired: false
        },
        controller: "LogInController"
      })
      .state("sign_up", {
        url: "/sign_up",
        templateUrl: "users/views/sign_up/sign_up.html",
        data: {
          loginRequired: false
        },
        controller: "SignUpController"
      });
  }

  angular.module("safefamilies")
    .config(["$stateProvider", AuthorizationRouterConfig]);

})(window, window.angular);