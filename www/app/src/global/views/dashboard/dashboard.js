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