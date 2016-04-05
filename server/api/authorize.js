Router.route('/api/authorize', function() {
  console.log('/api/authorize', this.request.headers.authorization, this.request.headers['x-app-id']);
  var login;
  var authorized=false;
  if (this.request && this.request.headers && this.request.headers.authorization && (login=this.request.headers.authorization.split(":")) && login.length==2) {
    var user=Meteor.users.findOne({$or: [{username: login[0]}, {usernameNormalized: login[0]}]});
    if (!user) {
      console.log("FAILED API AUTH ATTEMPT", this.request.headers);
    } else {
      var digest=Package.sha.SHA256(login[1]);
      var result=Accounts._checkPassword(user, {digest: digest, algorithm: 'sha-256'});
      if (result.error==null) {
        authorized=user;
      } else {
        console.log("FAILED API AUTH ATTEMPT", this.request.headers);
      }
    }
  }
  if (this.request && this.request.headers && this.request.headers.authorization && this.request.headers['x-app-secret'] && this.request.headers['x-app-id']) {
    var app=Apps.findOne({_id: this.request.headers['x-app-id'], secret: this.request.headers['x-app-secret']});
    if (app) {
      var user=Meteor.users.findOne({authorizations: {$elemMatch: {token: this.request.headers.authorization}}});
      var a;
      if (user) a=user.hasAuthorized(app);
      if (a) {
        authorized=user;
      }
    }
  }
  if (authorized) {
    var result={}, main;
    var user=authorized;
    if (user.profile && user.profile.main)
      main=Characters.findOne({_id: user.profile.main});
    if (main) {
      user.corporationName=main.corporationName;
      user.corporationID=main.corporationID;
      user.allianceName=main.allianceName;
      user.allianceID=main.allianceID;
    }
    var chars=Characters.find({_u: user._id, hidden: {$ne: true}}).fetch();
    var ret=_.pick(user, "username", "usernameNormalized", "_id", "corporationName", "corporationID", "allianceName", "allianceID");
    var group=Corporations.findOne({ticker: user.group()}); //.raw();
    if (group) {
      ret.group=group.ticker;
      ret.groupName=group.corporationName;
      ret.groupType=group.type;
      ret.accessMask=group.accessMask;
      ret.roles=user.getRoles(true);
      ret.rolesNormalized=user.getRoles();
      ret.globalRolesNormalized=_.map(user.getRoles(true), function(r) { return group.type+"."+r;});
    }
    if (!ret.accessMask && Meteor.settings && Meteor.settings.public && Meteor.settings.public.publicJabber == 1) {
      ret.accessMask=1;
    }
    
    result.success = true;
    result.data = ret;
    if (main) result.main = _.pick(main, "_id", "characterID", "characterName","corporationName", "corporationID", "allianceID", "allianceName", "hidden");
    if (chars) result.characters = _.map(chars, function(c) { return _.pick(c, "_id", "characterID", "characterName", "corporationName", "corporationID", "allianceID", "allianceName", "hidden");});
    this.response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8'});
    this.response.end(
      JSON.stringify(result, null, 2)
    );
  } else {
    this.response.writeHead(401);
    this.response.end();
  }
}, {name:'api-authorize', where: 'server'});