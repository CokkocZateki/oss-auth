Router.route('/api/addPushbullet', function() {
//this.params.query
//this.params.token
  console.log("user trying to end pushbullet reg", this.params.query, this.params);
  var user=Meteor.users.findOne({'external.pushbulletToken': this.params.query.token});
  if (this.params.query.code) {
    var res=HTTP.post("https://api.pushbullet.com/oauth2/token", {data: {
      grant_type:"authorization_code",
      client_id: "9MM7Y0g495GsVZ9CcgIvGKUP4t81VJQL",
      client_secret: "HzF5GiUZCHez2XajXbpEoPYQxRxkEFH7",
      code: this.params.query.code
    }});
    console.log("pushbullet respo", res);
    if (res.data && res.data.access_token &&user) {
      Meteor.users.update(user._id, {$set: {'external.pushbullet': res.data.access_token, 'external.enablepush':true, 'profile.pushbullet':true}});
    }
  }
  this.response.writeHead(302, {'Location': '/pings'});
  this.response.end();
}, {name:'api-addpushbullet', where: 'server'});