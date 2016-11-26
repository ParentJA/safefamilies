(function (window, angular, undefined) {

  'use strict';

  function DashboardController($scope, $uibModal, CommitmentResource, CommitmentStatus, commitments,
                               RecipientNeedResource, recipientNeedService, userProfile) {
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
        templateUrl: 'dashboard/views/assign_need_modal/assign_need_modal.html',
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
        templateUrl: 'dashboard/views/return_need_modal/return_need_modal.html',
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
        templateUrl: 'dashboard/views/recipient_modal/recipient_modal.html',
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
        templateUrl: 'dashboard/views/add_need_modal/add_need_modal.html',
        controller: 'AddNeedModalController',
        controllerAs: 'vm'
      });

      modalInstance.result.then(addNeed);
    };

    vm.openCompleted = function openCompleted(event, need) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'dashboard/views/completed_modal/completed_modal.html',
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
      '$scope', '$uibModal', 'CommitmentResource', 'CommitmentStatus', 'commitments', 'RecipientNeedResource',
      'recipientNeedService', 'userProfile', DashboardController
    ]);

})(window, window.angular);