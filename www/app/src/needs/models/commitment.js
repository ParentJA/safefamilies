(function (window, angular, undefined) {

  "use strict";

  function Commitment() {
    var commitments = {};

    this.getCommitmentById = function getCommitmentById(id) {
      return commitments[id];
    };

    this.getCommitments = function getCommitments() {
      return commitments;
    };

    this.removeDict = function removeDict(id) {
      delete commitments[id];
    };

    this.updateDict = function updateDict(data) {
      commitments[data.commitment.id] = data.commitment;
    };

    this.updateList = function updateList(data) {
      commitments = _.merge(commitments, _.keyBy(data.commitment, "id"));
    };
  }

  angular.module("safefamilies")
    .constant("CommitmentStatus", {
      ASSIGNED: "A",
      FINISHED: "F",
      RETURNED: "R"
    })
    .service("Commitment", [Commitment]);

})(window, window.angular);