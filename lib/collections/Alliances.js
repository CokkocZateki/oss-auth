Alliances = new Mongo.Collection("alliances");

/*
{
        "_id" : ObjectId("56da13786d180d5b2fc8ca5e"),
        "name" : "Everto Rex Regis",
        "shortName" : "666",
        "allianceID" : "99000006",
        "executorCorpID" : "1983708877",
        "memberCount" : "3",
        "startDate" : "2010-11-04 13:11:00",
        "memberCorporations" : {
                "665335352" : {
                        "corporationID" : "665335352",
                        "startDate" : "2010-11-04 13:11:00"
                },
                "1983708877" : {
                        "corporationID" : "1983708877",
                        "startDate" : "2010-11-05 20:44:00"
                }
        }
}
*/

Alliance = Astro.Class({
  name: 'Alliance',
  collection: Alliances,
  fields: { 
    name: 'string',
    shortName: 'string',
    allianceID: 'string',
    executorCorpID: 'string',
    memberCount: 'string',
    startDate: 'string',
    memberCorporations: 'object'
  },
  events: {
  },
  methods: {
  },
  behaviors: ['timestamp']
});

Alliances.allow({
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