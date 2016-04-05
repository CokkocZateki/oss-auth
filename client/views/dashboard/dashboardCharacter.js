Template.dashboardCharacter.events({
  'click .hideChar': function(e) {
    console.log(this);
    Meteor.call('toggleCharacterVisibilty', this._id);
  },
  'click .mainChar': function(e) {
    Meteor.call('setMainCharacter', this._id);
  }
});
