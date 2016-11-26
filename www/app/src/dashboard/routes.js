(function (window, angular, undefined) {

  'use strict';

  function DashboardRouterConfig($stateProvider) {
    $stateProvider.state('app.dashboard', {
      url: '/dashboard',
      templateUrl: 'dashboard/views/dashboard/dashboard.html',
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