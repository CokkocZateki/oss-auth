var filter={};
if (Meteor.user() && !Meteor.user().hasRole("Admin")) {   
  filter['roles.'+Meteor.user().group(true)]={"$in": ["Member"]};
};


Template.member.handle = Meteor.subscribeWithPagination('membersPaged', Session.get("filter.username"), 40);

Template.member.members = Meteor.users.find(filter, {sort: {username:1}, limit: Template.member.handle.limit()});

Template.member.rendered = function() {
  $(window).scroll(function() {
    if($(window).scrollTop() + $(window).height() > $(document).height() - 100 && Template.member.handle.ready()) {
      Template.member.handle.loadNextPage();
    }
  });
}

Template.member.changed = new Tracker.Dependency;

Template.member.events({
  'change #filterName, keypress #filterName': function(e, template) {
    //console.log(e, template);
    if (e.target.value==Session.get("filter.username")) return;
    Session.set("filter.username", e.target.value);
    
    if (e.target.value) {
      filter.username=new RegExp('.*' + e.target.value + '.*', 'i');
    } else {
      delete filter.username;
    }
    Template.member.changed.changed();
    Template.member.handle = Meteor.subscribeWithPagination('membersPaged', Session.get("filter.username"), 40);
  },
  'submit .filterMembers': function(e) {
    e.preventDefault();
  }
});

Template.member.helpers({
  loading: function() {
    return !!!Template.member.handle.ready();
  },
  members: function() {
    Template.member.changed.depend();
    return Meteor.users.find(filter, {sort: {username:1}, limit: Template.member.handle.limit()});
    //Template.member.members;
  },
  characters: function() {
    return _.pluck(Characters.find({_u: this._id}).fetch(), "characterName");
  }
});