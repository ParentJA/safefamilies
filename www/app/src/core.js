(function (window, angular, undefined) {

  "use strict";

  function HttpConfig($httpProvider) {
    $httpProvider.defaults.xsrfHeaderName = "X-CSRFToken";
    $httpProvider.defaults.xsrfCookieName = "csrftoken";
  }

  function CoreRouterConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state("app", {
        url: "/app",
        template: "<div ui-view></div>",
        data: {
          loginRequired: true
        },
        abstract: true
      })
      .state("app.dashboard", {
        url: "/dashboard",
        templateUrl: "global/views/dashboard/dashboard.html",
        data: {
          loginRequired: true
        },
        resolve: {
          userProfile: function (UserProfileModel, loadUserProfile) {
            if (!UserProfileModel.hasUserProfile()) {
              return loadUserProfile();
            }

            return UserProfileModel;
          }
        },
        controller: "DashboardController"
      });

    //Default state...
    $urlRouterProvider.otherwise("/app/dashboard");
  }

  function CoreRunner($rootScope, $state, AccountModel, navigationService) {
    $rootScope.$state = $state;
    $rootScope.$on("$stateChangeStart", function (event, toState) {
      // Close navigation.
      navigationService.closeNavigation();

      // Check authentication.
      if (toState.data.loginRequired && !AccountModel.hasUser()) {
        event.preventDefault();
        $state.go("log_in");
      }
    });
  }

  function MainController($scope, $state, AccountModel, logOutService, navigationService) {
    $scope.navigationService = navigationService;

    $scope.hasUser = function hasUser() {
      return AccountModel.hasUser();
    };

    $scope.logOut = function logOut() {
      logOutService().finally(function () {
        $state.go("log_in");
      });
    };
  }

  angular.module("templates", []);

  angular.module("safefamilies", ["templates", "example-accounts", "ui.bootstrap", "ui.router"])
    .constant("BASE_URL", "/api/v1/")
    .config(["$httpProvider", HttpConfig])
    .config(["$stateProvider", "$urlRouterProvider", CoreRouterConfig])
    .run(["$rootScope", "$state", "AccountModel", "navigationService", CoreRunner])
    .controller("MainController", [
      "$scope", "$state", "AccountModel", "logOutService", "navigationService", MainController
    ]);

})(window, window.angular);