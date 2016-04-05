Template.character.helpers({
  characters: function() {
    return Characters.find({corporationID: Characters.findOne(Meteor.user().profile.main).corporationID}, {sort: { characterName: 1}});
  }
});

Template.character.events({
  'click #listUnknow': function() {
    var unknown=Characters.find({_u: {$exists: false}, corporationID: Characters.findOne(Meteor.user().profile.main).corporationID}, {sort: {characterName: 1}}).fetch();
    $('#output').removeClass('hidden').val(_.map(unknown, "characterName").join('\n'));
  }
});