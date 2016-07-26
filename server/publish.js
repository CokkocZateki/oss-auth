Meteor.publish("apis", function() {
  var user=Meteor.users.findOne(this.userId);
  if (user && (user.hasRole("Director") || user.hasRole("Associate Director"))) {
    return [Apis.find({
    },{
      transform: function(doc){
        doc.vCode=doc.vCode.replace(/./gi, "*");
        return doc;
      }   
    }),
    Characters.find({
      _u: this.userId
    })];
  } else if (this.userId) {
    return [Apis.find({
      _u: this.userId
    },{
      transform: function(doc){
        doc.vCode=doc.vCode.replace(/./gi, "*");
        return doc;
      }
    }),
    Characters.find({
      _u: this.userId
    })];
  } else {
    return this.ready();
  }
});

Meteor.publish("items", function() {
  var user=Meteor.users.findOne(this.userId);
  if (user && user.hasRole("Member")) {      
    return invTypes.find();
  } else {
    return this.ready();
  }
});

Meteor.publish("characters", function() {
  var user=Meteor.users.findOne(this.userId);
  if (user && (user.hasRole("Director") || user.hasRole("Associate Director"))) { 
    return Characters.find({
      corporationID: Characters.findOne(user.profile.main).corporationID
    });
  } else if (this.userId) {
    return Characters.find({
      _u: this.userId
    });
  } else {
    return this.ready();
  }
});

Meteor.publish("oldestsrp", function() {
  var user=Meteor.users.findOne(this.userId);
  if (user && (user.hasRole("Director") || user.hasRole("Associate Director"))) {
    return Reimbursements.find(
      {
        $and: [
          {status: "Open"},
          {group: user.group()}
        ]
      },
      {limit: 1, sort: {killID: 1}}
    );
  } else {
    return this.ready();
  }
});


Meteor.publish("srpDetail", function(_id) {
  var user=Meteor.users.findOne(this.userId);
  if (user && (user.hasRole(["SRP", "Director"]))) {
    return Reimbursements.find(
      {
        $and: [
          {_id: _id}//,
          //{group: user.group()}
        ]
      }
    );
  } else if (user && user.hasRole("Member")) {
    return Reimbursements.find({
      _u: this.userId,
      _id: _id
    });
  } else {
    return this.ready();
  }
});

Meteor.publish("reimbursements", function(limit) {
  var user=Meteor.users.findOne(this.userId);
  if (user && (user.hasRole(["SRP", "Director", "Associate Director"]))) {
    return Reimbursements.find(
      {
        //$and: [
          //{group: user.group()}
          //{$or: [{'victim.corporation.id_str': corp.corporationID}, {_u:this.userId}]}//,
          //{status: {$ne: "Paid" }}
        //]
      },
      {limit: limit, sort: {killID: -1}}
    );
  } else if (user && user.hasRole("Member")) {
    return Reimbursements.find({
      _u: this.userId
    },{
      limit: limit,
      sort: { killID: -1 }
    });
  } else {
    return this.ready();
  }
});

Meteor.publish("app", function(id) {
  var user=Meteor.users.findOne(this.userId);
  if (user && user.hasRole("Member")) {
    return Apps.find({_id: id}, {fields: {secret:0}});
  } else {
    return this.ready();
  }
});

Meteor.publish("member", function(id) {
  var user=Meteor.users.findOne(this.userId);
  if (user && (user.hasRole("Director") || user.hasRole("Associate Director"))) {
    var filter={};
    if (!user.hasRole("Admin")) {
      filter['roles.'+user.group(true)]={"$in": ["Member"]};
    }
    filter._id=id;
    var u=Meteor.users.findOne(filter);
    if (u) {
      return [
        Meteor.users.find(filter, {fields: {username: 1, 'profile.main': 1, 'profile.status': 1, roles: 1, notes:1, active: 1, createdAt: 1, updatedAt: 1, lastIp: 1, emails: 1}}),
        Absences.find({_u: id}),
        Apis.find({_u: id}), 
        Reimbursements.find({_u: id}, {sort: { killID: -1 }, limit: 10}),
        Characters.find({_u: id})
      ];
    } else {
      return this.ready();
    }
  } else {
    return this.ready();
  } 
});

