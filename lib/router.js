Router.configure({
  layoutTemplate: 'default',
  loadingTemplate: 'loading',
  waitOn: function() {
    return Meteor.subscribe("init");
  }
});

var pageTitle = "OSS Auth";

onBeforeAction = function() {
  var user=Meteor.user()
  if (!user && !Meteor.isServer) {
    return this.render('login');
  } else if (user) { 
    this.next()
    this.render("header",{to:"header"});     
  }
}

checkApi = function() {
  var user=Meteor.user();
  if (user && !user.profile.main || !Apis.find({status: "OK"}).count()) {
    Notifications.insert({
          type: 'error',
          hideAfter: 30,
          showCloseButton: true,
          message: 'PLEASE ADD AN API',
          _u: Meteor.userId()
        });
    this.redirect('/api');
    this.next();
  } else {
    this.next();
  }
}

checkMain = function() {
  var user=Meteor.user();
  if (user && !user.profile.main) {
    Notifications.insert({
          type: 'error',  
          hideAfter: 30,
          showCloseButton: true,
          message: 'PLEASE SELECT YOUR MAIN CHARACTER',
          _u: Meteor.userId()
        });
    this.redirect('/api');
    this.next();
  } else {
    this.next();
  }
}

checkMember = function() {
  var user=Meteor.user();
  if (user && !user.hasRole("Member")) {
    Notifications.insert({
          type: 'error',
          hideAfter: 30,  
          showCloseButton: true,
          message: 'YOU ARE NOT AUTHED AS ALLIED OR ALLIANCE MEMBER, PLEASE REVIEW YOUR STANDINGS.',
          _u: Meteor.userId()
        });
    this.redirect('/api');
    this.next();
  } else {
    this.next();
  }
}

checkAdmin = function() {
  console.log("checkAdmin");
  if (Meteor.user() && Meteor.user().hasRole(["Admin", "Director"])) {
    this.next();
  } else {
    Router.go("/");
  }
}
Router.onBeforeAction(checkApi, {except: ['/api', "item",'api-authorize','api-addpushover','api-addpushbullet']});
Router.onBeforeAction(checkMain, {except: ['/api', "item",'api-authorize','api-addpushover','api-addpushbullet']});
Router.onBeforeAction(checkMember, {except: ['/api', 'external', '/', 'dashboard', "item",'api-authorize','api-addpushover','api-addpushbullet']});
Router.onBeforeAction(checkAdmin, {only: ['member', 'memberDetail']});
Router.onBeforeAction(onBeforeAction, {except: ["item",'api-authorize','api-addpushover','api-addpushbullet']}); 

Router.plugin('loading', {loadingTemplate: 'loading'});


Router.map(function() {
  this.route("/item/:id", {
    name: 'item',
    action: function() {
      console.log(this.params);
      var u={};
      if (this.request && this.request.cookies && this.request.cookies.meteor_login_token)
        u = Meteor.users.findOne({"services.resume.loginTokens.hashedToken": Accounts._hashLoginToken(this.request.cookies.meteor_login_token)});
      var i=invTypes.find({typeID: this.params.id}).fetch();
      if (!i.length) {
        var filters={typeName: { $regex: "^"+this.params.id+".*", $options: 'i'}, published: true};
        if (!this.params.query.price || !this.params.query.price=="exists") {
          filters.buy={$gt:0};
          filters.sell={$gt:0};
        }
        i=invTypes.find(filters, {limit: 100}).fetch();
      }
      if (!this.params.query.format) {
        var r="<html><head><style>pre{white-space: normal;}</style></head><body>"
        _.each(i, function(item) {
          _.each(_.pick(item, "typeName", "typeID", "buy", "sell", "description", "volume"), function(v,k) {
            r+="<h3>"+k+"</h3>\n";
            r+="<pre>"+v+"</pre>\n";
          });
          r+="<hr>";
        });
        r+="</body></html>";
        this.response.end(r); 
      } else if (this.params.query.format=="JSON") {
        this.response.end(JSON.stringify(i));
      }
    },
    where: 'server'
  });
});

/*
Router.route('/pap', function() {
  console.log(this.connection.httpHeaders);
  if (Meteor.isServer) {
    console.log(this.request.headers);
    Session.set("headers", JSON.stringify(this.request.headers));
  }
  this.render('pap');
});
*/
Router.route('/srp', function() {
  this.render('srp');
});

Router.route('/absences', {
  action: function() {
    this.render("absences")
  },
  waitOn: function() {
    return Meteor.subscribe("absences");
  },
  data: function() {
    return Absences.find();
  }
});

Router.route("/authorize/:_id", {
  layoutTemplate: 'singleton',
  onBeforeAction: function() {
    if (!this.data()) {
      Messenger().post({
          type:"error",
          message: "No valid APP ID!"
        });
      this.redirect("/");
    }
    console.log("onbeforeaction this", this, this.data(), Meteor.user().hasAuthorized(this.data()), this.params);
    var u=decodeURIComponent(this.params.query.r)||this.data().redirect;
    Session.set("redirectUrl", u);
    var auth=Meteor.user().hasAuthorized(this.data());
    if (auth) {
      var u=Session.get("redirectUrl")+auth.token;
      window.location=u;
    } else {
      this.next();
    }
  },
  action: function() {
    this.render("authorize");
  },
  waitOn: function() {
    return Meteor.subscribe("app", this.params._id);
  },
  data: function() {
    return Apps.findOne({_id: this.params._id});
  }
});

Router.route("/srp/:_id", {
  action: function() {
    this.render("srpDetail")
  },
  waitOn: function() {
    return Meteor.subscribe("srpDetail", this.params._id);
  },
  data: function() {
    return Reimbursements.findOne({_id: this.params._id});
  }
});  

Router.route('/api', {
  action: function() {
    this.render('api');
  },
  waitOn: function() {
    return Meteor.subscribe("apis");
  }
});

Router.route('/intel', {
  action: function() {
    this.render()
  }
});

Router.route('/timers', {
  action: function() {
    this.render()
  },
  waitOn: function() {
    return Meteor.subscribe("timers");
  }
});

Router.route('/pings', {
  action: function() {
    this.render()
  },
  waitOn: function() {
    return Meteor.subscribe("pings");
  }
});

Router.route('/member', {
  action: function() {
    this.render('member');
  },
  waitOn: function() {
    return Meteor.subscribe("members");
  },
  name: 'members.list',
  data: function() {
    var filter={};
    if (Meteor.user() && !Meteor.user().hasRole("Admin")) {   
      filter['roles.'+Meteor.user().group(true)]={"$in": ["Member"]};
    }
    return Meteor.users.find(filter, {sort: {username:1}});
  }
});

Router.route('/member/:_id', {
  name: 'memberDetail',
  action: function() {
    this.render('memberDetail');
  },
  waitOn: function() {
    return Meteor.subscribe("member", this.params._id);
  },
  data: function() {
    return Meteor.users.findOne({_id: this.params._id});
  }
});

Router.route('/character', {
  action: function() {
    this.render('character');
  },
  waitOn: function() {
    return Meteor.subscribe("characters");
  }
});

Router.route('/character/:_id', function() {
  this.render('characterDetail', {
    data: function() {
      return Characters.findOne({_id: this.params._id});
    }
  });
});

Router.route('/external', function() {
  this.render('external');
});

Router.route('/', {name:"dashboard"}, function() {
  document.title=pageTitle;
  this.layout('default');
  var user=Meteor.user();
  if (user) {
    this.render('dashboard');    
  } else {
    this.render('login');
  }
});
