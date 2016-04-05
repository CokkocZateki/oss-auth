Template.apiRow.helpers({
  characters: function() {
    return Characters.find({api:this._id});
  }
});

Template.apiRow.events({
  'click .updateApi': function() {
    Meteor.call('updateApi', this.keyID, function(err, res) {
      if (err) {
        Messenger().post({
          type:"error",   
          message: err    
        });
      }
    });
  }
});
