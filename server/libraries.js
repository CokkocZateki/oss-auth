Meteor.startup(function() {
  hamster = Meteor.npmRequire('eveonlinejs');
      
  hamster.setCache(new hamster.cache.FileCache({path: '/tmp/hamster/'}))
         
  ejs = hamster;
  
  Future = Npm.require("fibers/future");
});