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
          },
          recipientNeeds: function (RecipientNeedResource) {
            return RecipientNeedResource.list();
          },
          commitments: function (CommitmentResource) {
            return CommitmentResource.list();
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
    // Account-based config.
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

    // Users-based config.
    $stateProvider
      .state("app.profile", {
        url: "/profile",
        template: "<div ui-view></div>",
        data: {
          loginRequired: true
        },
        abstract: true
      })
      .state("app.profile.detail", {
        url: "/detail",
        templateUrl: "users/views/profile_detail/profile_detail.html",
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
        controller: "ProfileDetailController"
      })
      .state("app.profile.edit", {
        url: "/edit",
        templateUrl: "users/views/profile_edit/profile_edit.html",
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
        controller: "ProfileEditController"
      });
  }

  angular.module("safefamilies")
    .config(["$stateProvider", AuthorizationRouterConfig]);

})(window, window.angular);
(function (window, angular, undefined) {

  "use strict";

  function Commitment() {
    var commitments = {};

    this.getCommitmentById = function getCommitmentById(id) {
      return commitments[id];
    };

    this.getCommitments = function getCommitments() {
      return commitments;
    };

    this.removeDict = function removeDict(id) {
      delete commitments[id];
    };

    this.updateDict = function updateDict(data) {
      if (!_.isUndefined(data.commitment)) {
        commitments[data.commitment.id] = data.commitment;
      }
    };

    this.updateList = function updateList(data) {
      if (!_.isUndefined(data.commitment)) {
        commitments = _.merge(commitments, _.keyBy(data.commitment, "id"));
      }
    };
  }

  angular.module("safefamilies")
    .constant("CommitmentStatus", {
      ASSIGNED: "A",
      FINISHED: "F"
    })
    .service("Commitment", [Commitment]);

})(window, window.angular);
(function (window, angular, undefined) {

  "use strict";

  function RecipientNeed() {
    var needs = {};
    var recipients = {};
    var recipientNeeds = {};

    function build() {
      _.forEach(recipientNeeds, function (recipientNeed) {
        recipientNeed._recipient = recipients[recipientNeed.recipient];
        recipientNeed._need = needs[recipientNeed.need];
      });
    }

    this.getRecipientNeeds = function getRecipientNeeds() {
      return recipientNeeds;
    };

    this.getRecipientNeedById = function getRecipientNeedById(id) {
      return recipientNeeds[id];
    };

    this.updateDict = function updateDict(data) {
      if (!_.isUndefined(data.need)) {
        needs[data.need.id] = data.need;
      }

      if (!_.isUndefined(data.recipient)) {
        recipients[data.recipient.id] = data.recipient;
      }

      if (!_.isUndefined(data.recipient_need)) {
        recipientNeeds[data.recipient_need.id] = data.recipient_need;
      }

      build();
    };

    this.updateList = function updateList(data) {
      if (!_.isUndefined(data.need)) {
        needs = _.merge(needs, _.keyBy(data.need, "id"));
      }

      if (!_.isUndefined(data.recipient)) {
        recipients = _.merge(recipients, _.keyBy(data.recipient, "id"));
      }

      if (!_.isUndefined(data.recipient_need)) {
        recipientNeeds = _.merge(recipientNeeds, _.keyBy(data.recipient_need, "id"));
      }

      build();
    };
  }

  angular.module("safefamilies")
    .constant("RecipientNeedStatus", {
      PENDING: "PEN",
      RECEIVED: "REC",
      REQUESTED: "REQ"
    })
    .service("RecipientNeed", [RecipientNeed]);

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

  function CommitmentResource($http, $q, BASE_URL, Commitment, RecipientNeed) {
    this.list = function list() {
      var deferred = $q.defer();

      $http.get(BASE_URL + "needs/commitment/").then(function (response) {
        Commitment.updateList(response.data);
        deferred.resolve(Commitment);
      }, function (response) {
        console.error("Failed to get commitments.");
        deferred.reject(response);
      });

      return deferred.promise;
    };

    this.create = function create(commitment) {
      var deferred = $q.defer();

      $http.post(BASE_URL + "needs/commitment/", commitment).then(function (response) {
        Commitment.updateDict(response.data);
        RecipientNeed.updateDict(response.data);
        deferred.resolve(Commitment);
      }, function (response) {
        console.error("Failed to create commitment.");
        deferred.reject(response);
      });

      return deferred.promise;
    };

    this.destroy = function destroy(id) {
      var deferred = $q.defer();

      $http.delete(BASE_URL + "needs/commitment/" + id + "/").then(function (response) {
        Commitment.removeDict(id);
        RecipientNeed.updateDict(response.data);
        deferred.resolve(Commitment);
      }, function (response) {
        console.error("Failed to delete commitment with ID " + id + ".");
        deferred.reject(response);
      });

      return deferred.promise;
    };
  }

  angular.module("safefamilies")
    .service("CommitmentResource", ["$http", "$q", "BASE_URL", "Commitment", "RecipientNeed", CommitmentResource]);

})(window, window.angular);
(function (window, angular, undefined) {

  "use strict";

  function RecipientNeedResource($http, $q, BASE_URL, RecipientNeed) {
    this.list = function list() {
      var deferred = $q.defer();

      $http.get(BASE_URL + "needs/recipient_need/").then(function (response) {
        RecipientNeed.updateList(response.data);
        deferred.resolve(RecipientNeed);
      }, function (response) {
        console.error("Failed to load recipient needs.");
        deferred.reject(response.data);
      });

      return deferred.promise;
    };
  }

  angular.module("safefamilies")
    .service("RecipientNeedResource", ["$http", "$q", "BASE_URL", "RecipientNeed", RecipientNeedResource]);

})(window, window.angular);
(function (window, angular, undefined) {

  "use strict";

  function recipientNeedService(Commitment, CommitmentStatus, RecipientNeed, RecipientNeedStatus) {
    var pendingNeeds = [];
    var receivedNeeds = [];
    var requestedNeeds = [];

    this.getPendingNeeds = function getPendingNeeds() {
      var needs = _.filter(RecipientNeed.getRecipientNeeds(), {status: RecipientNeedStatus.PENDING});
      var commitments = _.filter(Commitment.getCommitments(), {status: CommitmentStatus.ASSIGNED});
      var commitmentsByNeed = _.keyBy(_.values(commitments), "recipient_need");

      _.forEach(needs, function (need) {
        need.hasCommitment = _.has(commitmentsByNeed, need.id);
        need._commitment = need.hasCommitment ? commitmentsByNeed[need.id] : null;
      });

      pendingNeeds = needs;

      return pendingNeeds;
    };

    this.getReceivedNeeds = function getReceivedNeeds() {
      receivedNeeds = _.filter(RecipientNeed.getRecipientNeeds(), {status: RecipientNeedStatus.RECEIVED});
      return receivedNeeds;
    };

    this.getRequestedNeeds = function getRequestedNeeds() {
      requestedNeeds = _.filter(RecipientNeed.getRecipientNeeds(), {status: RecipientNeedStatus.REQUESTED});
      return requestedNeeds;
    };
  }

  angular.module("safefamilies")
    .service("recipientNeedService", [
      "Commitment", "CommitmentStatus", "RecipientNeed", "RecipientNeedStatus", recipientNeedService
    ]);

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

  function saveUserProfile($http, $q, BASE_URL, UserProfileModel) {

    return function (payload) {
      var deferred = $q.defer();

      $http.post(BASE_URL + "users/user_profile/", payload).then(function (response) {
        UserProfileModel.update(response.data);
        deferred.resolve(UserProfileModel);
      }, function (response) {
        console.error("Failed to save user profile.");
        deferred.reject(response.data);
      });

      return deferred.promise;
    };

  }

  angular.module("safefamilies")
    .service("saveUserProfile", ["$http", "$q", "BASE_URL", "UserProfileModel", saveUserProfile]);

})(window, window.angular);
(function (window, angular, undefined) {

  "use strict";

  function UserProfileModel() {
    var userProfile = {};

    this.getFirstName = function getFirstName() {
      return userProfile.first_name;
    };

    this.getLastName = function getLastName() {
      return userProfile.last_name;
    };

    this.getFullName = function getFullName() {
      return userProfile.first_name + " " + userProfile.last_name;
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
      var address = userProfile.address_1;

      if (userProfile.address_2) {
        address = address + ", " + userProfile.address_2;
      }

      return address + ", " + userProfile.city + ", " + userProfile.state + " " + userProfile.zip_code;
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

  angular.module("safefamilies")
    .service("UserProfileModel", [UserProfileModel]);

})(window, window.angular);
(function (window, angular, undefined) {

  "use strict";

  function DashboardController($scope, CommitmentResource, CommitmentStatus, commitments, recipientNeedService, userProfile) {
    $scope.models = {
      commitments: commitments.getCommitments(),
      pendingNeeds: recipientNeedService.getPendingNeeds(),
      receivedNeeds: recipientNeedService.getReceivedNeeds(),
      requestedNeeds: recipientNeedService.getRequestedNeeds(),
      user: {
        photo: userProfile.getPhoto(),
        fullName: userProfile.getFullName()
      }
    };

    function updateNeeds() {
      $scope.models.pendingNeeds = recipientNeedService.getPendingNeeds();
      $scope.models.receivedNeeds = recipientNeedService.getReceivedNeeds();
      $scope.models.requestedNeeds = recipientNeedService.getRequestedNeeds();
    }

    $scope.assignNeed = function assignNeed(need) {
      CommitmentResource.create({
        recipient_need: need.id,
        status: CommitmentStatus.ASSIGNED
      }).then(updateNeeds);
    };

    $scope.returnNeed = function returnNeed(need) {
      CommitmentResource.destroy(need._commitment.id).then(updateNeeds);
    };
  }

  angular.module("safefamilies")
    .controller("DashboardController", [
      "$scope", "CommitmentResource", "CommitmentStatus", "commitments", "recipientNeedService", "userProfile", DashboardController
    ]);

})(window, window.angular);
(function (window, angular, undefined) {

  "use strict";

  function ProfileDetailController($scope, userProfile) {
    $scope.selectedDetail = "name";
    $scope.models = {
      full_name: userProfile.getFullName(),
      photo: userProfile.getPhoto(),
      full_address: userProfile.getFullAddress(),
      phone_number: userProfile.getPhoneNumber(),
      email: userProfile.getEmail()
    };

    $scope.setSelectedDetail = function setSelectedDetail(detail) {
      $scope.selectedDetail = detail;
    };
  }

  angular.module("safefamilies")
    .controller("ProfileDetailController", ["$scope", "userProfile", ProfileDetailController]);

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
        $scope.error = response;
        $scope.password = null;
      });
    };
  }

  angular.module("safefamilies")
    .controller("LogInController", ["$scope", "$state", "logInService", LogInController]);

})(window, window.angular);
(function (window, angular, undefined) {

  "use strict";

  function ProfileEditController($scope, $state, saveUserProfile, userProfile) {
    $scope.error = {};
    $scope.form = "";
    $scope.models = {
      first_name: userProfile.getFirstName(),
      last_name: userProfile.getLastName(),
      address_1: userProfile.getAddress1(),
      address_2: userProfile.getAddress2(),
      city: userProfile.getCity(),
      state: userProfile.getState(),
      zip_code: userProfile.getZipCode(),
      phone_number: userProfile.getPhoneNumber()
    };

    $scope.hasError = function hasError() {
      return !_.isEmpty($scope.error);
    };

    $scope.onSubmit = function onSubmit() {
      saveUserProfile($scope.models).then(function () {
        $state.go("app.profile.detail");
      }, function (response) {
        $scope.error = response;
      });
    };
  }

  angular.module("safefamilies")
    .controller("ProfileEditController", [
      "$scope", "$state", "saveUserProfile", "userProfile", ProfileEditController
    ]);

})(window, window.angular);
(function (window, angular, undefined) {

  "use strict";

  function SignUpController($scope, $state, signUpService) {
    $scope.email = null;
    $scope.error = {};
    $scope.form = "";
    $scope.password = null;
    $scope.passwordAgain = null;
    $scope.username = null;

    $scope.hasError = function hasError() {
      return !_.isEmpty($scope.error);
    };

    $scope.onSubmit = function onSubmit() {
      signUpService($scope.username, $scope.email, $scope.password).then(function () {
        $state.go("app.dashboard");
      }, function (response) {
        $scope.error = response;
        $scope.password = null;
        $scope.passwordAgain = null;
      });
    };

    $scope.passwordsMatch = function passwordsMatch() {
      return (!_.isEmpty($scope.password) && $scope.password === $scope.passwordAgain);
    };
  }

  angular.module("safefamilies")
    .controller("SignUpController", ["$scope", "$state", "signUpService", SignUpController]);

})(window, window.angular);
angular.module("templates").run(["$templateCache", function($templateCache) {$templateCache.put("global/views/dashboard/dashboard.html","<div class=\"row\">\n  <div class=\"col-lg-12\">\n    <div class=\"panel panel-default\">\n      <div class=\"panel-heading\">\n        <h4 class=\"panel-title\">\n          Requested Needs <span class=\"badge pull-right\">{{ models.requestedNeeds.length }}</span>\n        </h4>\n      </div>\n      <div class=\"panel-body text-center\" ng-if=\"models.requestedNeeds.length === 0\">\n        No requested needs...\n      </div>\n      <ul class=\"list-group\" ng-if=\"models.requestedNeeds.length > 0\">\n        <li class=\"list-group-item\" ng-repeat=\"need in models.requestedNeeds\">\n          {{ need._need.name }} <a class=\"pull-right\" href ng-click=\"assignNeed(need)\">Assign</a>\n        </li>\n      </ul>\n    </div>\n\n    <div class=\"panel panel-default\">\n      <div class=\"panel-heading\">\n        <h4 class=\"panel-title\">\n          Pending Needs <span class=\"badge pull-right\">{{ models.pendingNeeds.length }}</span>\n        </h4>\n      </div>\n      <div class=\"panel-body text-center\" ng-if=\"models.pendingNeeds.length === 0\">\n        No pending needs...\n      </div>\n      <ul class=\"list-group\" ng-if=\"models.pendingNeeds.length > 0\">\n        <li class=\"list-group-item\" ng-repeat=\"need in models.pendingNeeds\">\n          {{ need._need.name }} <a class=\"pull-right\" href ng-click=\"returnNeed(need)\" ng-if=\"need.hasCommitment\">Return</a>\n        </li>\n      </ul>\n    </div>\n\n    <div class=\"panel panel-default\">\n      <div class=\"panel-heading\">\n        <h4 class=\"panel-title\">\n          Received Needs <span class=\"badge pull-right\">{{ models.receivedNeeds.length }}</span>\n        </h4>\n      </div>\n      <div class=\"panel-body text-center\" ng-if=\"models.receivedNeeds.length === 0\">\n        No received needs...\n      </div>\n      <ul class=\"list-group\" ng-if=\"models.receivedNeeds.length > 0\">\n        <li class=\"list-group-item disabled\" ng-repeat=\"need in models.receivedNeeds\">\n          {{ need._need.name }}\n        </li>\n      </ul>\n    </div>\n  </div>\n</div>");
$templateCache.put("users/views/profile_detail/profile_detail.html","<div class=\"row\">\n  <div class=\"col-lg-offset-4 col-lg-4\">\n    <div class=\"text-center\">\n      <a href ui-sref=\"app.profile.edit\">\n        <img class=\"img-circle center-block\" ng-src=\"{{ models.photo }}\" width=\"80\">\n      </a>\n      <div class=\"details-display\">\n        <div ng-if=\"selectedDetail === \'name\'\">\n          <p>Hi, my name is</p>\n          <h4>{{ models.full_name }}</h4>\n        </div>\n        <div ng-if=\"selectedDetail === \'email\'\">\n          <p>My email address is</p>\n          <h4>{{ models.email }}</h4>\n        </div>\n        <div ng-if=\"selectedDetail === \'address\'\">\n          <p>My address is</p>\n          <h4>{{ models.full_address }}</h4>\n        </div>\n        <div ng-if=\"selectedDetail === \'phone\'\">\n          <p>My phone number is</p>\n          <h4>{{ models.phone_number }}</h4>\n        </div>\n      </div>\n      <ul class=\"details-list list-inline\">\n        <li ng-mouseenter=\"setSelectedDetail(\'name\')\" ng-click=\"setSelectedDetail(\'name\')\">\n          <i class=\"fa fa-user\"></i>\n        </li>\n        <li ng-mouseenter=\"setSelectedDetail(\'email\')\" ng-click=\"setSelectedDetail(\'email\')\">\n          <i class=\"fa fa-envelope\"></i>\n        </li>\n        <li ng-mouseenter=\"setSelectedDetail(\'address\')\" ng-click=\"setSelectedDetail(\'address\')\">\n          <i class=\"fa fa-map-marker\"></i>\n        </li>\n        <li ng-mouseenter=\"setSelectedDetail(\'phone\')\" ng-click=\"setSelectedDetail(\'phone\')\">\n          <i class=\"fa fa-phone\"></i>\n        </li>\n      </ul>\n    </div>\n  </div>\n</div>");
$templateCache.put("users/views/log_in/log_in.html","<div class=\"row\">\n  <div class=\"col-lg-offset-4 col-lg-4\">\n    <div class=\"panel panel-default\">\n      <div class=\"panel-heading\">\n        <h4 class=\"panel-title\">Log in</h4>\n      </div>\n      <div class=\"panel-body\">\n        <form name=\"form\" novalidate ng-submit=\"onSubmit()\">\n          <div class=\"alert alert-danger\" ng-if=\"hasError()\">{{ error.detail }}</div>\n          <div class=\"form-group\">\n            <label for=\"username\">Username:</label>\n            <input id=\"username\" class=\"form-control\" type=\"text\" ng-model=\"username\" required>\n          </div>\n          <div class=\"form-group\">\n            <label for=\"password\">Password:</label>\n            <input id=\"password\" class=\"form-control\" type=\"password\" ng-model=\"password\" required>\n          </div>\n          <button class=\"btn btn-primary btn-block\" type=\"submit\" ng-disabled=\"form.$invalid\">Log in\n          </button>\n        </form>\n      </div>\n    </div>\n    <p class=\"text-center\">Don\'t have an account? <a href ui-sref=\"sign_up\">Sign up!</a></p>\n  </div>\n</div>");
$templateCache.put("users/views/profile_edit/profile_edit.html","<div class=\"row\">\n  <div class=\"col-lg-offset-4 col-lg-4\">\n    <div class=\"panel panel-default\">\n      <div class=\"panel-heading\">\n        <h4 class=\"panel-title\">Profile</h4>\n      </div>\n      <div class=\"panel-body\">\n        <form name=\"form\" novalidate ng-submit=\"onSubmit()\">\n          <div class=\"form-group\">\n            <label for=\"first-name\">First name:</label>\n            <input id=\"first-name\" class=\"form-control\" type=\"text\" ng-value=\"models.first_name\" ng-model=\"models.first_name\" required>\n          </div>\n          <div class=\"form-group\">\n            <label for=\"last-name\">Last name:</label>\n            <input id=\"last-name\" class=\"form-control\" type=\"text\" ng-value=\"models.last_name\" ng-model=\"models.last_name\" required>\n          </div>\n          <div class=\"form-group\">\n            <label for=\"address\">Address:</label>\n            <input id=\"address\" class=\"form-control\" type=\"text\" ng-value=\"models.address_1\" ng-model=\"models.address_1\" required>\n          </div>\n          <div class=\"form-group\">\n            <label for=\"address-2\">Address (line 2):</label>\n            <input id=\"address-2\" class=\"form-control\" type=\"text\" ng-value=\"models.address_2\" ng-model=\"models.address_2\">\n          </div>\n          <div class=\"form-group\">\n            <label for=\"city\">City:</label>\n            <input id=\"city\" class=\"form-control\" type=\"text\" ng-value=\"models.city\" ng-model=\"models.city\" required>\n          </div>\n          <div class=\"form-group\">\n            <label for=\"state\">State:</label>\n            <input id=\"state\" class=\"form-control\" type=\"text\" ng-value=\"models.state\" ng-model=\"models.state\" required>\n          </div>\n          <div class=\"form-group\">\n            <label for=\"zip-code\">Zip code:</label>\n            <input id=\"zip-code\" class=\"form-control\" type=\"text\" ng-value=\"models.zip_code\" ng-model=\"models.zip_code\" required>\n          </div>\n          <div class=\"form-group\">\n            <label for=\"phone-number\">Phone number:</label>\n            <input id=\"phone-number\" class=\"form-control\" type=\"text\" ng-value=\"models.phone_number\" ng-model=\"models.phone_number\" required>\n          </div>\n          <button class=\"btn btn-primary btn-block\" type=\"submit\" ng-disabled=\"form.$invalid\">Update</button>\n        </form>\n      </div>\n    </div>\n  </div>\n</div>");
$templateCache.put("users/views/sign_up/sign_up.html","<div class=\"row\">\n  <div class=\"col-lg-offset-4 col-lg-4\">\n    <div class=\"panel panel-default\">\n      <div class=\"panel-heading\">\n        <h4 class=\"panel-title\">Sign up</h4>\n      </div>\n      <div class=\"panel-body\">\n        <form name=\"form\" novalidate ng-submit=\"onSubmit()\">\n          <div class=\"form-group\" ng-class=\"{\n            \'has-error\': error.username,\n            \'has-feedback\': error.username\n          }\">\n            <label for=\"username\" class=\"control-label\">Username:</label>\n            <input id=\"username\" class=\"form-control\" type=\"text\" ng-model=\"username\" required>\n            <span class=\"help-block\" ng-if=\"error.username\">{{ error.username[0] }}</span>\n          </div>\n          <div class=\"form-group\">\n            <label for=\"email\">Email:</label>\n            <input id=\"email\" class=\"form-control\" type=\"text\" ng-model=\"email\" required>\n          </div>\n          <div class=\"form-group\">\n            <label for=\"password\">Password:</label>\n            <input id=\"password\" class=\"form-control\" type=\"password\" ng-model=\"password\" required>\n          </div>\n          <div class=\"form-group\">\n            <label for=\"password-confirmation\">Password (again):</label>\n            <input id=\"password-confirmation\" class=\"form-control\" type=\"password\" ng-model=\"passwordAgain\" required>\n          </div>\n          <button class=\"btn btn-primary btn-block\" type=\"submit\" ng-disabled=\"form.$invalid || !passwordsMatch()\">Sign up\n          </button>\n        </form>\n      </div>\n    </div>\n    <p class=\"text-center\">Already have an account? <a href ui-sref=\"log_in\">Log in!</a></p>\n  </div>\n</div>");}]);