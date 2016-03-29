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
(function (window, angular, undefined) {

  "use strict";

  function navigationService() {
    var navigationOpen = false;

    var service = {
      closeNavigation: function closeNavigation() {
        navigationOpen = false;
      },
      isNavigationOpen: function isNavigationOpen() {
        return navigationOpen;
      },
      openNavigation: function openNavigation() {
        navigationOpen = true;
      },
      toggleNavigation: function toggleNavigation() {
        navigationOpen = !navigationOpen;
      }
    };

    return service;
  }

  angular.module("safefamilies")
    .service("navigationService", [navigationService]);

})(window, window.angular);
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
(function (window, angular, undefined) {

  "use strict";

  function loadUserProfile($http, $q, BASE_URL, UserProfileModel) {

    return function () {
      var deferred = $q.defer();

      $http.get(BASE_URL + "users/user_profile/").then(function (response) {
        UserProfileModel.update(response.data);
        deferred.resolve(UserProfileModel);
      }, function (response) {
        console.error("Failed to load user profile.");
        deferred.reject(response.data);
      });

      return deferred.promise;
    };

  }

  angular.module("safefamilies")
    .service("loadUserProfile", ["$http", "$q", "BASE_URL", "UserProfileModel", loadUserProfile]);

})(window, window.angular);
(function (window, angular, undefined) {

  "use strict";

  function DashboardController($scope, userProfile) {
    $scope.models = {
      user: {
        photo: userProfile.getPhoto(),
        fullName: userProfile.getFullName()
      }
    };
  }

  angular.module("safefamilies")
    .controller("DashboardController", ["$scope", "userProfile", DashboardController]);

})(window, window.angular);
(function (window, angular, undefined) {

  "use strict";

  function LogInController($scope, $state, logInService) {
    $scope.error = {};
    $scope.form = "";
    $scope.password = null;
    $scope.username = null;

    $scope.hasError = function hasError() {
      return !_.isEmpty($scope.error);
    };

    $scope.onSubmit = function onSubmit() {
      logInService($scope.username, $scope.password).then(function () {
        $state.go("app.dashboard");
      }, function (response) {
        $scope.error = response.data;
        $scope.password = null;
      });
    };
  }

  angular.module("safefamilies")
    .controller("LogInController", ["$scope", "$state", "logInService", LogInController]);

})(window, window.angular);
angular.module("templates").run(["$templateCache", function($templateCache) {$templateCache.put("global/views/dashboard/dashboard.html","<div class=\"mbl\">\n  <img class=\"img-circle center-block\" ng-src=\"{{ models.user.photo }}\" width=\"80\">\n  <h4 class=\"text-center\">{{ models.user.fullName }}</h4>\n</div>");
$templateCache.put("users/views/log_in/log_in.html","<h4 class=\"text-center mbl\">Log in</h4>\n<form name=\"form\" novalidate ng-submit=\"onSubmit()\">\n  <div class=\"alert alert-danger\" ng-if=\"hasError()\">\n    <strong>{{ error.status }}</strong> {{ error.message }}\n  </div>\n  <div class=\"form-group\">\n    <label for=\"username\">Username:</label>\n    <input id=\"username\" class=\"form-control\" type=\"text\" ng-model=\"username\" required>\n  </div>\n  <div class=\"form-group\">\n    <label for=\"password\">Password:</label>\n    <input id=\"password\" class=\"form-control\" type=\"password\" ng-model=\"password\" required>\n  </div>\n  <button class=\"btn btn-primary btn-block\" type=\"submit\" ng-disabled=\"form.$invalid\">Log in\n  </button>\n</form>\n\n<!-- TODO: Don\'t have an account? Sign up! -->");}]);