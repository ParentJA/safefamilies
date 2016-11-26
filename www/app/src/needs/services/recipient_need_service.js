(function (window, angular, undefined) {

  'use strict';

  function recipientNeedService(Commitment, CommitmentStatus, RecipientNeed, RecipientNeedStatus) {
    var pendingNeeds = [];
    var receivedNeeds = [];
    var requestedNeeds = [];

    this.getPendingNeeds = function getPendingNeeds() {
      var needs = _.filter(RecipientNeed.getRecipientNeeds(), {status: RecipientNeedStatus.PENDING});
      var commitments = _.filter(Commitment.getCommitments(), {status: CommitmentStatus.ASSIGNED});
      var commitmentsByNeed = _.keyBy(_.values(commitments), 'recipient_need');

      _.forEach(needs, function (need) {
        need.hasCommitment = _.has(commitmentsByNeed, need.id);
        need._commitment = need.hasCommitment ? commitmentsByNeed[need.id] : null;
      });

      pendingNeeds = needs;

      return pendingNeeds;
    };

    this.getReceivedNeeds = function getReceivedNeeds() {
      receivedNeeds = _.filter(RecipientNeed.getRecipientNeeds(), {status: RecipientNeedStatus.RECEIVED});
      return receivedNeeds;
    };

    this.getRequestedNeeds = function getRequestedNeeds() {
      requestedNeeds = _.filter(RecipientNeed.getRecipientNeeds(), {status: RecipientNeedStatus.REQUESTED});
      return requestedNeeds;
    };
  }

  angular.module('safefamilies')
    .service('recipientNeedService', [
      'Commitment', 'CommitmentStatus', 'RecipientNeed', 'RecipientNeedStatus', recipientNeedService
    ]);

})(window, window.angular);