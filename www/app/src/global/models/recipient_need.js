(function (window, angular, undefined) {

  "use strict";

  function RecipientNeed() {
    var needs = {};
    var recipients = {};
    var recipientNeeds = {};

    function build() {
      _.forEach(recipientNeeds, function (recipientNeed) {
        recipientNeed._recipient = recipients[recipientNeed.recipient];
        recipientNeed._need = needs[recipientNeed.need];
      });
    }

    this.getRecipientNeeds = function getRecipientNeeds() {
      return recipientNeeds;
    };

    this.getRecipientNeedById = function getRecipientNeedById(id) {
      return recipientNeeds[id];
    };

    this.updateDict = function updateDict(data) {
      if (!_.isUndefined(data.need)) {
        needs[data.need.id] = data.need;
      }

      if (!_.isUndefined(data.recipient)) {
        recipients[data.recipient.id] = data.recipient;
      }

      if (!_.isUndefined(data.recipient_need)) {
        recipientNeeds[data.recipient_need.id] = data.recipient_need;
      }

      build();
    };

    this.updateList = function updateList(data) {
      if (!_.isUndefined(data.need)) {
        needs = _.merge(needs, _.keyBy(data.need, "id"));
      }

      if (!_.isUndefined(data.recipient)) {
        recipients = _.merge(recipients, _.keyBy(data.recipient, "id"));
      }

      if (!_.isUndefined(data.recipient_need)) {
        recipientNeeds = _.merge(recipientNeeds, _.keyBy(data.recipient_need, "id"));
      }

      build();
    };
  }

  angular.module("safefamilies")
    .constant("RecipientNeedStatus", {
      PENDING: "PEN",
      RECEIVED: "REC",
      REQUESTED: "REQ"
    })
    .service("RecipientNeed", [RecipientNeed]);

})(window, window.angular);