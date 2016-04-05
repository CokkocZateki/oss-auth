Template.dashboard.helpers({
  group: function() {
    return Meteor.user().group();
  },
  roles: function() {
    return Meteor.user().getRoles();
  },
  characters: function() {
    return Characters.find({hidden: {$not: true}, _u: Meteor.userId()}, {sort: {characterName: 1}});
  }
});
