Template.apiCharacter.events({
  'click .hideChar': function(e) {
    console.log(this);
    Meteor.call('toggleCharacterVisibilty', this._id, function(err,res) {
      if (err) {
        Notifications.insert({
          type: 'error',
          message: err.details,
          _u: Meteor.userId()
        });
      }
    });
  },
  'click .mainChar': function(e) {
    Meteor.call('setMainCharacter', this._id, function(err,res) {  
      if (err) {
        Notifications.insert({
          type: 'error',
          message: err.details,   
          _u: Meteor.userId()
        });
      } else {
      }
    });
  }
});

Template.apiCharacter.helpers({
  isMain: function() {
    return Meteor.user().profile.main==this._id;
  }
});