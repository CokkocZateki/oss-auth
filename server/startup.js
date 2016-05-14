Meteor.startup(function() {
_=lodash;
process.env.MAIL_URL = Meteor.settings.email.smtp;
Accounts.emailTemplates.from = Meteor.settings.email.from;

Apis._ensureIndex({"_u":1});
Characters._ensureIndex({"_u":1});
Characters._ensureIndex({"api":1});
Reimbursements._ensureIndex({"_u":1});
Characters._ensureIndex({"corporationID":1});
Reimbursements._ensureIndex({'victim.corporation.id_str':1});
Reimbursements._ensureIndex({'killID':1 });
Meteor.users._ensureIndex({'_id':1 });
Meteor.users._ensureIndex({'username':1 });


RavenLogger.initialize({
  server: 'https://ff1d6c7db87049f6bbd17f6140c92205:ce908273302844b086e92706c79240b8@sentry.oss.rocks/4' // *DO* include your private key here
},{
  trackUser: true,
  patchGlobal: function() {
    console.log('Bye, bye, world, execution exiting...');
    process.exit(1);
  }
});
RavenLogger.log('Testing error message');

Meteor.onConnection(function(conn) {
    
});

if (0 && !Corporations.find().count()) {
  updateAlliances();
  updateContacts()
  updateAlliance();
}




SyncedCron.start();
});
