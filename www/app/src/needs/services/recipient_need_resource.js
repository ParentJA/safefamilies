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