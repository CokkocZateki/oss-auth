Template.member.helpers({
  characters: function() {
    return _.pluck(Characters.find({_u: this._id}).fetch(), "characterName");
  }
});