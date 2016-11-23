(function (window, angular, undefined) {

  "use strict";

  function changePasswordService($http, $q, BASE_URL) {

    return function (oldPassword, newPassword) {
      var deferred = $q.defer();

      $http.post(BASE_URL + "users/change_password/", {
        old_password: oldPassword,
        new_password: newPassword
      }).then(function (response) {
        deferred.resolve();
      }, function (response) {
        console.error("Failed to change password.");
        deferred.reject(response.data);
      });

      return deferred.promise;
    };

  }

  angular.module("safefamilies").service("changePasswordService", ["$http", "$q", "BASE_URL", changePasswordService]);

})(window, window.angular);