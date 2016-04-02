(function (window, angular, undefined) {

  "use strict";

  function loadNeeds($http, $q, BASE_URL, RecipientNeed) {
    return function () {
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
    .service("loadNeeds", ["$http", "$q", "BASE_URL", "RecipientNeed", loadNeeds]);

})(window, window.angular);