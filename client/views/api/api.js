var ERRORS_KEY = 'apiErrors';

Template.api.created = function() {
  Session.set(ERRORS_KEY, {});
};

Template.api.helpers({
  apis: function() {
    return Apis.find({_u:Meteor.userId()},{sort: {keyID: -1}});
  },
  errorMessages: function() {
    return _.values(Session.get(ERRORS_KEY));
  },
  errorClass: function(key) {
    return Session.get(ERRORS_KEY)[key] && 'error';
  }
});

Template.api.events({
  'submit': function(event, template) {
    event.preventDefault();

    var KeyID = template.$('[name=KeyID]').val();
    var vCode = template.$('[name=vCode]').val();

    var errors = {};

    if (! KeyID) {
      errors.KeyID = 'KeyID is required';
    }

    if (! vCode) {
      errors.vCode = 'vCode is required';
    }

    Session.set(ERRORS_KEY, errors);
    if (_.keys(errors).length) {
      return;
    }

    Meteor.call('addApiKey', KeyID, vCode, function(error) {
      if (error) {
        return Session.set(ERRORS_KEY, {'none': error.reason});
      } else {
        template.$('[name=KeyID]').val('');
        template.$('[name=vCode]').val('');
      }
    });
  }
});
