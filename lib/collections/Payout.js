Payouts = new Mongo.Collection("payouts");

Payout = Astro.Class({
  name: 'Payout',
  collection: Payouts,
  fields: { 
    typeName: {
      type: 'string'
    },  
    typeID: 'string',
    bos: {
      type: 'number',
      default: 0
    },
    gsf: {
      type: 'number',
      default: 0
    }
  },
  events: {
  },
  methods: {
  },
  behaviors: ['timestamp']
});

Payouts.allow({
  insert: function (userId, doc, fields, modifier) {
    return false;
  },
  update: function (userId, doc, fields, modifier) {
    return Meteor.user().hasRole(['Admin','Director', 'SRP']);
  },
  remove: function (userId, user, fields, modifier) {
    return false;
  }
});