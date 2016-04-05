Router.route('/api/addPushover/:token', function() {
//this.params.query
//this.params.token
  console.log(this.params.query, this.params);
  var user=Meteor.users.findOne({'external.pushoverToken': this.params.token});
  if (user && this.params.query.pushover_user_key) {
    Meteor.users.update(user._id, {$set: {'external.pushover': this.params.query.pushover_user_key, 'external.enablepush':true, 'profile.pushover':true}});
  }
  this.response.writeHead(302, {'Location': '/pings'});
  this.response.end();
}, {name:'api-addpushover', where: 'server'});