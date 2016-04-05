var Schemas = {};
Internal = new Mongo.Collection("internals");
Intel = new Mongo.Collection("intel");
Notifications = new Mongo.Collection("notifications");
invTypes = new Mongo.Collection("invTypes");
invGroups = new Mongo.Collection("invGroups");
invFlags = new Mongo.Collection("invFlags");
mapSolarSystems = new Mongo.Collection("mapSolarSystems");
mapRegions = new Mongo.Collection("mapRegions");
Fleets = new Mongo.Collection("fleets");
Apis = new Mongo.Collection("apis");
Timers = new Mongo.Collection("timers");
Pings = new Mongo.Collection("pings");
Characters = new Mongo.Collection("characters",
      {transform: function(doc) {
        var user = Meteor.users.findOne(doc._u);
        if (user) doc.username = user.username;
        if (user && user.profile && user.profile.main==doc._id) doc.isMain=true;
        return doc;
      }}
);
Corporations = new Mongo.Collection("corporations");
Reimbursements = new Mongo.Collection("reimbursements",
      {transform: function(doc) {
        //var item = invTypes.findOne({invType: doc.victim.shipType.id_str});
        //console.log("found item",item);
        if (true) {
          var payout = Payouts.findOne({
            $or: [
              //{ groupID: item.groupID },
              { typeID: doc.victim.shipType.id_str }
            ]
          });
          if (payout) {
            var p=doc.loss-payout.gsf;
            p = Math.ceil(parseInt(p)/1000000)*1000000;

            if (p>=payout.bos) {
              p=payout.bos;
            }
            doc.payout = p;
            doc.gsf = payout.gsf;
            doc.bos = payout.bos
            doc.max = payout.gsf+payout.bos;
          }
          if (doc.paid || doc.status!="Open") {
            doc.payout=doc.paid||0;
          }
        }
        if (doc._editor) {
          var editor = Meteor.users.findOne(doc._editor);
          if (editor)
            doc.editor=editor.username;
        }
        var user = Meteor.users.findOne(doc._u);
        if (user) doc.username = user.username;
        return doc;
      }}
);

Reimbursements.allow({
  insert: function () {
    return false;
  },
  update: function () {
    return false;
  },
  remove: function () {
    return false;
  }
});

Notifications.allow({
  update: function() {
    return true;
  }
});

Characters.before.update(function(userId, doc, fieldNames, modifier, options) {
  modifier.$set = modifier.$set || {};
  modifier.$set.modifiedAt = Date.now();
});
Characters.before.insert(function(userId, doc) {
  doc.createdAt = Date.now();
});

Reimbursements.before.update(function(userId, doc, fieldNames, modifier, options) {
  modifier.$set = modifier.$set || {};
  modifier.$set.modifiedAt = Date.now();
});
Reimbursements.before.insert(function(userId, doc) {
  doc.createdAt = Date.now();
});

Apis.before.update(function(userId, doc, fieldNames, modifier, options) {
  modifier.$set = modifier.$set || {};
  modifier.$set.modifiedAt = Date.now();
});
Apis.before.insert(function(userId, doc) {
  doc.createdAt = Date.now();
});

Apis.allow({
  remove: function (userId, doc) {
    // can only remove your own documents
    return false;
  },
  fetch: ['_u']
});