Meteor.methods({
  authorizeApp: function(app, token) {
    if (this.userId) {
      var user=Meteor.users.findOne(this.userId);
      console.log("addAuthorization", user.username, app, token);
      return user.addAuthorization(app, token);
    } else {
      return "getfucked";
    }
  },
  registerPushover: function() {
    if (this.userId) {
      var user=Meteor.users.findOne(this.userId);
      var token=Meteor.uuid();
      console.log("user started pushover auth", this.userId);
      Meteor.users.update(this.userId, {$set:{'external.pushoverToken': token}});
      return token;
    } else {
      return "getfucked";
    }
  },
  registerPushbullet: function() {
    if (this.userId) {
      var user=Meteor.users.findOne(this.userId);
      var token=Meteor.uuid();
      console.log("user started pushbullet auth", this.userId);
      Meteor.users.update(this.userId, {$set:{'external.pushbulletToken': token}});
      return token;
    } else {
      return "getfucked";
    }
  },
  alwaysMobile: function() {
    if (this.userId) {
      var user=Meteor.users.findOne(this.userId);
      console.log("user receives always mobile", user.username, "maybe");
      var setting=user.external.alwaysmobile||false;
      Meteor.users.update(this.userId, {$set:{'external.alwaysmobile': !setting, 'profile.alwaysmobile': !setting}});
      return true;
    } else {
      return "getfucked";
    }
  }, 
  sendPing: function(groups, roles, priority, message) {
    if (Meteor.user().hasRole(['Ping', 'Director'])) {
      Pings.insert({
        _u: this.userId,
        type: "ping",
        roles: roles,
        groups: groups,
        status: "New",
        message: message,
        priority: priority,
        date: new Date()
      });
    } else {
      throw new Meteor.Error("Error #0815", "Not allowed");
    }
  },
  getSRPStats: function(special) {
    if (!special && (Meteor.userId() || Meteor.user() && Meteor.user().hasRole(['SRP', 'Director']))) {
      var losers=Reimbursements.aggregate([
        {
          $match : {
            _u: {$exists:1},
            status: "Paid", 
            killTime:{$gte: moment().startOf('month').toDate(), $lte: moment().endOf('month').toDate()}
          }
        },
        {
          $group: {
            _id: "$_u",
            count: {$sum: 1}, 
            gsf: {$sum: "$gsf"},
            total: {$sum: "$paid"}
          }
        },    
        {
          $sort: {   
            total: -1
          }
        }  
      ]);
      for (var loser in losers) {
        var user=Meteor.users.findOne(losers[loser]._id);
        //console.log(user.username, losers[loser]);
        losers[loser].username=user.username;
      }
      return losers;
    } else if (special) {
      console.log("special", special);
      var losers=Reimbursements.aggregate([
        {
          $match : {
            _u: {$exists:1},
            status: "Paid", 
            killTime:{$gte: moment(special).startOf('month').toDate(), $lte: moment(special).endOf('month').toDate()}
          }
        },
        {
          $group: {
            _id: "$_u", 
            count: {$sum: 1},
            gsf: {$sum: "$gsf"},
            total: {$sum: "$paid"}
          }
        },
        {
          $sort: {
            total: -1
          }
        }
      ]);
      for (var loser in losers) {
        var user=Meteor.users.findOne(losers[loser]._id);
        //console.log(user.username, losers[loser]);
        losers[loser].username=user.username;
      }
      return losers;
    } else {
      return [];
    }
  },
  processSRP: function (id, status, payout, comment, next) {
    console.log(id, status, payout, comment, next);
    payout=parseInt(payout);
    var old=Reimbursements.findOne(id);
    if (old.payout!=payout) comment+="Payout changed manually from "+old.payout+" to "+payout+"\n";
    if (old && Meteor.user().hasRole(['SRP', 'Director']) && old.status=="Open") {
      var done = Reimbursements.update({_id: id}, {$set: {
        status: status,
        comment: comment,
        paid: (status=="Paid"?payout:0),
        _editor: Meteor.userId(),
        _edited: new Date()
      }});
      Notifications.insert({
        type: (status=="Paid"?'success':'info'),
        message: 'Your SRP '+old.killID+' has been updated to '+status+' by '+Meteor.user().username,
        _u: old._u
      });
      if (next) {
        var next = Reimbursements.findOne({status: "Open"}, { sort: {killID: 1 }});
        if (next) {
          console.log(done, next._id);
          return {next: "/srp/"+next._id};
        } else {
          return {next: "/srp"};
        }
      } else {
        console.log(done);
        return {next: "/srp"};
      }
    } else {
      throw new Meteor.Error("Error #0815", "Not allowed or SRP already processed");
    }
  },
  nextSRP: function() {
    var next = Reimbursements.findOne({status: "Open"}, { sort: {killID: 1 }});
    if (next) {
      console.log(next._id);
      return {next: "/srp/"+next._id};
    } else {
      return {next: null};
    }
  },
  deleteTimer: function(timer) {
    console.log(this.userId, "deletes timed", timer);
    if (Meteor.user().hasRole(['FC', 'Diplomat', 'Director'])) {
      Timers.update(timer, {$set: {deleted: this.userId}});
    } else {
      throw new Meteor.Error("Error #0815", "Not allowed");
    }
  },
  addTimer: function(type, system, planet, moon, owner, time, notes, notify, post, formupBefore, formupSystem, defensive) {
    if (Meteor.user().hasRole(['FC', 'Diplomat', 'Director'])) {
      var due=moment.utc(time).toDate();
      var formup=due;
      if (formupBefore) {
        formup=moment(due).utc().subtract(formupBefore, "minutes").toDate();
      }
      var timer=Timers.insert({
        _u: this.userId,
        due: due,
        type: type,
        system: system,
        planet: planet,
        moon: moon,
        owner: owner,
        notes: notes,
        notify: notify,
        post: post,
        defensive: defensive,
        formupSystem: formupSystem,
        formupBefore: formupBefore
      });
      var attackType="Attack";
      if (defensive) attackType="Defend";
      if (post && Meteor.settings.forum && Meteor.settings.forum.url) {
        var a=Apps.findOne({name: "The OSS Forums"});
        var t=Meteor.user().hasAuthorized(a);
        var content="#### Notes: \n"+notes;
        if (system) content="System: "+system+"\n"+content;
        if (planet) content="Planet: "+planet+"\n"+content;
        if (moon) content="Moon: "+moon+"\n"+content;
        if (owner) content="Owner: "+owner+"\n"+content;
        if (due) content="Timer: "+moment(due).utc().format("YYYY-MM-DD HH:mm")+" EVE\n"+content;
        if (due!=formup) content="### Formup: "+moment(formup).utc().format("YYYY-MM-DD HH:mm")+" EVE\n"+content;
        if (system!=formupSystem && formupSystem) content="### Formup System: "+formupSystem+"\n"+content;
        
        if (t && t.token) {
          HTTP.post(Meteor.settings.forum.url, {
            headers: {
              Authorization: "Bearer "+t.token
            },
            data: {
              cid: Meteor.settings.forum.categories.ops,
              title: moment(formup).utc().format("YYYY-MM-DD HH:mm")+" "+attackType+" "+type+" "+system,
              content: content+"\n #### Posted automagically from OSS Auth."
            }
          });
          return timer;
        }
      }
      return timer;
    } else {
      throw new Meteor.Error("Error #0815", "Not allowed");
    }
  },
  toggleCharacterVisibilty: function (char) {
    var c = Characters.findOne(char);
    if (c._u!=Meteor.userId()) {
      throw new Meteor.Error("Error #0815", "You do not own this character");
    }
    var v = !c.hidden;
    Characters.update(char, {$set: { hidden: v }});
  },
  setMainCharacter: function (char) {
    var c = Characters.findOne(char);
    if (c._u!=Meteor.userId()) {
      throw new Meteor.Error("Error #0815", "You do not own this character");
    }
    var corp = Corporations.findOne({corporationID: c.corporationID});
    if (Meteor.user() && Meteor.user().group() && Meteor.user().hasRole("Member") && !corp) {
      throw new Meteor.Error("Error #0815", "Character not in an allowed corporation for OMEGA Member");
    }
    Meteor.users.update({_id:Meteor.user()._id}, {$set:{username: c.characterName, usernameNormalized: c.characterName.toLowerCase().replace("'","").replace(/ /g,"_"), "profile.main":c._id}});
    Notifications.insert({
          type: 'success',
          message: 'Main character set to '+c.characterName+", please reset your ESA password!",
          _u: Meteor.userId()
    });
  },
  addApiKey: function (keyID, vCode) {
    if (!Meteor.userId()) 
      throw new Meteor.Error("Error #1337", "Not authorized");
    Apis.upsert({keyID: keyID}, {$set: {keyID: keyID, vCode: vCode, _u: Meteor.userId()}});
    Meteor.call('updateApi', keyID);
  },
  updateApi: function (keyID) {
    var api = Apis.findOne({keyID: keyID});
    if (!api) { // || (api._u!=Meteor.userId())) {
      throw new Meteor.Error("Error #1337", "Not authorized");
    }
    var Future = Npm.require("fibers/future");
    var fut = new Future();
    hamster.fetch('account:APIKeyInfo', {keyID: api.keyID, vCode: api.vCode}, Meteor.bindEnvironment(function (err, res) {
      if (res) {
        Apis.update(api._id, {$set: {cachedUntil: res.cachedUntil}});
      }
      var userCharacters=[];
      
      if (err) {
        console.log("error", err.message, api);
        Notifications.insert({
          type: 'error',
          message: 'API invalid/expired!',
          _u: api._u
        });
        Characters.update({api: api._id}, {$set: {_u: null, oldUser: api._u}}, {multi:true}); // invalidate accounting
        Apis.update(api._id, {$set: {status: "API invalid/expired!", grants: null}});
        fut.return({status: "API invalid/expired"});
      } else if (res.accessMask&"268435455"!="268435455" && res.accessMask!="50725130" && res.accessMask!="0") {
        console.log("api expired", api.keyID);
        Apis.update(api._id, {$set: {status: 'Invalid AccessMask', expires: res.expires||false, accessMask: res.accessMask, type: res.type, grants: null}});
        Notifications.insert({
          type: 'error',
          message: 'Invalid AccessMask, you need to provide FULL (268435455) for OSS members or (50725130) for Allied API keys for your accounts.',
          _u: api._u
        });
        Characters.update({api: api._id}, {$set: {_u: null, oldUser: api._u}}, {multi:true}); // invalidate accounting        
        fut.return({status: "Invalid AccessMask"});        
      } else if (res.type!="Account" && res.accessMask!="0") {
        console.log("wrong Type", api.keyID, res.type);
        Apis.update(api._id, {$set: {status: 'KeyType needs to be Account', expires: res.expires||false, accessMask: res.accessMask, type: res.type, grants: null}});
        Notifications.insert({
          type: 'error',
          message: 'Invalid KeyType, you need to provide >Account< API Keys for your accounts.',
          _u: api._u
        });
        Characters.update({api: api._id}, {$set: {_u: null, oldUser: api._u}}, {multi:true}); // invalidate accounting        
        fut.return({status: "Invalid KeyType"});
      } else {
        console.log("api ok", api.keyID);
        fut.return({status: 'OK'});
        Apis.update(api._id, {$set: {status: 'OK', expires: res.expires||false, accessMask: res.accessMask, type: res.type}});
        Notifications.insert({
          type: 'info',                
          message: 'API valid!',                                                                       
          _u: api._u                                              
        });
        var chars = res.characters;
        for (var c in chars) {
          //console.log(chars[c]);
          var corp=Corporations.findOne({corporationID: chars[c].corporationID});
          if (corp) {
            console.log("api ok", api.keyID, "FOUND MEMBER CHAR", chars[c].characterName);
            var roles = ['Member'];
            var char=Characters.findOne({characterID: chars[c].characterID});
            if (char && char._u!=api._u) {
              Notifications.insert({
                type: 'success',
                message: 'Added new character ('+char.characterName+') to your account.',
                _u: api._u
              });
            }
            /* TODO: replace with a better solution
            _.each(Meteor.settings.public.corp.adminRoles, function(role) {
              if (char && char.titles && _.contains(_.keys(char.titles), role.id)) {
                console.log("Character",char.characterName,"has admin role",role.name);
                roles.push(role.name);
              }
            });
            */
            Apis.update(api._id, {$set: {grants: corp.ticker}});
            var u=Meteor.users.findOne(api._u);
            u.setRoles(corp.ticker, roles);
            console.log("api ok", api.keyID, "user", u.username, u.roles);
            userCharacters.push(chars[c]);
          }
          chars[c].api = api._id;
          chars[c]._u = api._u;
          Characters.upsert({characterID: chars[c].characterID}, {$set: chars[c]});
        }
      }
      // check if user has still valid chars else remove roles
      var user=Meteor.users.findOne({_id:api._u});
      if (userCharacters.length || Apis.find({_u: api._u, status:'OK', grants: user.group()}).count()) {
        // ok survived
      } else {
        console.log("api rip", api.keyID, "User has no valid APIS:", user.username);
        if (user.group()) {
          user.resetRoles();
          Notifications.insert({
            type: 'error',
            message: 'All your Roles have been striped as you have no valid APIs and characters in the corporation.',
            _u: api._u
          });
        }
      }
    }));
    return fut.wait();
  },
  requestSRP: function (crest, broadcast) {
    check(crest, String);
    try {
      var c=HTTP.get(crest);
    } catch (e) {
      throw new Meteor.Error("Error #1337", "Crest link defunct or API down");
    }
    if (c.statusCode!=200) {
      throw new Meteor.Error("Error #1337", "Crest link defunct");
    }
    var killmail = JSON.parse(c.content);
    if (killmail.killTime<"2014-09-01 00:00:00") {
      throw Meteor.Error("Error #1337", "You can't post killmails from before 2015-09-01 00:00:00");
    }
    var c = Characters.findOne({ characterID: killmail.victim.character.id_str});
    if (!c || c._u!=Meteor.userId()) {
      throw new Meteor.Error("Error #1337", "Please assign the Character ("+killmail.victim.character.name+") to your Account by adding its API.");
    }
    var corp = Corporations.findOne({corporationID: killmail.victim.corporation.id_str});
    if (!corp) {
      throw new Meteor.Error("Error #1337", "Character is not in an allowed Corporation");
    }
    killmail.killTime = new Date(killmail.killTime);
    killmail._u = Meteor.userId();
    killmail.group = Meteor.user().group();
    killmail.status = "Open";
    killmail.crest = crest;
    killmail.broadcast = broadcast;
    killmail.loss = calculateLoss(killmail);
    var payout = Payouts.findOne({typeID: killmail.victim.shipType.id_str});
    if (payout) killmail.gsf = payout.gsf;
    if (payout && killmail.loss<payout.gsf) {
      killmail.status="Paid";
      killmail.paid=0;
      killmail.comment="Autopaid - GSF SRP covers loss.";
      killmail._editor=Meteor.userId();
      killmail._edited= new Date();
    }
    var r= Reimbursements.findOne({killID: killmail.killID})
    if (!r) {
      Reimbursements.insert(killmail);
    } else {
      throw new Meteor.Error("Error #1337", "SRP allready requested for this Killmail.");
    }
  }
});

calculateLoss = function(srp) {
  var flags=[11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,87,92,93,94,95,96,97,98,99,125,126,127,128,129,130,131,132];
  
  var items = {};
  items[srp.victim.shipType.id]=1;
  _.each(srp.victim.items, function(item) {
    if (_.contains(flags, item.flag)) {
      items[item.itemType.id] = items[item.itemType.id]||0;
      items[item.itemType.id] += (item.quantityDropped||0)+(item.quantityDestroyed||0);
    }
  });
  var total=0.0;
  _.each(items, function(v,k) {
    var item=invTypes.findOne({ typeID: k});
    //console.log(v,k,item)
    total = total + item.sell*v;
  });
  return total;
} 