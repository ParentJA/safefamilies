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