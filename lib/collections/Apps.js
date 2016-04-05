Apps = new Mongo.Collection("apps");

App = Astro.Class({
  name: 'App',
  collection: Apps,
  fields: { 
    name: 'string',
    description: {
      type: 'string',
      optional: true
    },
    url: {
      type: 'string',
      optional: true
    },
    redirect: {
      type: 'string',
      optional: true
    },
    scopes: {
      type: 'array',
      default: function() { return ['Username']; }
    },
    secret: {
      type: 'string',
      default: function() { return Meteor.uuid(); }
    },
    domain: {
      type: 'array',
      default: function() { return []; }
    }
  },
  events: {
  },
  methods: {
  },
  behaviors: ['timestamp']
});

Apps.allow({
  insert: function (userId, doc, fields, modifier) {
    return Meteor.hasRole(['Admin']);
  },
  update: function (userId, doc, fields, modifier) {
    return Meteor.hasRole(['Admin']);
  },
  remove: function (userId, user, fields, modifier) {
    return false;
  }
});