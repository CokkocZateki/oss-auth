Template.timers.onRendered(function() {
    this.$('.datetimepicker').datetimepicker({format:"YYYY-MM-DD HH:mm:ss", defaultDate: moment()});
});

Template.timers.events({
  'click #addTimer': function (e) {
    $('#addTimerModal').modal("show");
  }
});

var ERRORS_KEY = 'timersErrors';

Template.timers.created = function() {
  Session.set(ERRORS_KEY, {});
};

Template.timers.helpers({
  timers: function() {
    return Timers.find({due: {$gte: new Date()}, deleted:{$exists: false}}, {sort: {due: -1}});
  },
  oldTimers: function() {
    return Timers.find({$or: [{due: {$lte: new Date()}}, {deleted:{$exists:true}}]}, {sort: {due: -1}});
  },
  errorMessages: function() {
    return _.values(Session.get(ERRORS_KEY));
  },
  errorClass: function(key) {
    return Session.get(ERRORS_KEY)[key] && 'error';
  },  
  canAdd: function() {
    if (Meteor.user().hasRole(["FC", "Diplomat", "Director"])) {
      return true;
    } else {
      return false;
    }
  }  
});

Template.addTimerModal.events({
  'submit': function(event, template) {
    event.preventDefault();

    var type = template.$('[name=type]').val();
    var system = template.$('[name=system]').val();
    var planet = template.$('[name=planet]').val();
    var moon = template.$('[name=moon]').val();
    var owner = template.$('[name=owner]').val();
    var time = template.$('[name=time]').val();
    var notes = template.$('[name=notes]').val();
    var notify = template.$('[name=notify]').val();  
    var post = template.$('[name=post]').val();
    var defensive = template.$('[name=defensive]').val();
    var formupBefore = template.$('[name=formupBefore]').val();
    var formupSystem = template.$('[name=formupSystem]').val();

    if (!type  || !system || !time) {
      Messenger().post({  
        type:"error",  
        message: 'Fields with * are required!'  
      }); 
      return;
    }

    Meteor.call('addTimer', type, system, planet, moon, owner, time, notes, notify, post, formupBefore, formupSystem, defensive, function(error, result) {
      if (error) {
        Messenger().post({
          type:"error",       
          message: error.error + " - " + error.reason 
        });  
      }
      else console.log(result)
      $('#addTimerModal').modal("hide");
    });
  }
});