(function (window, angular, undefined) {

  "use strict";

  function DashboardController($scope, $uibModal, CommitmentResource, CommitmentStatus, commitments,
                               recipientNeedService, userProfile) {
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
        templateUrl: "global/views/assign_need_modal/assign_need_modal.html",
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
        templateUrl: "global/views/return_need_modal/return_need_modal.html",
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