Meteor.publish("membersPaged", function(username, limit) {
  var user=Meteor.users.findOne(this.userId);
  if (user) console.log("membersPaged", user.username, username, limit);
  if (user && (user.hasRole(["SRP", "Director", "Associate Director"]))) {
    var filter={};
    if (username) filter.username=new RegExp('.*' + username + '.*', 'i');
    if (!user.hasRole("Admin")) {
      filter['roles.'+user.group(true)]={"$in": ["Member"]};
    }
    var users=Meteor.users.find(
        filter,
        {
          limit: limit,
          sort: {username: 1},
          fields: {username: 1, 'profile.main': 1, 'profile.status': 1, roles: 1, notes:1, authorizations: 1, active: 1}
        }
      ) 
    return [
      users,
      Characters.find({_u : {$in: users.fetch().map(function(u) { return u._id; }) }})
    ];
  } else {
    return this.ready();
  }
});

Meteor.publish("members", function() {
  var user=Meteor.users.findOne(this.userId);
  if (user && user.hasRole(["Director", "Associate Director", "Admin"])) {
    var filter={};
    if (!user.hasRole("Admin")) {
      filter['roles.'+user.group(true)]={"$in": ["Member"]};
    }
    return [Meteor.users.find(filter, {fields: {username: 1, 'profile.main': 1, 'profile.status': 1, roles: 1, notes:1, authorizations: 1, active: 1}}),Characters.find()];
  } else {
    return this.ready();
  }
});

Meteor.publish('mapRegions', function(selector, options, collName) {
  options.fields = {
    regionName: 1,
    regionID: 1
  };
  Autocomplete.publishCursor(mapRegions.find(selector, options), this);
  this.ready();
});


Meteor.publish(null, function(){
  var user=Meteor.users.findOne(this.userId);
  if (user) {
    //var g=GeoIP.lookup(this.connection.clientAddress);
    console.log("is logedin: ", Meteor.users.findOne(this.userId).username, this.connection.clientAddress);
    return Notifications.find({
      shown: {$ne: true},
      $or: [
        //{roles: {$in: user.getRoles(true)}},
        {_u: this.userId}
      ]
    });
  } else {
    return this.ready();
  }
});

Meteor.publish('absences', function(){
  var user=Meteor.users.findOne(this.userId);
  if (user && (user.hasRole("Director") || user.hasRole("Associate Director"))) {
    return Absences.find({});
  } else {
    return Absences.find({
      _u: this.userId
    });
  }
});

Meteor.publish('pings', function(){
  var user=Meteor.users.findOne(this.userId);
  if (user && user.hasRole("Admin")) {
    return Pings.find({}, {sort: {date: -1}, limit: 20});
  } else {
    var c=user.getCorporation();
    if (c) 
    return Pings.find({
      $or: [
        {$and: [
          {groups: {$in: [c._id]}},
          {roles: {$in: user.getRoles(true)}}
        ]},
        {_u: this.userId}
      ]
    }, {sort: {date: -1}, limit: 20});
  } 
});

Meteor.publish(null, function(){
  var user=Meteor.users.findOne(this.userId);
  if (user && user.hasRole("Member")) {     
    return Payouts.find({});
  } else {
    return this.ready();
  }
});

Meteor.publish(null, function() {
  var user=Meteor.users.findOne(this.userId);
  if (user && user.hasRole("Admin")) {
    return Apps.find({});
  } else if (user && user.hasRole("Member")) {
    return Apps.find({name:"TS3"});
  } else {
    return this.ready();
  }
});
   
Meteor.publish('timers', function(){
  var user=Meteor.users.findOne(this.userId);
  if (user && user.hasRole("Member")) {      
    return Timers.find({deleted: {$ne: true}}, {sort: {due: -1}, limit: 50});
  } else {
    return this.ready();
  }
});   


Meteor.publish('init', function(){
  var user=Meteor.users.findOne(this.userId);
  if (user && user.hasRole("Member")) {      
    return [Meteor.users.find({_id: {$ne: this.userId}}, {fields: {username: 1, main: 1 }}), Apis.find({_u: this.userId}, {fields: {vCode: 0}}), Groups.find()];
  } else {
    return this.ready();
  }
});

Meteor.publish(null, function(){
  var user=Meteor.users.findOne(this.userId);
  if (user && user.hasRole("Member")) {
    return Meteor.users.find({_id :this.userId}, {fields: {username: 1, main: 1, 'external.pushover':1, 'external.pushbullet':1, authorizations: 1, profile: 1}});
  } else {
    return this.ready();
  }
});


Meteor.publish(null, function (){ 
  return [Meteor.roles.find({}), Corporations.find({}, {fields: {ticker: 1, type: 1, corporationID: 1, corporationName: 1, allianceName: 1, allianceID: 1, accessMask:1}})];
});
