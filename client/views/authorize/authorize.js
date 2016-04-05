Template.authorize.helpers({
});

Template.authorize.events({
  'click .authorize': function() {
    console.log("this", this);
    Meteor.call('authorizeApp', this, function(err, res) {
      if (err) {
        Messenger().post({
          type:"error",
          message: err
        });
      }
      console.log(res);
      var u=Session.get("redirectUrl")+res.token;
      window.location=u;
    });
  }
});