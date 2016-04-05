Template.external.events({
  'submit .setESA': function(e) {
    e.preventDefault();
    Session.set("inProgress", true);
    Meteor.call('setESP', $('#esp').val(), function(err, res) {
      if (err) {
        Session.set("inProgress", false);
      } else if (res) {
        Session.set("inProgress", false);
      }
    });
  },
  'submit .setTs3': function(e) {
    e.preventDefault();
    Session.set("inProgress", true);
    var a=Apps.findOne({name: "TS3"});
    Meteor.call('authorizeApp', a, $('#ts3').val(), function(err, res) {
      if (err) {
        Session.set("inProgress", false);
      } else if (res) {
        $('#ts3').val("");
        Session.set("inProgress", false);
      }
    });
  } 
});

Template.external.helpers({
  inProgress: function() {
    return Session.get("inProgress");
  },
  voice: function() {
    if (Meteor.user().hasRole("Member")) {
      return Corporations.findOne({ticker: Meteor.user().group()}).accessMask&2;
    } else {
      return Meteor.settings.public.publicVoice;
    }
  },
  jabber: function() {
    if (Meteor.user().hasRole("Member")) {
      return Corporations.findOne({ticker: Meteor.user().group()}).accessMask&1;
    } else {
      return Meteor.settings.public.publicJabber;
    }
  },
  teamspeak3Token: function() {
    var a=Apps.findOne({name: "TS3"});
    var t=Meteor.user().hasAuthorized(a);
    if (t) {
      return t.token;
    }
    return false;
  },
  esp: function() {
    return Meteor.user().profile.external.password.replace(/./gi, "*")
  }
});
