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