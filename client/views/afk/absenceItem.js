Template.absenceItem.helpers({
  canAdd: function() {
    if (Meteor.user().hasRole(["FC", "Diplomat", "Director", "Admin"])) {
      return true;
    } else {
      return false;
    }
  }
});

Template.absenceItem.events({
  'click .delete': function() {
    this.remove();
  }
});

Template.absenceItem.onRendered(function() {
  var due=this.data.due;
  this.$('.countdown').countdown(due, function(event) {
    $(this).text(
      event.strftime('%D days %H:%M:%S')
    );
  });
});