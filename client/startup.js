Meteor.startup(function() {
RavenLogger.initialize({
  client: 'https://ff1d6c7db87049f6bbd17f6140c92205@sentry.oss.rocks/4',            // Do not include your private key here
},{
  trackUser: true
});
RavenLogger.log('Testing client error message');
});
