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