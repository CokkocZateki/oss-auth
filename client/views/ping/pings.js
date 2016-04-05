Template.pings.onRendered(function() {
    this.$('.datetimepicker').datetimepicker({format:"YYYY-MM-DD HH:mm:ss", defaultDate: moment()});
});

Template.pings.events({
  'click .selectType': function (e) {
    console.log(e);
    if (Session.get("selectedType_"+e.target.id)) {
      Session.set("selectedType_"+e.target.id, 0);
      $(e.target).removeClass('btn-success');
      $('select[name=groups] option[data-type='+e.target.id+']').attr('selected',false);
    } else {
      Session.set("selectedType_"+e.target.id, 1);
      $(e.target).addClass('btn-success');
      $('select[name=groups] option[data-type='+e.target.id+']').attr('selected',true);
    }
  },
  'click #createPing': function (e) {
    $('#pingModal').modal("show");
  }, 
  'click #alwaysMobile': function (e) {
    Meteor.call("alwaysMobile", function(err, success) {
    });
  },
  'click #registerPushover': function (e) {
    Meteor.call("registerPushover", function(err, token) {
      window.open("https://pushover.net/subscribe/OSSAuth-e7dHwCC2esPJkVN"+"?success="+encodeURIComponent("https://auth.oss.rocks/api/addPushover/"+token));
//      console.log("https://pushover.net/subscribe/OSSAuth-e7dHwCC2esPJkVN"+"?success="+encodeURIComponent("https://auth.oss.rocks/api/addPushover/"+token));
    });
  },
   'click #registerPushbullet': function (e) {
    Meteor.call("registerPushbullet", function(err, token) {
      window.open("https://www.pushbullet.com/authorize?client_id=9MM7Y0g495GsVZ9CcgIvGKUP4t81VJQL&redirect_uri="+encodeURIComponent("https://auth.oss.rocks/api/addPushbullet?token="+token)+"&response_type=code");
//      console.log("https://www.pushbullet.com/authorize?client_id=9MM7Y0g495GsVZ9CcgIvGKUP4t81VJQL&redirect_uri="+encodeURIComponent("https://auth.oss.rocks/api/addPushbullet?token="+token)+"&response_type=code");
    });
  }
});

var ERRORS_KEY = 'pingsErrors';

Template.pings.created = function() {
  Session.set(ERRORS_KEY, {});
};

Template.pings.helpers({
  alwaysMobile: function() {
    return Meteor.user().profile.alwaysmobile;
  },
  hasMobile: function() {
    return Meteor.user().profile.pushover||Meteor.user().profile.pushbullet;
  },
  hasPushover: function() {
    return Meteor.user().profile.pushover;
  },
  hasPushbullet: function() {
    return Meteor.user().profile.pushbullet;
  },
  pings: function() {
    return Pings.find({}, {sort: {date: -1}, limit: 20});
  },
  errorMessages: function() {
    return _.values(Session.get(ERRORS_KEY));
  },
  errorClass: function(key) {
    return Session.get(ERRORS_KEY)[key] && 'error';
  },  
  canPing: function() {
    if (Meteor.user().hasRole(["Ping", "Director"])) {
      return true;
    } else {
      return false;
    }
  }  
});

Template.pingModal.helpers({
  corporations: function() {
    return Corporations.find({}, {sort: {type:1, corporationName:1}});
  },
  roles: function() {
    return Roles.getAllRoles();
  }
});

Template.pingModal.events({
  'submit': function(event, template) {
    event.preventDefault();
    var groups = template.$('[name=groups]').val();
    var roles = template.$('[name=roles]').val();
    var message = template.$('[name=message]').val();
    var priority = template.$('[name=priority]').val();

    if (!priority  || !groups || !roles || !message) {
      Messenger().post({  
        type:"error",  
        message: 'Fields with * are required!'  
      }); 
      return;
    }

    Meteor.call('sendPing', groups, roles, priority, message, function(error) {
      if (error) {
        Messenger().post({
          type:"error",       
          message: error.error + " - " + error.reason 
        });  
      }
      $('#pingModal').modal("hide");
    });
  }
});