(function (window, angular, undefined) {

  'use strict';

  function HttpConfig($httpProvider) {
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  }

  function CoreRouterConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('app', {
        url: '/app',
        template: '<div ui-view></div>',
        data: {
          loginRequired: true
        },
        abstract: true
      })
      .state('landing', {
        url: '/',
        templateUrl: 'global/landing.html',
        data: {
          loginRequired: false
        },
        controller: 'LandingController',
        controllerAs: 'vm'
      });

    //Default state...
    $urlRouterProvider.otherwise('/');
  }

  function CoreRunner($rootScope, $state, AccountModel, navigationService) {
    $rootScope.$state = $state;
    $rootScope.$on('$stateChangeStart', function (event, toState) {
      // Close navigation.
      navigationService.closeNavigation();

      // Check authentication.
      if (toState.data.loginRequired && !AccountModel.hasUser()) {
        event.preventDefault();
        $state.go('log_in');
      }
    });
  }

  function MainController($state, AccountModel, logOutService, navigationService) {
    var vm = this;

    vm.navigationService = navigationService;

    vm.hasUser = function hasUser() {
      return AccountModel.hasUser();
    };

    vm.logOut = function logOut() {
      logOutService().finally(function () {
        $state.go('log_in');
      });
    };
  }

  angular.module('templates', []);

  angular.module('safefamilies', ['templates', 'example-accounts', 'ui.bootstrap', 'ui.router'])
    .constant('BASE_URL', '/api/v1/')
    .config(['$httpProvider', HttpConfig])
    .config(['$stateProvider', '$urlRouterProvider', CoreRouterConfig])
    .run(['$rootScope', '$state', 'AccountModel', 'navigationService', CoreRunner])
    .controller('MainController', [
      '$state', 'AccountModel', 'logOutService', 'navigationService', MainController
    ]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

  function AddNeedModalController($uibModalInstance) {
    var vm = this;

    vm.models = {
      // Recipient.
      part1: {
        first_name: null,
        last_name: null,
        phone_number: null,
        email: null,
        address_1: null,
        address_2: null,
        city: null,
        state: null,
        zip_code: null
      },

      // Need.
      part2: {
        name: null,
        description: null
      },

      // Recipient need.
      part3: {
        quantity: null,
        due_date: null
      }
    };

    vm.part1 = null;
    vm.part2 = null;
    vm.part3 = null;

    vm.currentPart = 1;

    vm.goToPart = function goToPart(part) {
      vm.currentPart = part;
    };

    vm.ok = function ok() {
      $uibModalInstance.close(vm.models);
    };

    vm.cancel = function cancel() {
      $uibModalInstance.dismiss('cancel');
    };
  }

  angular.module('safefamilies')
    .controller('AddNeedModalController', ['$uibModalInstance', AddNeedModalController]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

  function AssignNeedModalController($uibModalInstance, need, userService) {
    var vm = this;

    vm.need = need;

    vm.getFullName = function getFullName(user) {
      return userService.getFullName(user);
    };

    vm.getFullAddress = function getFullAddress(user) {
      return userService.getFullAddress(user);
    };

    vm.getEmail = function getEmail(user) {
      return userService.getEmail(user);
    };

    vm.getPhoneNumber = function getPhoneNumber(user) {
      return userService.getPhoneNumber(user);
    };

    vm.ok = function ok() {
      $uibModalInstance.close(need);
    };

    vm.cancel = function cancel() {
      $uibModalInstance.dismiss('cancel');
    };
  }

  angular.module('safefamilies')
    .controller('AssignNeedModalController', ['$uibModalInstance', 'need', 'userService', AssignNeedModalController]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

  function CompletedModalController($uibModalInstance, event, need) {
    var vm = this;

    vm.ok = function ok() {
      $uibModalInstance.close({event: event, need: need});
    };

    vm.cancel = function cancel() {
      $uibModalInstance.dismiss(event);
    };
  }

  angular.module('safefamilies')
    .controller('CompletedModalController', ['$uibModalInstance', 'event', 'need', CompletedModalController]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

  function DashboardController($uibModal, CommitmentResource, CommitmentStatus, commitments, RecipientNeedResource,
                               recipientNeedService, userProfile) {
    var vm = this;

    vm.models = {
      commitments: commitments.getCommitments(),
      pendingNeeds: recipientNeedService.getPendingNeeds(),
      requestedNeeds: recipientNeedService.getRequestedNeeds(),
      user: {
        photo: userProfile.getPhoto(),
        fullName: userProfile.getFullName()
      }
    };

    function updateNeeds() {
      vm.models.pendingNeeds = recipientNeedService.getPendingNeeds();
      vm.models.requestedNeeds = recipientNeedService.getRequestedNeeds();
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

    function addNeed(parts) {
      RecipientNeedResource.create({
        recipient: parts.part1,
        need: parts.part2,
        recipient_need: parts.part3
      }).then(updateNeeds);
    }

    function complete(result) {
      // Disable the input.
      result.event.currentTarget.disabled = true;

      // Update the need and remove it from the UI.
      CommitmentResource.update(result.need._commitment.id, 'F').then(updateNeeds);
    }

    vm.openAssignNeed = function openAssignNeed(need) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'dashboard/assign-need-modal.html',
        controller: 'AssignNeedModalController',
        controllerAs: 'vm',
        resolve: {
          need: function () {
            return need;
          }
        }
      });

      modalInstance.result.then(assignNeed);
    };

    vm.openReturnNeed = function openReturnNeed(need) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'dashboard/return-need-modal.html',
        controller: 'ReturnNeedModalController',
        controllerAs: 'vm',
        resolve: {
          need: function () {
            return need;
          }
        }
      });

      modalInstance.result.then(returnNeed);
    };

    vm.openRecipient = function openRecipient(need) {
      $uibModal.open({
        animation: true,
        templateUrl: 'dashboard/recipient-modal.html',
        controller: 'RecipientModalController',
        controllerAs: 'vm',
        resolve: {
          need: function () {
            return need;
          }
        }
      });
    };

    vm.openAddNeed = function openAddNeed() {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'dashboard/add-need-modal.html',
        controller: 'AddNeedModalController',
        controllerAs: 'vm'
      });

      modalInstance.result.then(addNeed);
    };

    vm.openCompleted = function openCompleted(event, need) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'dashboard/completed-modal.html',
        controller: 'CompletedModalController',
        controllerAs: 'vm',
        resolve: {
          event: function () {
            return event;
          },
          need: function () {
            return need;
          }
        }
      });

      modalInstance.result.then(complete, function (event) {
        event.currentTarget.checked = false;
      });
    };
  }

  angular.module('safefamilies')
    .controller('DashboardController', [
      '$uibModal', 'CommitmentResource', 'CommitmentStatus', 'commitments', 'RecipientNeedResource',
      'recipientNeedService', 'userProfile', DashboardController
    ]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

  function DashboardRouterConfig($stateProvider) {
    $stateProvider.state('app.dashboard', {
      url: '/dashboard',
      templateUrl: 'dashboard/dashboard.html',
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
      controller: 'DashboardController',
      controllerAs: 'vm'
    });
  }

  angular.module('safefamilies')
    .config(['$stateProvider', DashboardRouterConfig]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

  function RecipientModalController($uibModalInstance, need, userService) {
    var vm = this;

    vm.need = need;

    vm.getFullName = function getFullName(user) {
      return userService.getFullName(user);
    };

    vm.getFullAddress = function getFullAddress(user) {
      return userService.getFullAddress(user);
    };

    vm.getEmail = function getEmail(user) {
      return userService.getEmail(user);
    };

    vm.getPhoneNumber = function getPhoneNumber(user) {
      return userService.getPhoneNumber(user);
    };

    vm.cancel = function cancel() {
      $uibModalInstance.dismiss('cancel');
    };
  }

  angular.module('safefamilies')
    .controller('RecipientModalController', ['$uibModalInstance', 'need', 'userService', RecipientModalController]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

  function ReturnNeedModalController($uibModalInstance, need) {
    var vm = this;

    vm.need = need;

    vm.ok = function ok() {
      $uibModalInstance.close(need);
    };

    vm.cancel = function cancel() {
      $uibModalInstance.dismiss('cancel');
    };
  }

  angular.module('safefamilies')
    .controller('ReturnNeedModalController', ['$uibModalInstance', 'need', ReturnNeedModalController]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

  function CommitmentResource($http, $q, BASE_URL, Commitment, RecipientNeed) {
    this.list = function list() {
      var deferred = $q.defer();

      $http.get(BASE_URL + 'needs/commitment/').then(function (response) {
        Commitment.updateList(response.data);
        deferred.resolve(Commitment);
      }, function (response) {
        console.error('Failed to get commitments.');
        deferred.reject(response);
      });

      return deferred.promise;
    };

    this.create = function create(commitment) {
      var deferred = $q.defer();

      $http.post(BASE_URL + 'needs/commitment/', commitment).then(function (response) {
        Commitment.updateDict(response.data);
        RecipientNeed.updateDict(response.data);
        deferred.resolve(Commitment);
      }, function (response) {
        console.error('Failed to create commitment.');
        deferred.reject(response);
      });

      return deferred.promise;
    };

    this.destroy = function destroy(id) {
      var deferred = $q.defer();

      $http.delete(BASE_URL + 'needs/commitment/' + id + '/').then(function (response) {
        Commitment.removeDict(id);
        RecipientNeed.updateDict(response.data);
        deferred.resolve(Commitment);
      }, function (response) {
        console.error('Failed to delete commitment with ID ' + id + '.');
        deferred.reject(response);
      });

      return deferred.promise;
    };
    
    this.update = function update(id, status) {
      var deferred = $q.defer();

      $http.put(BASE_URL + 'needs/commitment/' + id + '/', {
        status: status
      }).then(function (response) {
        Commitment.removeDict(id);
        RecipientNeed.updateDict(response.data);
        deferred.resolve(Commitment);
      }, function (response) {
        console.error('Failed to update commitment with ID ' + id + '.');
        deferred.reject(response);
      });

      return deferred.promise;
    }
  }

  angular.module('safefamilies')
    .service('CommitmentResource', ['$http', '$q', 'BASE_URL', 'Commitment', 'RecipientNeed', CommitmentResource]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

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
        commitments = _.merge(commitments, _.keyBy(data.commitment, 'id'));
      }
    };
  }

  angular.module('safefamilies')
    .constant('CommitmentStatus', {
      ASSIGNED: 'A',
      FINISHED: 'F'
    })
    .service('Commitment', [Commitment]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

  function RecipientNeedResource($http, $q, BASE_URL, RecipientNeed) {
    this.list = function list() {
      var deferred = $q.defer();

      $http.get(BASE_URL + 'needs/recipient_need/').then(function (response) {
        RecipientNeed.updateList(response.data);
        deferred.resolve(RecipientNeed);
      }, function (response) {
        console.error('Failed to load recipient needs.');
        deferred.reject(response.data);
      });

      return deferred.promise;
    };

    this.create = function create(data) {
      var deferred = $q.defer();

      $http.post(BASE_URL + 'needs/recipient_need/', data).then(function (response) {
        RecipientNeed.updateList(response.data);
        deferred.resolve(RecipientNeed);
      }, function (response) {
        console.error('Failed to create recipient needs.');
        deferred.reject(response.data);
      });

      return deferred.promise;
    };
  }

  angular.module('safefamilies')
    .service('RecipientNeedResource', ['$http', '$q', 'BASE_URL', 'RecipientNeed', RecipientNeedResource]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

  function recipientNeedService(Commitment, CommitmentStatus, RecipientNeed, RecipientNeedStatus) {
    var pendingNeeds = [];
    var receivedNeeds = [];
    var requestedNeeds = [];

    this.getPendingNeeds = function getPendingNeeds() {
      var needs = _.filter(RecipientNeed.getRecipientNeeds(), {status: RecipientNeedStatus.PENDING});
      var commitments = _.filter(Commitment.getCommitments(), {status: CommitmentStatus.ASSIGNED});
      var commitmentsByNeed = _.keyBy(_.values(commitments), 'recipient_need');

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

  angular.module('safefamilies')
    .service('recipientNeedService', [
      'Commitment', 'CommitmentStatus', 'RecipientNeed', 'RecipientNeedStatus', recipientNeedService
    ]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

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
        needs = _.merge(needs, _.keyBy(data.need, 'id'));
      }

      if (!_.isUndefined(data.recipient)) {
        recipients = _.merge(recipients, _.keyBy(data.recipient, 'id'));
      }

      if (!_.isUndefined(data.recipient_need)) {
        recipientNeeds = _.merge(recipientNeeds, _.keyBy(data.recipient_need, 'id'));
      }

      build();
    };
  }

  angular.module('safefamilies')
    .constant('RecipientNeedStatus', {
      PENDING: 'PEN',
      RECEIVED: 'REC',
      REQUESTED: 'REQ'
    })
    .service('RecipientNeed', [RecipientNeed]);

})(window, window.angular);
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
(function (window, angular, undefined) {

  'use strict';

  function navigationService() {
    var navigationOpen = false;

    this.closeNavigation = function closeNavigation() {
      navigationOpen = false;
    };

    this.isNavigationOpen = function isNavigationOpen() {
      return navigationOpen;
    };

    this.openNavigation = function openNavigation() {
      navigationOpen = true;
    };

    this.toggleNavigation = function toggleNavigation() {
      navigationOpen = !navigationOpen;
    };
  }

  angular.module('safefamilies')
    .service('navigationService', [navigationService]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

  function ChangePasswordController($state, changePasswordService) {
    var vm = this;
    
    vm.error = {};
    vm.form = "";
    vm.oldPassword = null;
    vm.newPassword = null;
    vm.newPasswordAgain = null;

    vm.hasError = function hasError() {
      return !_.isEmpty(vm.error);
    };

    vm.onSubmit = function onSubmit() {
      changePasswordService(vm.oldPassword, vm.newPassword).then(function () {
        $state.go('app.profile.detail');
      }, function (response) {
        vm.error = response;
        vm.oldPassword = null;
        vm.newPassword = null;
        vm.newPasswordAgain = null;
      });
    };

    vm.passwordsMatch = function passwordsMatch() {
      return (!_.isEmpty(vm.newPassword) && vm.newPassword === vm.newPasswordAgain);
    };
  }

  angular.module('safefamilies')
    .controller('ChangePasswordController', ['$state', 'changePasswordService', ChangePasswordController]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

  function changePasswordService($http, $q, BASE_URL) {

    return function (oldPassword, newPassword) {
      var deferred = $q.defer();

      $http.post(BASE_URL + 'users/change_password/', {
        old_password: oldPassword,
        new_password: newPassword
      }).then(function (response) {
        deferred.resolve();
      }, function (response) {
        console.error('Failed to change password.');
        deferred.reject(response.data);
      });

      return deferred.promise;
    };

  }

  angular.module('safefamilies').service('changePasswordService', ['$http', '$q', 'BASE_URL', changePasswordService]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

  function loadUserProfile($http, $q, BASE_URL, UserProfileModel) {

    return function () {
      var deferred = $q.defer();

      $http.get(BASE_URL + 'users/user_profile/').then(function (response) {
        UserProfileModel.update(response.data);
        deferred.resolve(UserProfileModel);
      }, function (response) {
        console.error('Failed to load user profile.');
        deferred.reject(response.data);
      });

      return deferred.promise;
    };

  }

  angular.module('safefamilies')
    .service('loadUserProfile', ['$http', '$q', 'BASE_URL', 'UserProfileModel', loadUserProfile]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

  function LogInController($state, logInService) {
    var vm = this;
    
    vm.error = {};
    vm.form = "";
    vm.password = null;
    vm.username = null;

    vm.hasError = function hasError() {
      return !_.isEmpty(vm.error);
    };

    vm.onSubmit = function onSubmit() {
      logInService(vm.username, vm.password).then(function () {
        $state.go('app.dashboard');
      }, function (response) {
        vm.error = response;
        vm.password = null;
      });
    };
  }

  angular.module('safefamilies')
    .controller('LogInController', ['$state', 'logInService', LogInController]);

})(window, window.angular);
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
(function (window, angular, undefined) {

  'use strict';

  function saveUserProfile($http, $q, BASE_URL, UserProfileModel) {

    return function (payload) {
      var deferred = $q.defer();

      $http.put(BASE_URL + 'users/user_profile/', payload).then(function (response) {
        UserProfileModel.update(response.data);
        deferred.resolve(UserProfileModel);
      }, function (response) {
        console.error('Failed to save user profile.');
        deferred.reject(response.data);
      });

      return deferred.promise;
    };

  }

  angular.module('safefamilies')
    .service('saveUserProfile', ['$http', '$q', 'BASE_URL', 'UserProfileModel', saveUserProfile]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

  function SignUpController($state, signUpService) {
    var vm = this;
    
    vm.email = null;
    vm.error = {};
    vm.form = '';
    vm.password = null;
    vm.passwordAgain = null;
    vm.username = null;

    vm.hasError = function hasError() {
      return !_.isEmpty(vm.error);
    };

    vm.onSubmit = function onSubmit() {
      signUpService(vm.username, vm.email, vm.password).then(function () {
        $state.go('app.dashboard');
      }, function (response) {
        vm.error = response;
        vm.password = null;
        vm.passwordAgain = null;
      });
    };

    vm.passwordsMatch = function passwordsMatch() {
      return (!_.isEmpty(vm.password) && vm.password === vm.passwordAgain);
    };
  }

  angular.module('safefamilies')
    .controller('SignUpController', ['$state', 'signUpService', SignUpController]);

})(window, window.angular);
(function (window, angular, undefined) {

  'use strict';

  function UserProfileModel() {
    var userProfile = {};

    this.getFirstName = function getFirstName() {
      return userProfile.first_name;
    };

    this.getLastName = function getLastName() {
      return userProfile.last_name;
    };

    this.getFullName = function getFullName() {
      return userProfile.first_name + ' ' + userProfile.last_name;
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
      if (_.some([userProfile.address_1, userProfile.city, userProfile.state, userProfile.zip_code], _.isEmpty)) {
        return null;
      }

      var address = userProfile.address_1;

      if (userProfile.address_2) {
        address = address + ', ' + userProfile.address_2;
      }

      return address + ', ' + userProfile.city + ', ' + userProfile.state + ' ' + userProfile.zip_code;
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

  angular.module('safefamilies')
    .service('UserProfileModel', [UserProfileModel]);

})(window, window.angular);
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
(function (window, angular, undefined) {

  'use strict';

  function AuthorizationRouterConfig($stateProvider) {
    // Account-based config.
    $stateProvider
      .state('log_in', {
        url: '/log_in',
        templateUrl: 'users/log-in.html',
        data: {
          loginRequired: false
        },
        controller: 'LogInController',
        controllerAs: 'vm'
      })
      .state('sign_up', {
        url: '/sign_up',
        templateUrl: 'users/sign-up.html',
        data: {
          loginRequired: false
        },
        controller: 'SignUpController',
        controllerAs: 'vm'
      });

    // Users-based config.
    $stateProvider
      .state('app.profile', {
        url: '/profile',
        template: '<div ui-view></div>',
        data: {
          loginRequired: true
        },
        abstract: true
      })
      .state('app.profile.detail', {
        url: '/detail',
        templateUrl: 'users/profile-detail.html',
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
        controller: 'ProfileDetailController',
        controllerAs: 'vm'
      })
      .state('app.profile.edit', {
        url: '/edit',
        templateUrl: 'users/profile-edit.html',
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
        controller: 'ProfileEditController',
        controllerAs: 'vm'
      })
      .state('app.profile.change_password', {
        url: '/change_password',
        templateUrl: 'users/change-password.html',
        data: {
          loginRequired: true
        },
        controller: 'ChangePasswordController',
        controllerAs: 'vm'
      });
  }

  angular.module('safefamilies')
    .config(['$stateProvider', AuthorizationRouterConfig]);

})(window, window.angular);
angular.module('templates').run(['$templateCache', function($templateCache) {$templateCache.put('dashboard/add-need-modal.html','<div class="modal-header">\n  <h4 class="modal-title">Add Need</h4>\n</div>\n<div class="modal-body">\n  <div class="alert alert-info">Fields with an asterisk (*) are required.</div>\n\n  <!-- Recipient -->\n  <form name="part1" novalidate ng-if="vm.currentPart === 1">\n    <div class="form-group">\n      <label>First name *:</label>\n      <input class="form-control" type="text" ng-value="vm.models.part1.first_name"\n             ng-model="vm.models.part1.first_name" required>\n    </div>\n    <div class="form-group">\n      <label>Last name *:</label>\n      <input class="form-control" type="text" ng-value="vm.models.part1.last_name" ng-model="vm.models.part1.last_name"\n             required>\n    </div>\n    <div class="form-group">\n      <label>Address *:</label>\n      <input class="form-control" type="text" ng-value="vm.models.part1.address_1" ng-model="vm.models.part1.address_1"\n             required>\n    </div>\n    <div class="form-group">\n      <label>Address (line 2):</label>\n      <input class="form-control" type="text" ng-value="vm.models.part1.address_2" ng-model="vm.models.part1.address_2">\n    </div>\n    <div class="form-group">\n      <label>City *:</label>\n      <input class="form-control" type="text" ng-value="vm.models.part1.city" ng-model="vm.models.part1.city" required>\n    </div>\n    <div class="form-group">\n      <label>State *:</label>\n      <input class="form-control" type="text" ng-value="vm.models.part1.state" ng-model="vm.models.part1.state"\n             required>\n    </div>\n    <div class="form-group">\n      <label>Zip code *:</label>\n      <input class="form-control" type="text" ng-value="vm.models.part1.zip_code" ng-model="vm.models.part1.zip_code"\n             required>\n    </div>\n    <div class="form-group">\n      <label>Phone number *:</label>\n      <input class="form-control" type="tel" ng-value="vm.models.part1.phone_number"\n             ng-model="vm.models.part1.phone_number" required>\n    </div>\n    <button class="btn btn-primary btn-block" type="button" ng-click="vm.goToPart(2)"\n            ng-disabled="vm.part1.$invalid">Continue\n    </button>\n  </form>\n\n  <!-- Need -->\n  <form name="part2" novalidate ng-if="vm.currentPart === 2">\n    <div class="form-group">\n      <label>Name *:</label>\n      <input class="form-control" type="text" ng-value="vm.models.part2.name" ng-model="vm.models.part2.name">\n    </div>\n    <div class="form-group">\n      <label>Description *:</label>\n      <textarea class="form-control" ng-value="vm.models.part2.description"\n                ng-model="vm.models.part2.description"></textarea>\n    </div>\n    <button class="btn btn-default btn-block" type="button" ng-click="vm.goToPart(1)">Back</button>\n    <button class="btn btn-primary btn-block" type="button" ng-click="vm.goToPart(3)"\n            ng-disabled="vm.part2.$invalid">Continue\n    </button>\n  </form>\n\n  <!-- Recipient need -->\n  <form name="part3" novalidate ng-if="vm.currentPart === 3">\n    <div class="form-group">\n      <label>Quantity *:</label>\n      <input class="form-control" type="number" ng-value="vm.models.part3.quantity" ng-model="vm.models.part3.quantity">\n    </div>\n    <div class="form-group">\n      <label>Due date *:</label>\n      <input class="form-control" type="datetime-local" ng-value="vm.models.part3.due_date"\n             ng-model="vm.models.part3.due_date">\n    </div>\n    <button class="btn btn-default btn-block" type="button" ng-click="vm.goToPart(2)">Back</button>\n    <button class="btn btn-primary btn-block" type="submit" ng-click="vm.ok()"\n            ng-disabled="vm.part3.$invalid">Submit\n    </button>\n  </form>\n</div>');
$templateCache.put('dashboard/assign-need-modal.html','<div class="modal-header">\n  <h4 class="modal-title">Assign Need</h4>\n</div>\n<div class="modal-body">\n  <p class="lead">Will you donate {{ vm.need.quantity }} {{ vm.need._need.name }}?</p>\n  <p><strong>Description</strong></p>\n  <p>{{ vm.need._need.description }}</p>\n  <p><strong>Requested By</strong></p>\n  <ul class="list-unstyled">\n    <li ng-bind="vm.getFullName(vm.need._recipient)"></li>\n    <li ng-bind="vm.getFullAddress(vm.need._recipient)"></li>\n    <li ng-bind="vm.need._recipient.phone_number || \'N/A\'" ng-if="vm.need._recipient.phone_number"></li>\n    <li ng-bind="vm.need._recipient.email || \'N/A\'" ng-if="vm.need._recipient.email"></li>\n  </ul>\n</div>\n<div class="modal-footer">\n  <button class="btn btn-default" type="button" ng-click="vm.cancel()">No</button>\n  <button class="btn btn-primary" type="submit" ng-click="vm.ok()">Yes</button>\n</div>');
$templateCache.put('dashboard/completed-modal.html','<div class="modal-header">\n  <h4 class="modal-title">Complete Need</h4>\n</div>\n<div class="modal-body">\n  <p class="lead">Have you completed this request? Do not hit complete until the item has been delivered.</p>\n</div>\n<div class="modal-footer">\n  <button class="btn btn-default" type="button" ng-click="vm.cancel()">No</button>\n  <button class="btn btn-primary" type="submit" ng-click="vm.ok()">Yes</button>\n</div>');
$templateCache.put('dashboard/dashboard.html','<div class="row">\n  <div class="col-lg-12">\n    <div class="panel panel-default">\n      <div class="panel-heading">\n        <h4 class="panel-title">\n          Requested Needs <span class="badge pull-right">{{ vm.models.requestedNeeds.length }}</span>\n        </h4>\n      </div>\n      <div class="panel-body text-center" ng-if="vm.models.requestedNeeds.length === 0">\n        No one has requested anything...\n      </div>\n      <table class="table table-responsive" ng-if="vm.models.requestedNeeds.length > 0">\n        <thead>\n        <tr>\n          <th>Quantity</th>\n          <th>Name</th>\n          <th>Due Date</th>\n          <th>Address</th>\n          <th class="text-right">Action</th>\n        </tr>\n        </thead>\n        <tbody>\n        <tr ng-repeat="need in vm.models.requestedNeeds">\n          <td>{{ need.quantity }}</td>\n          <td>{{ need._need.name }}</td>\n          <td>{{ (need.due_date | date: \'shortDate\') || \'N/A\' }}</td>\n          <td>{{ need._recipient.address_1 || \'N/A\' }}</td>\n          <td class="text-right"><a href ng-click="vm.openAssignNeed(need)">Accept</a></td>\n        </tr>\n        </tbody>\n      </table>\n      <div class="panel-footer">\n        <button class="btn btn-primary" ng-click="vm.openAddNeed()"><i class="fa fa-plus"></i> Post a need</button>\n      </div>\n    </div>\n\n    <div class="panel panel-default">\n      <div class="panel-heading">\n        <h4 class="panel-title">\n          Your Pending Needs <span class="badge pull-right">{{ vm.models.pendingNeeds.length }}</span>\n        </h4>\n      </div>\n      <div class="panel-body text-center" ng-if="vm.models.pendingNeeds.length === 0">\n        You haven\'t committed to any requests...\n      </div>\n      <table class="table table-responsive" ng-if="vm.models.pendingNeeds.length > 0">\n        <thead>\n        <tr>\n          <th>Quantity</th>\n          <th>Name</th>\n          <th>Action</th>\n          <th>Completed</th>\n        </tr>\n        </thead>\n        <tbody>\n        <tr ng-repeat="need in vm.models.pendingNeeds">\n          <td>{{ need.quantity }}</td>\n          <td>\n            <a href ng-click="vm.openRecipient(need)">{{ need._need.name }}</a>\n          </td>\n          <td>\n            <a href ng-click="vm.openReturnNeed(need)" ng-if="need.hasCommitment">Return</a>\n          </td>\n          <td>\n            <input type="checkbox" ng-click="vm.openCompleted($event, need)">\n          </td>\n        </tr>\n        </tbody>\n      </table>\n    </div>\n  </div>\n</div>');
$templateCache.put('dashboard/recipient-modal.html','<div class="modal-header">\n  <h4 class="modal-title">Recipient Need</h4>\n</div>\n<div class="modal-body">\n  <p class="lead">You are donating {{ vm.need.quantity }} {{ vm.need._need.name }}.</p>\n  <p><strong>Description</strong></p>\n  <p>{{ vm.need._need.description }}</p>\n  <p><strong>Requested By</strong></p>\n  <ul class="list-unstyled">\n    <li ng-bind="vm.getFullName(vm.need._recipient)"></li>\n    <li ng-bind="vm.getFullAddress(vm.need._recipient)"></li>\n    <li ng-bind="vm.need._recipient.phone_number || \'N/A\'" ng-if="vm.need._recipient.phone_number"></li>\n    <li ng-bind="vm.need._recipient.email || \'N/A\'" ng-if="vm.need._recipient.email"></li>\n  </ul>\n</div>\n<div class="modal-footer">\n  <button class="btn btn-primary" type="button" ng-click="vm.cancel()">OK</button>\n</div>');
$templateCache.put('dashboard/return-need-modal.html','<div class="modal-header">\n  <h4 class="modal-title">Return Need</h4>\n</div>\n<div class="modal-body">\n  <p class="lead">Do you want us to assign {{ vm.need.quantity }} {{ vm.need._need.name }} to someone else?</p>\n  <p><strong>Description</strong></p>\n  <p>{{ vm.need._need.description }}</p>\n</div>\n<div class="modal-footer">\n  <button class="btn btn-default" type="button" ng-click="vm.cancel()">No</button>\n  <button class="btn btn-primary" type="submit" ng-click="vm.ok()">Yes</button>\n</div>');
$templateCache.put('global/landing.html','<div class="middle-center">\n  <h1 class="logo landing">DC127</h1>\n  <!--<p class="lead">\n    Welcome to DC127\'s official site for exchanging resources. Here, you can post specific needs and fill requests that\n    others post. DC127 is a network, and we believe no one can can care for kids alone. We rely on wonderful volunteers\n    like you to connect parents, Host Homes, and Foster Families with the resources they need to successfully care for\n    children.\n  </p>-->\n  <a class="btn btn-primary" href ui-sref="log_in" ng-hide="vm.hasUser()">Log in</a>\n  <a class="btn btn-primary" href ui-sref="sign_up" ng-hide="vm.hasUser()">Sign up</a>\n  <a class="btn btn-primary" href ui-sref="app.dashboard" ng-show="vm.hasUser()">Continue to dashboard</a>\n</div>');
$templateCache.put('users/change-password.html','<div class="row">\n  <div class="col-lg-offset-4 col-lg-4">\n    <div class="panel panel-default">\n      <div class="panel-heading">\n        <h4 class="panel-title">Change password</h4>\n      </div>\n      <div class="panel-body">\n        <form name="form" novalidate ng-submit="vm.onSubmit()">\n          <div class="alert alert-danger" ng-if="vm.hasError()">{{ vm.error.detail }}</div>\n          <div class="form-group">\n            <label for="old-password">Old password:</label>\n            <input id="old-password" class="form-control" type="password" ng-model="vm.oldPassword" required>\n          </div>\n          <div class="form-group">\n            <label for="new-password">New password:</label>\n            <input id="new-password" class="form-control" type="password" ng-model="vm.newPassword" required>\n          </div>\n          <div class="form-group">\n            <label for="new-password-again">New password (again):</label>\n            <input id="new-password-again" class="form-control" type="password" ng-model="vm.newPasswordAgain" required>\n          </div>\n          <button class="btn btn-primary btn-block" type="submit"\n                  ng-disabled="vm.form.$invalid || !vm.passwordsMatch()">Change password</button>\n        </form>\n      </div>\n    </div>\n  </div>\n</div>');
$templateCache.put('users/log-in.html','<div class="row">\n  <div class="col-lg-offset-4 col-lg-4">\n    <div class="panel panel-default">\n      <div class="panel-heading">\n        <h4 class="panel-title">Log in</h4>\n      </div>\n      <div class="panel-body">\n        <form name="form" novalidate ng-submit="vm.onSubmit()">\n          <div class="alert alert-danger" ng-if="vm.hasError()">{{ vm.error.detail }}</div>\n          <div class="form-group">\n            <label for="username">Username:</label>\n            <input id="username" class="form-control" type="text" ng-model="vm.username" required>\n          </div>\n          <div class="form-group">\n            <label for="password">Password:</label>\n            <input id="password" class="form-control" type="password" ng-model="vm.password" required>\n          </div>\n          <button class="btn btn-primary btn-block" type="submit" ng-disabled="vm.form.$invalid">Log in</button>\n        </form>\n      </div>\n    </div>\n    <p class="text-center">Don\'t have an account? <a href ui-sref="sign_up">Sign up!</a></p>\n  </div>\n</div>');
$templateCache.put('users/profile-detail.html','<div class="row">\n  <div class="col-lg-offset-4 col-lg-4">\n    <div class="text-center">\n      <p style="font-size: 12px; margin-bottom: 10px; color: gray;"><em>Click image to edit</em></p>\n      <a href ui-sref="app.profile.edit">\n        <img class="img-circle center-block" ng-src="{{ vm.models.photo }}" width="160">\n      </a>\n      <div class="details-display">\n        <div ng-if="vm.selectedDetail === \'name\'">\n          <p>Hi, my name is</p>\n          <h4>{{ vm.models.full_name }}</h4>\n        </div>\n        <div ng-if="vm.selectedDetail === \'email\'">\n          <p>My email address is</p>\n          <h4>{{ vm.models.email }}</h4>\n        </div>\n        <div ng-if="vm.selectedDetail === \'address\'">\n          <p>My address is</p>\n          <h4>{{ vm.models.full_address || \'N/A\' }}</h4>\n        </div>\n        <div ng-if="vm.selectedDetail === \'phone\'">\n          <p>My phone number is</p>\n          <h4>{{ vm.models.phone_number || \'N/A\' }}</h4>\n        </div>\n      </div>\n      <ul class="details-list list-inline">\n        <li ng-mouseenter="vm.setSelectedDetail(\'name\')" ng-click="vm.setSelectedDetail(\'name\')">\n          <i class="fa fa-user"></i>\n        </li>\n        <li ng-mouseenter="vm.setSelectedDetail(\'email\')" ng-click="vm.setSelectedDetail(\'email\')">\n          <i class="fa fa-envelope"></i>\n        </li>\n        <li ng-mouseenter="vm.setSelectedDetail(\'address\')" ng-click="vm.setSelectedDetail(\'address\')">\n          <i class="fa fa-map-marker"></i>\n        </li>\n        <li ng-mouseenter="vm.setSelectedDetail(\'phone\')" ng-click="vm.setSelectedDetail(\'phone\')">\n          <i class="fa fa-phone"></i>\n        </li>\n      </ul>\n      <a href ui-sref="app.profile.change_password">Change password</a>\n    </div>\n  </div>\n</div>');
$templateCache.put('users/profile-edit.html','<div class="row">\n  <div class="col-lg-offset-4 col-lg-4">\n    <div class="panel panel-default">\n      <div class="panel-heading">\n        <h4 class="panel-title">Profile</h4>\n      </div>\n      <div class="panel-body">\n        <form name="form" novalidate ng-submit="vm.onSubmit()">\n          <div class="alert alert-danger" ng-if="vm.hasErrors()">Please correct the errors below.</div>\n          <div class="form-group">\n            <label>First name:</label>\n            <input class="form-control" type="text" ng-value="vm.models.first_name" ng-model="vm.models.first_name"\n                   required>\n          </div>\n          <div class="form-group">\n            <label>Last name:</label>\n            <input class="form-control" type="text" ng-value="vm.models.last_name" ng-model="vm.models.last_name"\n                   required>\n          </div>\n          <div class="form-group">\n            <label>Address:</label>\n            <input class="form-control" type="text" ng-value="vm.models.address_1" ng-model="vm.models.address_1"\n                   required>\n          </div>\n          <div class="form-group">\n            <label>Address (line 2):</label>\n            <input class="form-control" type="text" ng-value="vm.models.address_2" ng-model="vm.models.address_2">\n          </div>\n          <div class="form-group">\n            <label>City:</label>\n            <input class="form-control" type="text" ng-value="vm.models.city" ng-model="vm.models.city" required>\n          </div>\n          <div class="form-group" ng-class="{\'has-error\': vm.errorByField.state}">\n            <label>State:</label>\n            <input class="form-control" type="text" maxlength="2" ng-value="vm.models.state" ng-model="vm.models.state"\n                   required>\n            <span class="help-block" ng-repeat="error in vm.errorByField.state">{{ error }}</span>\n          </div>\n          <div class="form-group" ng-class="{\'has-error\': vm.errorByField.zip_code}">\n            <label>Zip code:</label>\n            <input class="form-control" type="text" ng-value="vm.models.zip_code" ng-model="vm.models.zip_code"\n                   required>\n            <span class="help-block" ng-repeat="error in vm.errorByField.zip_code">{{ error }}</span>\n          </div>\n          <div class="form-group" ng-class="{\'has-error\': vm.errorByField.phone_number}">\n            <label>Phone number:</label>\n            <input class="form-control" type="text" ng-value="vm.models.phone_number" ng-model="vm.models.phone_number"\n                   required>\n            <span class="help-block" ng-repeat="error in vm.errorByField.phone_number">{{ error }}</span>\n          </div>\n          <button class="btn btn-primary btn-block" type="submit" ng-disabled="vm.form.$invalid">Update</button>\n        </form>\n      </div>\n    </div>\n  </div>\n</div>');
$templateCache.put('users/sign-up.html','<div class="row">\n  <div class="col-lg-offset-4 col-lg-4">\n    <div class="panel panel-default">\n      <div class="panel-heading">\n        <h4 class="panel-title">Sign up</h4>\n      </div>\n      <div class="panel-body">\n        <form name="form" novalidate ng-submit="vm.onSubmit()">\n          <div class="form-group" ng-class="{\n            \'has-error\': vm.error.username,\n            \'has-feedback\': vm.error.username\n          }">\n            <label class="control-label">Username:</label>\n            <input class="form-control" type="text" ng-model="vm.username" required>\n            <span class="help-block" ng-if="vm.error.username">{{ vm.error.username[0] }}</span>\n          </div>\n          <div class="form-group">\n            <label>Email:</label>\n            <input class="form-control" type="text" ng-model="vm.email" required>\n          </div>\n          <div class="form-group">\n            <label>Password:</label>\n            <input class="form-control" type="password" ng-model="vm.password" required>\n          </div>\n          <div class="form-group">\n            <label>Password (again):</label>\n            <input class="form-control" type="password" ng-model="vm.passwordAgain" required>\n          </div>\n          <button class="btn btn-primary btn-block" type="submit" ng-disabled="vm.form.$invalid || !vm.passwordsMatch()">Sign up\n          </button>\n        </form>\n      </div>\n    </div>\n    <p class="text-center">Already have an account? <a href ui-sref="log_in">Log in!</a></p>\n  </div>\n</div>');}]);