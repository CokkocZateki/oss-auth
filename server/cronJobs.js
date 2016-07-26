updateApis = function() {
  Apis.find({status: "OK"}).forEach(function(api) { Meteor.call("updateApi", api.keyID); });
};

if (!Meteor.settings.isDev) {
SyncedCron.add({
  name: "update apis",
  schedule: function(parser) {
    return parser.text('every 2 hours');
  },
  job: updateApis
});
}


updateAlliances = function() {
  var fut = new Future();
  ejs.fetch('eve:AllianceList', Meteor.bindEnvironment(function (err, res) {
    _.each(res.alliances, function(alliance) {
      Alliances.update({allianceID: alliance.allianceID}, alliance, {upsert: true});
    });
    fut.return();
  }));
  return fut.wait();
};
if (!Meteor.settings.isDev) {
SyncedCron.add({
  name: "update eve alliances",
  schedule: function(parser) {
    return parser.text('every 27 minutes');
  },
  job: updateAlliances
});
}

updateAccess = function() {
  if (!Meteor.settings.api || !Meteor.settings.access) {
    return new Meteor.Error("Please add a valid apis and access labels for contacts to your settings file");
  };
  var types = {
    "2": "Corporation",
    "1373": "Character",
    "1374": "Character",
    "1375": "Character",
    "1376": "Character",
    "1377": "Character",
    "1378": "Character",
    "1379": "Character",
    "1380": "Character",
    "1381": "Character",
    "1382": "Character",
    "1383": "Character",
    "1384": "Character",
    "1385": "Character",
    "1386": "Character",
    "16159": "Alliance"
  };
  var access=Meteor.settings.access;
  /*{
    AUTH_JABBER: 1,
    AUTH_VOICE: 2,
    AUTH_FORUM: 4
  };*/
  var cronID = Meteor.uuid();
  var fut = new Future();
  var corps={};
  ejs.fetch('char:ContactList', Meteor.settings.api, Meteor.bindEnvironment(function (err, res) {
    if (err) return fut.return();
    var labels=res.allianceContactLabels;
    _.each(res.allianceContactList, function(contact, key) {
      contact.labels = [];
      contact.accessMask = 0;
      _.each(labels, function(label) {
        if (contact.labelMask&label.labelID) {
          if (access[label.name]) {
            contact.accessMask=contact.accessMask+access[label.name];
          }
          contact.labels.push(label.name);
        }
      });
      contact.type=types[contact.contactTypeID];
      if (contact.type=="Corporation") {
        console.log("updating corporation", contact.contactName);
        corps[contact.contactID]={
          corporationID: contact.contactID,
          standing: contact.standing,
          labels: contact.labels,
          accessMask: contact.accessMask,
          inherited: false,
          type: "Allied"
        };
      } else if (contact.type=="Alliance") {
        var alliance = Alliance.findOne({allianceID: contact.contactID});
        console.log("updating alliance", contact.contactName, "found", _.size(alliance.memberCorporations), "member corps");
        _.each(alliance.memberCorporations, function(corporation) {
          console.log("updating alliance", contact.contactName, "pushing", corporation.corporationID);
          corps[corporation.corporationID]={
            corporationID: corporation.corporationID,
            standing: contact.standing,
            labels: contact.labels,
            accessMask: contact.accessMask,
            inherited: true,
            type: "Allied"
          };
        });
      }
    });
    if (Meteor.settings.allianceID) {
      var alliance = Alliance.findOne({allianceID: Meteor.settings.allianceID});
      console.log("updating own alliance", alliance.allianceName);
      _.each(alliance.memberCorporations, function(corporation) {
        corps[corporation.corporationID]={
          corporationID: corporation.corporationID,
          standing: 10,
          labels: ["Alliance"],
          accessMask: 7,
          inherited: true,
          type: "Alliance",
          deleteable: false
        };
      });
    }
    var upserted=0;
//    console.log("DEBUG CORP", corps["1585568229"]);
    async.forEachOfSeries(corps, function(corporation, id, cb) {
      hamster.fetch('corp:CorporationSheet', {corporationID: corporation.corporationID}, Meteor.bindEnvironment(function (err, res) {  
        if (res && res.corporationID && corporation.accessMask) {  // only insert corps with access
          corporation=_.defaults(res, corporation);
          console.log("adding", corporation.corporationName, corporation.accessMask);
          corporation.cronID=cronID;
          console.log("updateCorp", "corp:CorporationSheet", corporation.corporationID, res.ticker, "cached untill", res.cachedUntil); 
          var c=Corporations.upsert({corporationID: corporation.corporationID}, {$set: corporation});
          upserted++;
        } 
        if (err) {
          console.log("ERROR WITH CORP", corporation, err);
          cb(err);
        }
        cb();
      }));
    }, function(err) {
      if (!err && upserted) {
        var c=Corporations.find({cronID: {$ne: cronID}}).fetch();
        console.log("DELETEING", c);
        Corporations.remove({cronID: {$ne: cronID}});
      }
      fut.return(err);
    });
  }));
  return fut.wait();
};
if (!Meteor.settings.isDev) {
SyncedCron.add({
  name: "update alliance contacts",
  schedule: function(parser) {
    return parser.text('every 30 minutes');
  },
  job: updateAccess
});
}
Meteor.methods({
  updateAccess: updateAccess
});