Template.timerItem.helpers({
  canAdd: function() {
    if (Meteor.user().hasRole(["Director", "Associate Director", "Admin", "FC", "Diplomat","Recon"])) {
      return true;
    } else {
      return false;
    }
  }
});

Template.timerItem.events({
  'click .delete': function() {
    Meteor.call("deleteTimer", this._id, function(err) {
      if (err) alert(err.message);
    });
  }
});

Template.timerItem.onRendered(function() {
console.log(this, this.data);
  var due=this.data.due;
  this.$('.countdown').countdown(due, function(event) {
    $(this).text(
      event.strftime('%D days %H:%M:%S')
    );
  });
});