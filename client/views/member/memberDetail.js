Template.memberDetail.helpers({
  roles: function() {
    return Roles.getAllRoles();
  },
  characters: function() {
    return Characters.find({_u: this._id});
  },
  exCharacters: function() {
    return Characters.find({oldUser: this._id});
  },
  apis: function() {
      return Apis.find({_u: this._id});
  },
  absences: function() {
    return Absences.find({_u: this._id});
  },
  reimbursements: function() {
    return Reimbursements.find({_u: this._id}, {sort: { killID: -1 }});
  }
});

Template.memberDetail.events({
  'click .addRole': function(event, template) {
    console.log(event);
    template.data.addRole(event.target.dataset.role);
  },
  'click .deleteRole': function(event, template) {
    console.log(template.data, this);
    template.data.removeRole(this);
  },
  'click .toggleRole': function(event, template) {
    console.log(template.data, this.name, this._id);
    Meteor.call("toggleRole", template.data._id, this.name);
  },
  'submit .addNote': function(event, template) {
    event.preventDefault();
    var note=template.$('[name=note]').val();
    template.data.push('notes', {note: note, editor: Meteor.user().username}); 
    template.data.save();
    template.$('[name=note]').val("");
  },
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