Template.absences.onRendered(function() {
    this.$('.datetimepicker').datetimepicker({format:"YYYY-MM-DD HH:mm:ss", defaultDate: moment()});
});

Template.absences.events({
  'click #addAbsence': function (e) {
    $('#addAbsenceModal').modal("show");
  }
});

var ERRORS_KEY = 'absencesErrors';

Template.absences.created = function() {
  Session.set(ERRORS_KEY, {});
};

Template.absences.helpers({
  absences: function() {
    return Absences.find({$or: [{start: {$gte: new Date()}}, {end: {$gte: new Date()}}]}, {sort: {start: -1}});
  },
  oldAbsences: function() {
    return Absences.find({$and: [{start: {$lte: new Date()}}, {end: {$lte: new Date()}}]}, {sort: {start: -1}});
  },
  errorMessages: function() {
    return _.values(Session.get(ERRORS_KEY));
  },
  errorClass: function(key) {
    return Session.get(ERRORS_KEY)[key] && 'error';
  },  
  canAdd: function() {
    if (Meteor.user().hasRole(["Director"])) {
      return true;
    } else {
      return false;
    }
  }  
});

Template.addAbsenceModal.events({
  'submit': function(event, template) {
    event.preventDefault();

    var start = template.$('[name=start]').val();
    var end = template.$('[name=end]').val();
    var comment = template.$('[name=comment]').val();

    if (!start  || !end ) {
      Messenger().post({  
        type:"error",  
        message: 'Fields with * are required!'  
      }); 
      return;
    }
    
    console.log("start", start,"end",end);
    
    var absence = new Absence();
    absence.start=moment(start).toDate();
    absence.end=moment(end).toDate();
    absence._u=Meteor.userId();
    absence.comment=comment;
    absence.save(function(err) {
      if (err) console.log(err);
      $('#addAbsenceModal').modal("hide");
    });
  }
});