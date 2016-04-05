Absences = new Mongo.Collection("absences");
Absence = Astro.Class({
  name: 'Absence',
  collection: Absences,
  fields: {
    _u: {
      type: 'string'
    },
    comment: {
      type: 'string'
    },
    start: {
      type: 'date',
      default: function() { return new Date();}
    },
    end: {
      type: 'date',
      default: function() { return new Date();}
    }
  },
  behaviors: ['timestamp']
}); 
Absences.allow({
  insert: function (userId, doc, fields, modifier) {
    return doc._u=userId || Meteor.user().hasRole(["FC", "Diplomat", "Director", "Admin"]);
  },
  update: function (userId, doc, fields, modifier) {
    return Meteor.user().hasRole(["FC", "Diplomat", "Director", "Admin"]);
  },
  remove: function (userId, user, fields, modifier) {
    return Meteor.user().hasRole(["FC", "Diplomat", "Director", "Admin"]);
  }
});
