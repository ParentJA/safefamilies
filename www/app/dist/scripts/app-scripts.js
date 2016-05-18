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
      .state("landing", {
        url: "/",
        templateUrl: "global/views/landing/landing.html",
        data: {
          loginRequired: false
        },
        controller: "LandingController"
      });

    //Default state...
    $urlRouterProvider.otherwise("/");
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

  function DashboardRouterConfig($stateProvider) {
    $stateProvider.state("app.dashboard", {
      url: "/dashboard",
      templateUrl: "dashboard/views/dashboard/dashboard.html",
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
  }

  angular.module("safefamilies")
    .config(["$stateProvider", DashboardRouterConfig]);

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

  function AssignNeedModalController($scope, $uibModalInstance, need) {
    $scope.need = need;

    $scope.ok = function ok() {
      $uibModalInstance.close(need);
    };

    $scope.cancel = function cancel() {
      $uibModalInstance.dismiss("cancel");
    };
  }

  angular.module("safefamilies")
    .controller("AssignNeedModalController", ["$scope", "$uibModalInstance", "need", AssignNeedModalController]);

})(window, window.angular);
(function (window, angular, undefined) {

  "use strict";

  function DashboardController($scope, $uibModal, CommitmentResource, CommitmentStatus, commitments,
                               recipientNeedService, userProfile) {
    $scope.models = {
      commitments: commitments.getCommitments(),
      pendingNeeds: recipientNeedService.getPendingNeeds(),
      requestedNeeds: recipientNeedService.getRequestedNeeds(),
      user: {
        photo: userProfile.getPhoto(),
        fullName: userProfile.getFullName()
      }
    };

    function updateNeeds() {
      $scope.models.pendingNeeds = recipientNeedService.getPendingNeeds();
      $scope.models.requestedNeeds = recipientNeedService.getRequestedNeeds();
    }

    function assignNeed(need) {
      CommitmentResource.create({
        recipient_need: need.id,
        status: CommitmentStatus.ASSIGNED
      }).then(updateNeeds);
    }

    function returnNeed(need) {
      CommitmentResource.destroy(need._commitment.id).then(updateNeeds);
    }

    $scope.openAssignNeed = function openAssignNeed(need) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: "dashboard/views/assign_need_modal/assign_need_modal.html",
        controller: "AssignNeedModalController",
        resolve: {
          need: function () {
            return need;
          }
        }
      });

      modalInstance.result.then(assignNeed);
    };

    $scope.openReturnNeed = function openReturnNeed(need) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: "dashboard/views/return_need_modal/return_need_modal.html",
        controller: "ReturnNeedModalController",
        resolve: {
          need: function () {
            return need;
          }
        }
      });

      modalInstance.result.then(returnNeed);
    };
  }

  angular.module("safefamilies")
    .controller("DashboardController", [
      "$scope", "$uibModal", "CommitmentResource", "CommitmentStatus", "commitments", "recipientNeedService",
      "userProfile", DashboardController
    ]);

})(window, window.angular);
(function (window, angular, undefined) {

  "use strict";

  function ReturnNeedModalController($scope, $uibModalInstance, need) {
    $scope.need = need;

    $scope.ok = function ok() {
      $uibModalInstance.close(need);
    };

    $scope.cancel = function cancel() {
      $uibModalInstance.dismiss("cancel");
    };
  }

  angular.module("safefamilies")
    .controller("ReturnNeedModalController", ["$scope", "$uibModalInstance", "need", ReturnNeedModalController]);

})(window, window.angular);
(function (window, angular, undefined) {

  "use strict";

  function LandingController($scope) {}

  angular.module("safefamilies")
    .controller("LandingController", ["$scope", LandingController]);

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
angular.module("templates").run(["$templateCache", function($templateCache) {$templateCache.put("dashboard/views/assign_need_modal/assign_need_modal.html","<div class=\"modal-header\">\r\n  <h4 class=\"modal-title\">Assign Need</h4>\r\n</div>\r\n<div class=\"modal-body\">\r\n  <p class=\"lead\">Will you donate {{ need.quantity }} {{ need._need.name }}?</p>\r\n  <p><strong>Description</strong></p>\r\n  <p>{{ need._need.description }}</p>\r\n</div>\r\n<div class=\"modal-footer\">\r\n  <button class=\"btn btn-default\" type=\"button\" ng-click=\"cancel()\">No</button>\r\n  <button class=\"btn btn-primary\" type=\"submit\" ng-click=\"ok()\">Yes</button>\r\n</div>");
$templateCache.put("dashboard/views/dashboard/dashboard.html","<div class=\"row\">\r\n  <div class=\"col-lg-12\">\r\n    <div class=\"panel panel-default\">\r\n      <div class=\"panel-heading\">\r\n        <h4 class=\"panel-title\">\r\n          Requested Needs <span class=\"badge pull-right\">{{ models.requestedNeeds.length }}</span>\r\n        </h4>\r\n      </div>\r\n      <div class=\"panel-body text-center\" ng-if=\"models.requestedNeeds.length === 0\">\r\n        No one has requested anything...\r\n      </div>\r\n      <table class=\"table table-responsive\" ng-if=\"models.requestedNeeds.length > 0\">\r\n        <thead>\r\n        <tr>\r\n          <th>Quantity</th>\r\n          <th>Name</th>\r\n          <th>Due Date</th>\r\n          <th>Address</th>\r\n          <th class=\"text-right\">Action</th>\r\n        </tr>\r\n        </thead>\r\n        <tbody>\r\n        <tr ng-repeat=\"need in models.requestedNeeds\">\r\n          <td>{{ need.quantity }}</td>\r\n          <td>{{ need._need.name }}</td>\r\n          <td>{{ need.due_date | date:\'shortDate\'}}</td>\r\n          <td>{{ need.address_1 }} </td>\r\n          <td class=\"text-right\"><a href ng-click=\"openAssignNeed(need)\">Accept</a></td>\r\n        </tr>\r\n        </tbody>\r\n      </table>\r\n    </div>\r\n\r\n    <div class=\"panel panel-default\">\r\n      <div class=\"panel-heading\">\r\n        <h4 class=\"panel-title\">\r\n          Your Pending Needs <span class=\"badge pull-right\">{{ models.pendingNeeds.length }}</span>\r\n        </h4>\r\n      </div>\r\n      <div class=\"panel-body text-center\" ng-if=\"models.pendingNeeds.length === 0\">\r\n        You haven\'t committed to any requests...\r\n      </div>\r\n      <table class=\"table table-responsive\" ng-if=\"models.pendingNeeds.length > 0\">\r\n        <thead>\r\n        <tr>\r\n          <th>Quantity</th>\r\n          <th>Name</th>\r\n          <th class=\"text-right\">Action</th>\r\n        </tr>\r\n        </thead>\r\n        <tbody>\r\n        <tr ng-repeat=\"need in models.pendingNeeds\">\r\n          <td>{{ need.quantity }}</td>\r\n          <td>{{ need._need.name }}</td>\r\n          <td class=\"text-right\"><a href ng-click=\"openReturnNeed(need)\" ng-if=\"need.hasCommitment\">Return</a></td>\r\n          <!-- adding \'Completed\' button 05/09 -->\r\n          <td class=\"text-right\"><a <!-- href ng-click=\"openReturnNeed(need)\" ng-if=\"need.hasCommitment\"> --> Completed</a></td>\r\n        </tr>\r\n        </tbody>\r\n      </table>\r\n    </div>\r\n  </div>\r\n</div>");
$templateCache.put("dashboard/views/return_need_modal/return_need_modal.html","<div class=\"modal-header\">\r\n  <h4 class=\"modal-title\">Return Need</h4>\r\n</div>\r\n<div class=\"modal-body\">\r\n  <p class=\"lead\">Do you want us to assign {{ need.quantity }} {{ need._need.name }} to someone else?</p>\r\n  <p><strong>Description</strong></p>\r\n  <p>{{ need._need.description }}</p>\r\n</div>\r\n<div class=\"modal-footer\">\r\n  <button class=\"btn btn-default\" type=\"button\" ng-click=\"cancel()\">No</button>\r\n  <button class=\"btn btn-primary\" type=\"submit\" ng-click=\"ok()\">Yes</button>\r\n</div>");
$templateCache.put("global/views/landing/landing.html","<div class=\"middle-center\">\r\n  <h1 class=\"logo landing\">DC127</h1>\r\n  <!--<p class=\"lead\">\r\n    Welcome to DC127\'s official site for exchanging resources. Here, you can post specific needs and fill requests that\r\n    others post. DC127 is a network, and we believe no one can can care for kids alone. We rely on wonderful volunteers\r\n    like you to connect parents, Host Homes, and Foster Families with the resources they need to successfully care for\r\n    children.\r\n  </p>-->\r\n  <a class=\"btn btn-primary\" href ui-sref=\"log_in\" ng-hide=\"hasUser()\">Log in</a>\r\n  <a class=\"btn btn-primary\" href ui-sref=\"sign_up\" ng-hide=\"hasUser()\">Sign up</a>\r\n  <a class=\"btn btn-primary\" href ui-sref=\"app.dashboard\" ng-show=\"hasUser()\">Continue to dashboard</a>\r\n</div>");
$templateCache.put("users/views/log_in/log_in.html","<div class=\"row\">\r\n  <div class=\"col-lg-offset-4 col-lg-4\">\r\n    <div class=\"panel panel-default\">\r\n      <div class=\"panel-heading\">\r\n        <h4 class=\"panel-title\">Log in</h4>\r\n      </div>\r\n      <div class=\"panel-body\">\r\n        <form name=\"form\" novalidate ng-submit=\"onSubmit()\">\r\n          <div class=\"alert alert-danger\" ng-if=\"hasError()\">{{ error.detail }}</div>\r\n          <div class=\"form-group\">\r\n            <label for=\"username\">Username:</label>\r\n            <input id=\"username\" class=\"form-control\" type=\"text\" ng-model=\"username\" required>\r\n          </div>\r\n          <div class=\"form-group\">\r\n            <label for=\"password\">Password:</label>\r\n            <input id=\"password\" class=\"form-control\" type=\"password\" ng-model=\"password\" required>\r\n          </div>\r\n          <button class=\"btn btn-primary btn-block\" type=\"submit\" ng-disabled=\"form.$invalid\">Log in\r\n          </button>\r\n        </form>\r\n      </div>\r\n    </div>\r\n    <p class=\"text-center\">Don\'t have an account? <a href ui-sref=\"sign_up\">Sign up!</a></p>\r\n  </div>\r\n</div>");
$templateCache.put("users/views/profile_detail/profile_detail.html","<div class=\"row\">\r\n  <div class=\"col-lg-offset-4 col-lg-4\">\r\n    <div class=\"text-center\">\r\n      <a href ui-sref=\"app.profile.edit\">\r\n        <img class=\"img-circle center-block\" ng-src=\"{{ models.photo }}\" width=\"160\">\r\n      </a>\r\n      <div class=\"details-display\">\r\n        <div ng-if=\"selectedDetail === \'name\'\">\r\n          <p>Hi, my name is</p>\r\n          <h4>{{ models.full_name }}</h4>\r\n        </div>\r\n        <div ng-if=\"selectedDetail === \'email\'\">\r\n          <p>My email address is</p>\r\n          <h4>{{ models.email }}</h4>\r\n        </div>\r\n        <div ng-if=\"selectedDetail === \'address\'\">\r\n          <p>My address is</p>\r\n          <h4>{{ models.full_address }}</h4>\r\n        </div>\r\n        <div ng-if=\"selectedDetail === \'phone\'\">\r\n          <p>My phone number is</p>\r\n          <h4>{{ models.phone_number }}</h4>\r\n        </div>\r\n      </div>\r\n      <ul class=\"details-list list-inline\">\r\n        <li ng-mouseenter=\"setSelectedDetail(\'name\')\" ng-click=\"setSelectedDetail(\'name\')\">\r\n          <i class=\"fa fa-user\"></i>\r\n        </li>\r\n        <li ng-mouseenter=\"setSelectedDetail(\'email\')\" ng-click=\"setSelectedDetail(\'email\')\">\r\n          <i class=\"fa fa-envelope\"></i>\r\n        </li>\r\n        <li ng-mouseenter=\"setSelectedDetail(\'address\')\" ng-click=\"setSelectedDetail(\'address\')\">\r\n          <i class=\"fa fa-map-marker\"></i>\r\n        </li>\r\n        <li ng-mouseenter=\"setSelectedDetail(\'phone\')\" ng-click=\"setSelectedDetail(\'phone\')\">\r\n          <i class=\"fa fa-phone\"></i>\r\n        </li>\r\n      </ul>\r\n    </div>\r\n  </div>\r\n</div>");
$templateCache.put("users/views/profile_edit/profile_edit.html","<div class=\"row\">\r\n  <div class=\"col-lg-offset-4 col-lg-4\">\r\n    <div class=\"panel panel-default\">\r\n      <div class=\"panel-heading\">\r\n        <h4 class=\"panel-title\">Profile</h4>\r\n      </div>\r\n      <div class=\"panel-body\">\r\n        <form name=\"form\" novalidate ng-submit=\"onSubmit()\">\r\n          <div class=\"form-group\">\r\n            <label for=\"first-name\">First name:</label>\r\n            <input id=\"first-name\" class=\"form-control\" type=\"text\" ng-value=\"models.first_name\" ng-model=\"models.first_name\" required>\r\n          </div>\r\n          <div class=\"form-group\">\r\n            <label for=\"last-name\">Last name:</label>\r\n            <input id=\"last-name\" class=\"form-control\" type=\"text\" ng-value=\"models.last_name\" ng-model=\"models.last_name\" required>\r\n          </div>\r\n          <div class=\"form-group\">\r\n            <label for=\"address\">Address:</label>\r\n            <input id=\"address\" class=\"form-control\" type=\"text\" ng-value=\"models.address_1\" ng-model=\"models.address_1\" required>\r\n          </div>\r\n          <div class=\"form-group\">\r\n            <label for=\"address-2\">Address (line 2):</label>\r\n            <input id=\"address-2\" class=\"form-control\" type=\"text\" ng-value=\"models.address_2\" ng-model=\"models.address_2\">\r\n          </div>\r\n          <div class=\"form-group\">\r\n            <label for=\"city\">City:</label>\r\n            <input id=\"city\" class=\"form-control\" type=\"text\" ng-value=\"models.city\" ng-model=\"models.city\" required>\r\n          </div>\r\n          <div class=\"form-group\">\r\n            <label for=\"state\">State:</label>\r\n            <input id=\"state\" class=\"form-control\" type=\"text\" ng-value=\"models.state\" ng-model=\"models.state\" required>\r\n          </div>\r\n          <div class=\"form-group\">\r\n            <label for=\"zip-code\">Zip code:</label>\r\n            <input id=\"zip-code\" class=\"form-control\" type=\"text\" ng-value=\"models.zip_code\" ng-model=\"models.zip_code\" required>\r\n          </div>\r\n          <div class=\"form-group\">\r\n            <label for=\"phone-number\">Phone number:</label>\r\n            <input id=\"phone-number\" class=\"form-control\" type=\"text\" ng-value=\"models.phone_number\" ng-model=\"models.phone_number\" required>\r\n          </div>\r\n          <button class=\"btn btn-primary btn-block\" type=\"submit\" ng-disabled=\"form.$invalid\">Update</button>\r\n        </form>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>");
$templateCache.put("users/views/sign_up/sign_up.html","<div class=\"row\">\r\n  <div class=\"col-lg-offset-4 col-lg-4\">\r\n    <div class=\"panel panel-default\">\r\n      <div class=\"panel-heading\">\r\n        <h4 class=\"panel-title\">Sign up</h4>\r\n      </div>\r\n      <div class=\"panel-body\">\r\n        <form name=\"form\" novalidate ng-submit=\"onSubmit()\">\r\n          <div class=\"form-group\" ng-class=\"{\r\n            \'has-error\': error.username,\r\n            \'has-feedback\': error.username\r\n          }\">\r\n            <label for=\"username\" class=\"control-label\">Username:</label>\r\n            <input id=\"username\" class=\"form-control\" type=\"text\" ng-model=\"username\" required>\r\n            <span class=\"help-block\" ng-if=\"error.username\">{{ error.username[0] }}</span>\r\n          </div>\r\n          <div class=\"form-group\">\r\n            <label for=\"email\">Email:</label>\r\n            <input id=\"email\" class=\"form-control\" type=\"text\" ng-model=\"email\" required>\r\n          </div>\r\n          <div class=\"form-group\">\r\n            <label for=\"password\">Password:</label>\r\n            <input id=\"password\" class=\"form-control\" type=\"password\" ng-model=\"password\" required>\r\n          </div>\r\n          <div class=\"form-group\">\r\n            <label for=\"password-confirmation\">Password (again):</label>\r\n            <input id=\"password-confirmation\" class=\"form-control\" type=\"password\" ng-model=\"passwordAgain\" required>\r\n          </div>\r\n          <button class=\"btn btn-primary btn-block\" type=\"submit\" ng-disabled=\"form.$invalid || !passwordsMatch()\">Sign up\r\n          </button>\r\n        </form>\r\n      </div>\r\n    </div>\r\n    <p class=\"text-center\">Already have an account? <a href ui-sref=\"log_in\">Log in!</a></p>\r\n  </div>\r\n</div>");}]);