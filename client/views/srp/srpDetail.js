Template.srpDetail.events({
  'click .process': function(e, t) {
    var status = $(e.target).val();
    console.log(status);
    var payout = t.$('[name=payout]').val();
    var next = t.$('[name=next]').is(':checked');
    var comment = t.$('[name=comment]').val();
    Meteor.call("processSRP", this._id, status, payout, comment, next, function(err, res) {
      if (err) {
        Messenger().post({
          type:"error",
          message: err
        });
      } else {
        Router.go(res.next);
      }
    });
  } 
});
   
Template.srpDetail.helpers({
  lossDNA: function() {
    if (this.victim)
      return DNA(this.victim.shipType.id, this.victim.items);
  },
  statusclass: function() {
    if (this.status=="Open") {
      return "info";
    } else if (this.status=="Declined") {
      return "warning";
    } else if (this.status=="Paid") {
      return "success";
    }
  },
  processable: function() {
    if (Meteor.user().hasRole(["SRP","Director"]) && this.status=="Open") {
      return true;
    } else {
      return false;
    }
  }
});  
